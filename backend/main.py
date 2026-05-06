"""
vitqa - AI Music Humanizer Backend
FastAPI server with user auth, payment verification, and audio processing.
"""

import os
import json
import hashlib
import sqlite3
import time
import uuid
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import jwt
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from audio_processor import process_audio, allowed_file, cleanup_old_files, UPLOAD_DIR, OUTPUT_DIR

# ─── Config ────────────────────────────────────────────────────────────────────
JWT_SECRET = os.environ.get("JWT_SECRET", "vitqa-jwt-secret-change-in-production-2026")
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 720  # 30 days
USDT_PRICE = 20  # USDT for permanent membership
USDT_WALLET = os.environ.get(
    "USDT_WALLET",
    "TXYZ1234567890AbCdEfGhIjKlMnOpQrStUvWxYz"  # Replace with real TRC-20 address
)
TRONGRID_API = "https://api.trongrid.io"

DB_PATH = Path(__file__).parent / "vitqa.db"
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(title="vitqa", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ─── Database ──────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS nonces (
            wallet_address TEXT PRIMARY KEY,
            nonce TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()
    conn = get_db()
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            password_hash TEXT DEFAULT '',
            wallet_address TEXT UNIQUE,
            is_member INTEGER DEFAULT 0,
            member_until TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            conversions INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS conversions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            input_filename TEXT NOT NULL,
            output_filename TEXT NOT NULL,
            duration_seconds REAL,
            file_size_mb REAL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tx_hash TEXT UNIQUE NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            verified_at TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS nonces (
            wallet_address TEXT PRIMARY KEY,
            nonce TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


# ─── Auth Helpers ──────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ─── Wallet Auth (Ethereum/Tron) ────────────────────────────────
def generate_nonce() -> str:
    """Generate a random nonce for wallet challenge."""
    return uuid.uuid4().hex[:16]


def verify_eth_signature(wallet_address: str, message: str, signature: str) -> bool:
    """
    Verify an Ethereum/Tron personal_sign signature.
    """
    try:
        from eth_account.messages import encode_defunct
        from eth_account import Account
        message_hash = encode_defunct(text=message)
        recovered = Account.recover_message(message_hash, signature=signature)
        return recovered.lower() == wallet_address.lower()
    except Exception:
        return False


NONCES = {}  # wallet_address -> nonce (in-memory, survives restarts via DB)


def create_token(user_id: int, email: str = "", wallet_address: str = "") -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "wallet": wallet_address,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")


def get_current_user(authorization: str = Query("", alias="token")):
    if not authorization:
        raise HTTPException(401, "No authorization token")
    return verify_token(authorization)


def require_member(user: dict = Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT is_member, member_until FROM users WHERE id = ?",
                       (user["user_id"],)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "User not found")
    if not row["is_member"]:
        raise HTTPException(403, "Membership required")
    if row["member_until"] and row["member_until"] != "permanent":
        until = datetime.fromisoformat(row["member_until"])
        if datetime.utcnow() > until:
            conn = get_db()
            conn.execute("UPDATE users SET is_member=0 WHERE id=?",
                         (user["user_id"],))
            conn.commit()
            conn.close()
            raise HTTPException(403, "Membership expired")
    return user


def check_member(token_str: str) -> dict:
    """Manually verify token and membership (for non-DI endpoints)."""
    user = get_current_user(token_str)
    return require_member(user)


# ─── API Routes ────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "vitqa", "version": "1.0.0"}


# ─── Wallet Auth ───────────────────────────────────────────────────────────────
@app.post("/api/wallet/nonce")
def wallet_nonce(wallet_address: str = Form(...)):
    """Get a nonce to sign for wallet authentication."""
    if not wallet_address or len(wallet_address) < 10:
        raise HTTPException(400, "Invalid wallet address")
    nonce = generate_nonce()
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO nonces (wallet_address, nonce, created_at) VALUES (?, ?, datetime('now'))",
        (wallet_address.lower(), nonce)
    )
    conn.commit()
    conn.close()
    NONCES[wallet_address.lower()] = nonce
    return {
        "nonce": nonce,
        "message": f"Sign this message to authenticate with vitqa: {nonce}"
    }


@app.post("/api/wallet/login")
def wallet_login(wallet_address: str = Form(...), signature: str = Form(...)):
    """Authenticate with wallet signature (Ethereum/Tron personal_sign)."""
    wallet_key = wallet_address.lower()

    # Get nonce
    conn = get_db()
    row = conn.execute(
        "SELECT nonce, created_at FROM nonces WHERE wallet_address = ?",
        (wallet_key,)
    ).fetchone()
    if not row:
        conn.close()
        raise HTTPException(400, "No nonce requested. Call /api/wallet/nonce first.")

    # Check nonce expiry (5 minutes)
    created = datetime.fromisoformat(row["created_at"])
    if datetime.utcnow() - created > timedelta(minutes=5):
        conn.execute("DELETE FROM nonces WHERE wallet_address = ?", (wallet_key,))
        conn.commit()
        conn.close()
        raise HTTPException(400, "Nonce expired. Request a new one.")

    nonce = row["nonce"]
    message = f"Sign this message to authenticate with vitqa: {nonce}"

    # Verify signature
    if not verify_eth_signature(wallet_key, message, signature):
        conn.close()
        raise HTTPException(401, "Signature verification failed")

    # Consume nonce
    conn.execute("DELETE FROM nonces WHERE wallet_address = ?", (wallet_key,))

    # Find or create user
    user = conn.execute(
        "SELECT id, email, wallet_address, is_member, member_until FROM users WHERE wallet_address = ?",
        (wallet_key,)
    ).fetchone()

    if user:
        user_id = user["id"]
        email = user["email"] or ""
        is_member = bool(user["is_member"])
        member_until = user["member_until"]
    else:
        # Create new user with wallet
        conn.execute(
            "INSERT INTO users (wallet_address) VALUES (?)",
            (wallet_key,)
        )
        conn.commit()
        user_id = conn.execute(
            "SELECT id FROM users WHERE wallet_address = ?", (wallet_key,)
        ).fetchone()["id"]
        email = ""
        is_member = False
        member_until = None

    conn.close()

    token = create_token(user_id, email, wallet_key)
    return {
        "token": token,
        "user_id": user_id,
        "wallet_address": wallet_key,
        "is_member": is_member,
        "member_until": member_until
    }


@app.post("/api/register")
def register(email: str = Form(...), password: str = Form(...)):
    if not email or not password:
        raise HTTPException(400, "Email and password required")
    if len(password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, hash_password(password))
        )
        conn.commit()
        user = conn.execute(
            "SELECT id, email FROM users WHERE email = ?", (email,)
        ).fetchone()
        token = create_token(user["id"], user["email"])
        return {"token": token, "email": email, "user_id": user["id"]}
    except sqlite3.IntegrityError:
        raise HTTPException(409, "Email already registered")
    finally:
        conn.close()


@app.post("/api/login")
def login(email: str = Form(...), password: str = Form(...)):
    conn = get_db()
    user = conn.execute(
        "SELECT id, email, password_hash, is_member, member_until, wallet_address FROM users WHERE email = ?",
        (email,)
    ).fetchone()
    conn.close()
    if not user or user["password_hash"] != hash_password(password):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {
        "token": token,
        "email": user["email"],
        "user_id": user["id"],
        "is_member": bool(user["is_member"]),
        "member_until": user["member_until"],
        "wallet_address": user["wallet_address"]
    }


@app.get("/api/profile")
def profile(token: str = Query(...)):
    user = get_current_user(token)
    conn = get_db()
    row = conn.execute(
        """SELECT id, email, is_member, member_until,
                  wallet_address, conversions, created_at
           FROM users WHERE id = ?""",
        (user["user_id"],)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404)
    return {
        "id": row["id"],
        "email": row["email"],
        "is_member": bool(row["is_member"]),
        "member_until": row["member_until"],
        "wallet_address": row["wallet_address"],
        "conversions": row["conversions"],
        "created_at": row["created_at"]
    }


@app.post("/api/connect-wallet")
def connect_wallet(token: str = Query(...), wallet_address: str = Form(...)):
    user = get_current_user(token)
    if not wallet_address or len(wallet_address) < 10:
        raise HTTPException(400, "Invalid wallet address")
    conn = get_db()
    conn.execute(
        "UPDATE users SET wallet_address = ? WHERE id = ?",
        (wallet_address, user["user_id"])
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "wallet_address": wallet_address}


@app.get("/api/payment-info")
def payment_info():
    """Get payment details for membership purchase."""
    return {
        "price_usdt": USDT_PRICE,
        "wallet_address": USDT_WALLET,
        "network": "TRC-20",
        "currency": "USDT",
        "description": f"vitqa Permanent Membership - {USDT_PRICE} USDT"
    }


@app.post("/api/verify-payment")
def verify_payment(token: str = Query(...), tx_hash: str = Form(...)):
    """Verify a USDT TRC-20 transaction to the specified wallet."""
    user = get_current_user(token)

    if not tx_hash:
        raise HTTPException(400, "Transaction hash required")

    # Check if already verified
    conn = get_db()
    existing = conn.execute(
        "SELECT id, status FROM payments WHERE tx_hash = ?", (tx_hash,)
    ).fetchone()
    if existing:
        if existing["status"] == "confirmed":
            # Already used - grant membership
            conn.execute(
                "UPDATE users SET is_member = 1, member_until = ? WHERE id = ?",
                ("permanent", user["user_id"])
            )
            conn.commit()
            conn.close()
            return {"status": "ok", "message": "Membership activated!", "is_member": True}
        else:
            conn.close()
            return {"status": "pending", "message": "Transaction is being verified"}

    # Try to verify via Trongrid API
    try:
        resp = requests.get(
            f"{TRONGRID_API}/v1/transactions/{tx_hash}",
            timeout=15
        )
        if resp.status_code == 200:
            data = resp.json()
            tx_data = data.get("data", [{}])[0] if data.get("data") else {}

            # Extract transaction details
            raw_data = tx_data.get("raw_data", {})
            contract = raw_data.get("contract", [{}])[0] if raw_data.get("contract") else {}
            parameter = contract.get("parameter", {}).get("value", {})
            to_address = parameter.get("to_address", "")
            # Handle TRC-20 transfers which are in the internal_txns or log
            value = parameter.get("amount", 0)

            is_trc20 = False
            # Check if this is a TRC-20 USDT transfer
            for log in tx_data.get("log", []):
                if "USDT" in json.dumps(log) or "a9059cbb" in json.dumps(log.get("data", "")):
                    is_trc20 = True
                    # Extract transfer value (TRC-20 has 6 decimals for USDT)
                    data_hex = log.get("data", "")
                    if len(data_hex) >= 64:
                        value_hex = data_hex[-64:]
                        value = int(value_hex, 16) / 1_000_000  # USDT has 6 decimals
                    to_addr = "41" + data_hex[32:72] if len(data_hex) >= 72 else ""
                    break

            # Verify amount and recipient
            amount_ok = value >= USDT_PRICE
            addr_ok = is_trc20 or to_address.upper() == USDT_WALLET.upper().replace("0x", "41").replace("T", "41")

            if amount_ok:
                # Record payment
                conn.execute(
                    "INSERT INTO payments (user_id, tx_hash, amount, status, verified_at) VALUES (?, ?, ?, 'confirmed', datetime('now'))",
                    (user["user_id"], tx_hash, float(value))
                )
                # Grant permanent membership
                conn.execute(
                    "UPDATE users SET is_member = 1, member_until = 'permanent' WHERE id = ?",
                    (user["user_id"],)
                )
                conn.commit()
                conn.close()
                return {
                    "status": "ok",
                    "message": f"Payment confirmed! {float(value)} USDT received. Membership activated!",
                    "is_member": True,
                    "amount": float(value)
                }

        # Fallback: manual verification pending
        conn.execute(
            "INSERT INTO payments (user_id, tx_hash, amount, status) VALUES (?, ?, ?, 'pending')",
            (user["user_id"], tx_hash, USDT_PRICE)
        )
        conn.commit()
        conn.close()
        return {
            "status": "pending",
            "message": "Transaction recorded for manual verification. We'll activate your membership once confirmed."
        }

    except Exception as e:
        conn.close()
        # Record as pending for manual review
        conn = get_db()
        conn.execute(
            "INSERT INTO payments (user_id, tx_hash, amount, status) VALUES (?, ?, ?, 'pending')",
            (user["user_id"], tx_hash, USDT_PRICE)
        )
        conn.commit()
        conn.close()
        return {
            "status": "pending",
            "message": "Transaction submitted for verification. Membership will be activated shortly."
        }


@app.post("/api/upload")
def upload_audio(token: str = Query(...), file: UploadFile = File(...)):
    """Upload audio file for processing (members only)."""
    user = check_member(token)

    if not allowed_file(file.filename or ""):
        raise HTTPException(400, "Unsupported file format. Supported: WAV, MP3, FLAC, M4A, OGG, AAC")

    # Check file size (max 100MB)
    content = file.file.read()
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(400, "File too large. Maximum 100MB")

    # Save upload
    ext = file.filename.rsplit(".", 1)[-1]
    upload_id = uuid.uuid4().hex[:12]
    input_filename = f"{upload_id}.{ext}"
    input_path = str(UPLOAD_DIR / input_filename)

    with open(input_path, "wb") as f:
        f.write(content)

    return {
        "status": "ok",
        "upload_id": upload_id,
        "filename": file.filename,
        "size_mb": round(len(content) / (1024 * 1024), 2),
        "filepath": input_path
    }


@app.post("/api/convert")
def convert_audio(
    token: str = Query(...),
    upload_id: str = Form(...),
    mode: str = Form("standard")
):
    """Run the HPSS conversion pipeline (members only)."""
    user = check_member(token)

    # Find uploaded file
    input_path = None
    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(upload_id):
            input_path = str(f)
            break

    if not input_path:
        raise HTTPException(404, "Upload not found. Please upload first.")

    # Determine pipeline parameters based on mode
    if mode == "aggressive":
        params = {
            "vocal_ratio": 0.16,
            "background_bitrate": "32k",
            "output_bitrate": "128k",
            "mix_vocal_gain": 1.0,
            "mix_bg_gain": 0.3
        }
    elif mode == "gentle":
        params = {
            "vocal_ratio": 0.30,
            "background_bitrate": "64k",
            "output_bitrate": "192k",
            "mix_vocal_gain": 2.0,
            "mix_bg_gain": 0.5
        }
    else:  # standard (v2 optimized)
        params = {
            "vocal_ratio": 0.24,
            "background_bitrate": "48k",
            "output_bitrate": "128k",
            "mix_vocal_gain": 1.6,
            "mix_bg_gain": 0.4
        }

    # Run pipeline
    result = process_audio(input_path, **params)

    if result["status"] == "error":
        raise HTTPException(500, result["error"])

    # Record conversion
    conn = get_db()
    conn.execute(
        """INSERT INTO conversions
           (user_id, input_filename, output_filename, duration_seconds, file_size_mb)
           VALUES (?, ?, ?, ?, ?)""",
        (user["user_id"], os.path.basename(input_path),
         result["output_filename"], result["duration_seconds"], result["size_mb"])
    )
    conn.execute(
        "UPDATE users SET conversions = conversions + 1 WHERE id = ?",
        (user["user_id"],)
    )
    conn.commit()
    conn.close()

    # Cleanup uploaded file
    try:
        os.unlink(input_path)
    except Exception:
        pass

    return {
        "status": "success",
        "job_id": result["output_filename"].replace("vitqa_", "").replace(".mp3", ""),
        "duration_seconds": result["duration_seconds"],
        "file_size_mb": result["size_mb"],
        "download_url": f"/api/download/{result['output_filename']}",
        "parameters": params
    }


@app.get("/api/download/{filename}")
def download_audio(filename: str, token: str = Query(...)):
    """Download a processed audio file."""
    user = check_member(token)
    filepath = OUTPUT_DIR / filename
    if not filepath.exists():
        raise HTTPException(404, "File not found or expired")
    return FileResponse(
        str(filepath),
        media_type="audio/mpeg",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.get("/api/history")
def conversion_history(token: str = Query(...)):
    """Get user's conversion history."""
    user = check_member(token)
    conn = get_db()
    rows = conn.execute(
        """SELECT id, input_filename, output_filename,
                  duration_seconds, file_size_mb, created_at
           FROM conversions WHERE user_id = ?
           ORDER BY created_at DESC LIMIT 50""",
        (user["user_id"],)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# Serve frontend at root
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    """Serve frontend SPA - fallback to index.html for all routes."""
    filepath = FRONTEND_DIR / full_path
    if filepath.exists() and filepath.is_file():
        return FileResponse(str(filepath))
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return HTMLResponse(index_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>vitqa</h1><p>Frontend not built. Run: cd frontend && python -m http.server</p>")


# ─── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    init_db()
    UPLOAD_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"vitqa started | USDT: {USDT_WALLET} | Price: {USDT_PRICE} USDT")


@app.on_event("shutdown")
def shutdown():
    cleanup_old_files(1)  # Clean files older than 1 hour on shutdown


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
