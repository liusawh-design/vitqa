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
import re
import secrets
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import jwt
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from audio_processor import process_audio, allowed_file, cleanup_old_files, UPLOAD_DIR, OUTPUT_DIR

# ─── Config ────────────────────────────────────────────────────────────────────
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_urlsafe(32))
ADMIN_KEY = os.environ.get("ADMIN_KEY", secrets.token_urlsafe(16))
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 720  # 30 days
USDT_PRICE = 20  # USDT for permanent membership
USDT_WALLET = os.environ.get("USDT_WALLET", "TBjQRf2DY1Vxi9yrvKYhifumcuz8rUrcwm")
TRONGRID_API = "https://api.trongrid.io"
MAX_CONVERSIONS_PER_DAY = 50  # per-user limit
RATE_LIMIT_PER_MINUTE = 20  # requests per minute per IP

DB_PATH = Path(__file__).parent / "vitqa.db"
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(title="vitqa", version="1.0.0")

# ─── CORS: tightly restricted ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://vitqa.com",
        "https://vitqa.com",
        "http://www.vitqa.com",
        "https://www.vitqa.com",
        "http://43.133.209.20:5003",
        "http://localhost:5003",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "token"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ─── Rate Limiting (in-memory, simple IP-based) ──────────────
rate_limit_store: dict[str, list[float]] = {}

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60.0  # 1 minute
    hits = rate_limit_store.get(client_ip, [])
    # Remove old entries
    hits = [t for t in hits if now - t < window]
    if len(hits) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(429, "Too many requests. Please slow down.")
    hits.append(now)
    rate_limit_store[client_ip] = hits


# ─── Database ──────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
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
            conversions_today INTEGER DEFAULT 0,
            last_conversion_date TEXT,
            total_conversions INTEGER DEFAULT 0,
            is_admin INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS conversions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            input_filename TEXT NOT NULL,
            output_filename TEXT NOT NULL,
            duration_seconds REAL,
            file_size_mb REAL,
            mode TEXT DEFAULT 'standard',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tx_hash TEXT UNIQUE NOT NULL,
            amount REAL NOT NULL,
            wallet_sender TEXT DEFAULT '',
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
        CREATE TABLE IF NOT EXISTS admin_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            details TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


# ─── Auth Helpers ──────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ─── Wallet Auth ──────────────────────────────────────────────
def generate_nonce() -> str:
    return uuid.uuid4().hex[:16]


def verify_eth_signature(wallet_address: str, message: str, signature: str) -> bool:
    try:
        from eth_account.messages import encode_defunct
        from eth_account import Account
        message_hash = encode_defunct(text=message)
        recovered = Account.recover_message(message_hash, signature=signature)
        return recovered.lower() == wallet_address.lower()
    except Exception:
        return False


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
    user = get_current_user(token_str)
    conn = get_db()
    row = conn.execute("SELECT is_member, member_until FROM users WHERE id = ?",
                       (user["user_id"],)).fetchone()
    conn.close()
    if not row or not row["is_member"]:
        raise HTTPException(403, "Membership required")
    return user


# ─── API Routes ────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "vitqa", "version": "1.0.0"}


# ─── Wallet Auth Routes ───────────────────────────────────────

@app.post("/api/wallet/nonce")
def get_nonce(wallet_address: str = Form(...)):
    """Generate a challenge nonce for wallet authentication."""
    wallet_address = wallet_address.strip()
    if not re.match(r'^0x[a-fA-F0-9]{40}$', wallet_address) and \
       not re.match(r'^T[a-zA-Z0-9]{33}$', wallet_address):
        raise HTTPException(400, "Invalid wallet address format")

    nonce = generate_nonce()
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO nonces (wallet_address, nonce, created_at) VALUES (?, ?, datetime('now'))",
        (wallet_address, nonce)
    )
    conn.commit()
    conn.close()

    message = f"vitqa Login\nWallet: {wallet_address}\nNonce: {nonce}\n\nSign this message to prove wallet ownership."
    return {"nonce": nonce, "message": message}


@app.post("/api/wallet/login")
def wallet_login(wallet_address: str = Form(...), signature: str = Form(...)):
    """Authenticate with a wallet signature."""
    wallet_address = wallet_address.strip()
    signature = signature.strip()

    conn = get_db()
    row = conn.execute(
        "SELECT nonce, created_at FROM nonces WHERE wallet_address = ?",
        (wallet_address,)
    ).fetchone()

    if not row:
        conn.close()
        raise HTTPException(401, "No nonce found. Request a nonce first.")

    # Check nonce age (5 minutes max)
    nonce_time = datetime.fromisoformat(row["created_at"])
    if datetime.utcnow() - nonce_time > timedelta(minutes=5):
        conn.execute("DELETE FROM nonces WHERE wallet_address = ?", (wallet_address,))
        conn.commit()
        conn.close()
        raise HTTPException(401, "Nonce expired. Request a new one.")

    nonce = row["nonce"]
    expected_message = f"vitqa Login\nWallet: {wallet_address}\nNonce: {nonce}\n\nSign this message to prove wallet ownership."
    message = expected_message

    if not verify_eth_signature(wallet_address, message, signature):
        # Try without extra newlines
        alt_message = f"vitqa Login\nWallet: {wallet_address}\nNonce: {nonce}\n\nSign this message to prove wallet ownership."
        if not verify_eth_signature(wallet_address, alt_message, signature):
            conn.close()
            raise HTTPException(401, "Invalid signature")

    # Delete used nonce
    conn.execute("DELETE FROM nonces WHERE wallet_address = ?", (wallet_address,))
    conn.commit()

    # Find or create user
    user = conn.execute(
        "SELECT id, wallet_address, is_member FROM users WHERE wallet_address = ?",
        (wallet_address,)
    ).fetchone()

    if user:
        user_id = user["id"]
        is_member = bool(user["is_member"])
        token = create_token(user_id=user_id, wallet_address=wallet_address)
        conn.close()
        return {
            "status": "ok",
            "token": token,
            "user_id": user_id,
            "wallet_address": wallet_address,
            "is_member": is_member,
            "message": "Welcome back!"
        }
    else:
        # Create new user
        cursor = conn.execute(
            "INSERT INTO users (wallet_address, is_member) VALUES (?, 0)",
            (wallet_address,)
        )
        user_id = cursor.lastrowid
        conn.commit()
        token = create_token(user_id=user_id, wallet_address=wallet_address)
        conn.close()
        return {
            "status": "ok",
            "token": token,
            "user_id": user_id,
            "wallet_address": wallet_address,
            "is_member": False,
            "message": "Account created!"
        }


@app.get("/api/user/status")
def user_status(token: str = Query(...)):
    """Get current user's membership status."""
    try:
        user = get_current_user(token)
        conn = get_db()
        row = conn.execute(
            "SELECT id, wallet_address, is_member, member_until, total_conversions FROM users WHERE id = ?",
            (user["user_id"],)
        ).fetchone()
        conn.close()
        if not row:
            raise HTTPException(404, "User not found")
        return {
            "wallet_address": row["wallet_address"],
            "is_member": bool(row["is_member"]),
            "member_until": row["member_until"] or "",
            "total_conversions": row["total_conversions"]
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid token")


# ─── Payment Routes ───────────────────────────────────────────

@app.get("/api/payment-info")
def payment_info():
    return {
        "price_usdt": USDT_PRICE,
        "wallet_address": USDT_WALLET,
        "network": "TRC-20",
        "currency": "USDT",
        "description": f"vitqa Permanent Membership - {USDT_PRICE} USDT"
    }


@app.post("/api/verify-payment")
def verify_payment(token: str = Query(...), tx_hash: str = Form(...)):
    """Verify a USDT TRC-20 transaction. Fully auto-verifies via Trongrid."""
    user = get_current_user(token)

    tx_hash = tx_hash.strip()
    if not tx_hash:
        raise HTTPException(400, "Transaction hash required")
    if not re.match(r'^[a-fA-F0-9]{64}$', tx_hash):
        raise HTTPException(400, "Invalid transaction hash format")

    conn = get_db()

    # Check if already verified
    existing = conn.execute(
        "SELECT id, status FROM payments WHERE tx_hash = ?", (tx_hash,)
    ).fetchone()
    if existing:
        if existing["status"] == "confirmed":
            # Already used - ensure membership is active
            conn.execute(
                "UPDATE users SET is_member=1, member_until='permanent' WHERE id=?",
                (user["user_id"],)
            )
            conn.commit()
            conn.close()
            return {"status": "ok", "message": "Membership already active!", "is_member": True}
        else:
            conn.close()
            await_verify = True
            # Try Trongrid again
            return _try_trongrid_verify(conn, user, tx_hash)

    # Try Trongrid verification
    return _try_trongrid_verify(conn, user, tx_hash)


def _try_trongrid_verify(conn, user, tx_hash: str) -> dict:
    """Attempt to verify a transaction via the Trongrid API."""
    try:
        resp = requests.get(
            f"{TRONGRID_API}/v1/transactions/{tx_hash}",
            timeout=15,
            headers={"Accept": "application/json"}
        )

        if resp.status_code == 200:
            data = resp.json()
            tx_data_list = data.get("data", [])
            if not tx_data_list:
                return _mark_pending(conn, user, tx_hash, "Transaction not found on chain")

            tx_data = tx_data_list[0]
            raw_data = tx_data.get("raw_data", {})
            contract = raw_data.get("contract", [{}])[0] if raw_data.get("contract") else {}
            parameter = contract.get("parameter", {}).get("value", {})

            receiver = parameter.get("to_address", "")
            amount_raw = parameter.get("amount", 0)
            contract_address = parameter.get("contract_address", "")

            # USDT TRC-20 contract on Tron (mainnet)
            USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"

            is_usdt = False
            transfer_amount = 0
            sender = tx_data.get("raw_data", {}).get("contract", [{}])[0].get("parameter", {}).get("value", {}).get("owner_address", "")
            if sender.startswith("41"):
                sender = "T" + sender[2:]
            elif sender.startswith("0x"):
                sender = "T" + sender[2:]

            # Check TRC-20 transfer in logs
            for log in tx_data.get("log", []):
                log_data = log.get("data", "")
                log_addr = log.get("address", "")

                # TRC-20 USDT transfer logs
                if "a9059cbb" in log_data:
                    # Transfer method signature
                    if len(log_data) >= 136:  # 4 bytes method + 32 bytes to + 32 bytes value
                        to_addr_hex = log_data[32:72]
                        value_hex = log_data[-64:]
                        to_addr_padded = "41" + to_addr_hex[24:] if len(to_addr_hex) >= 24 else to_addr_hex
                        try:
                            transfer_amount = int(value_hex, 16) / 1_000_000  # USDT 6 decimals
                        except ValueError:
                            continue

                        # Check to_address matches our wallet
                        if "TBjQRf2DY1Vxi9yrvKYhifumcuz8rUrcwm".upper() in to_addr_padded.upper() or \
                           "TBjQRf2DY1Vxi9yrvKYhifumcuz8rUrcwm".upper()[1:] in to_addr_padded.upper():
                            is_usdt = True
                            break

            if not is_usdt:
                return _mark_pending(conn, user, tx_hash, "Not a USDT transfer to our wallet")

            if transfer_amount >= USDT_PRICE:
                # Auto-confirm!
                conn.execute(
                    "INSERT OR IGNORE INTO payments (user_id, tx_hash, amount, wallet_sender, status, verified_at) VALUES (?, ?, ?, ?, 'confirmed', datetime('now'))",
                    (user["user_id"], tx_hash, transfer_amount, sender)
                )
                conn.execute(
                    "UPDATE users SET is_member=1, member_until='permanent' WHERE id=?",
                    (user["user_id"],)
                )
                conn.commit()
                conn.close()
                return {
                    "status": "ok",
                    "message": f"✅ Payment confirmed! {transfer_amount} USDT received. Permanent membership activated!",
                    "is_member": True,
                    "amount": transfer_amount,
                    "sender": sender
                }
            else:
                return _mark_pending(conn, user, tx_hash,
                    f"Amount too low: {transfer_amount} USDT (minimum {USDT_PRICE} USDT)")

        return _mark_pending(conn, user, tx_hash, "Trongrid API error, pending manual review")

    except requests.exceptions.RequestException as e:
        return _mark_pending(conn, user, tx_hash, f"Network error: {str(e)[:50]}")
    except Exception as e:
        return _mark_pending(conn, user, tx_hash, f"Verification error: {str(e)[:50]}")


def _mark_pending(conn, user, tx_hash: str, reason: str = "") -> dict:
    """Record a pending payment for manual review."""
    try:
        conn.execute(
            "INSERT OR IGNORE INTO payments (user_id, tx_hash, amount, status) VALUES (?, ?, ?, 'pending')",
            (user["user_id"], tx_hash, USDT_PRICE)
        )
        conn.commit()
    except Exception:
        pass
    conn.close()
    return {
        "status": "pending",
        "message": f"⏳ Transaction recorded. Reason: {reason[:100]}. Admin will review and activate your membership.",
        "tx_hash": tx_hash
    }


# ─── File Upload ──────────────────────────────────────────────

@app.post("/api/upload")
async def upload_audio(request: Request, token: str = Query(...), file: UploadFile = File(...)):
    """Upload audio file for processing (members only)."""
    check_rate_limit(request)
    user = check_member(token)

    if not file or not file.filename:
        raise HTTPException(400, "No file provided")

    filename = file.filename
    if not allowed_file(filename or ""):
        raise HTTPException(400, "Unsupported format. Allowed: WAV, MP3, FLAC, M4A, OGG, AAC")

    # Read with size check
    content = await file.read()
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(400, "File too large. Maximum 100MB")

    # Validate file header (basic magic bytes check)
    if len(content) > 12:
        header = content[:12]
        valid_headers = [b'RIFF', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2', b'fLaC', b'ftypM4A',
                         b'ftypmp4', b'ftypisom', b'OggS', b'\xff\xf1']
        if not any(content.startswith(h) for h in valid_headers):
            # Allow some formats without strict checking
            ext = filename.rsplit('.', 1)[-1].lower()
            if ext not in ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'aac', 'mp4', 'wma']:
                raise HTTPException(400, "Invalid file format (magic bytes mismatch)")

    # Daily conversion limit
    today = datetime.utcnow().strftime("%Y-%m-%d")
    conn = get_db()
    user_row = conn.execute(
        "SELECT conversions_today, last_conversion_date FROM users WHERE id=?",
        (user["user_id"],)
    ).fetchone()

    if user_row:
        if user_row["last_conversion_date"] == today and user_row["conversions_today"] >= MAX_CONVERSIONS_PER_DAY:
            conn.close()
            raise HTTPException(429, f"Daily limit ({MAX_CONVERSIONS_PER_DAY} conversions) reached")

    conn.close()

    # Save file with sanitized name
    ext = filename.rsplit(".", 1)[-1].lower()
    ext = ext.replace("..", "").replace("/", "").replace("\\", "")
    upload_id = uuid.uuid4().hex[:12]
    safe_filename = f"{upload_id}.{ext}"
    input_path = UPLOAD_DIR / safe_filename

    with open(str(input_path), "wb") as f:
        f.write(content)

    return {
        "status": "ok",
        "upload_id": upload_id,
        "filename": filename,
        "size_mb": round(len(content) / (1024 * 1024), 2)
    }


# ─── Convert ──────────────────────────────────────────────────

@app.post("/api/convert")
async def convert_audio(
    request: Request,
    token: str = Query(...),
    upload_id: str = Form(...),
    mode: str = Form("standard")
):
    """Run the HPSS conversion pipeline (members only)."""
    check_rate_limit(request)
    user = check_member(token)

    # Validate mode
    if mode not in ("standard", "gentle", "aggressive"):
        raise HTTPException(400, "Invalid mode. Choose: standard, gentle, aggressive")

    # Find uploaded file
    input_path = None
    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(upload_id):
            input_path = str(f)
            break

    if not input_path:
        raise HTTPException(404, "Upload not found. Please upload first.")

    # Pipeline params
    params = {
        "standard": {"vocal_ratio": 0.24, "background_bitrate": "48k", "output_bitrate": "128k",
                      "mix_vocal_gain": 1.6, "mix_bg_gain": 0.4},
        "gentle": {"vocal_ratio": 0.30, "background_bitrate": "64k", "output_bitrate": "192k",
                    "mix_vocal_gain": 2.0, "mix_bg_gain": 0.5},
        "aggressive": {"vocal_ratio": 0.16, "background_bitrate": "32k", "output_bitrate": "128k",
                        "mix_vocal_gain": 1.0, "mix_bg_gain": 0.3}
    }[mode]

    result = process_audio(input_path, **params)
    if result["status"] == "error":
        raise HTTPException(500, result["error"])

    # Update daily counters
    today = datetime.utcnow().strftime("%Y-%m-%d")
    conn = get_db()
    conn.execute(
        "INSERT INTO conversions (user_id, input_filename, output_filename, duration_seconds, file_size_mb, mode) VALUES (?, ?, ?, ?, ?, ?)",
        (user["user_id"], os.path.basename(input_path),
         result["output_filename"], result["duration_seconds"], result["size_mb"], mode)
    )
    conn.execute(
        "UPDATE users SET total_conversions = total_conversions + 1, conversions_today = CASE WHEN last_conversion_date = ? THEN conversions_today + 1 ELSE 1 END, last_conversion_date = ? WHERE id = ?",
        (today, today, user["user_id"])
    )
    conn.commit()
    conn.close()

    # Cleanup upload
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
def download_audio(request: Request, filename: str, token: str = Query(...)):
    """Download processed audio."""
    check_rate_limit(request)
    user = check_member(token)

    # Sanitize path - prevent path traversal
    safe_name = os.path.basename(filename)
    filepath = OUTPUT_DIR / safe_name
    if not filepath.exists():
        raise HTTPException(404, "File not found. Downloads expire after 1 hour.")
    return FileResponse(
        str(filepath),
        media_type="audio/mpeg",
        filename=safe_name,
        headers={"Content-Disposition": f'attachment; filename="{safe_name}"',
                 "X-Content-Type-Options": "nosniff"}
    )


@app.get("/api/history")
def conversion_history(token: str = Query(...)):
    """Get user's conversion history."""
    user = require_member(get_current_user(token))
    conn = get_db()
    rows = conn.execute(
        "SELECT id, input_filename, output_filename, duration_seconds, file_size_mb, mode, created_at FROM conversions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        (user["user_id"],)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── Admin Panel ──────────────────────────────────────────────

def verify_admin(request: Request):
    """Verify admin key from header or query param."""
    admin_key = request.headers.get("X-Admin-Key", "")
    if not admin_key:
        admin_key = request.query_params.get("admin_key", "")
    if admin_key != ADMIN_KEY:
        raise HTTPException(403, "Invalid admin key")
    return True


@app.get("/api/admin/dashboard")
def admin_dashboard(request: Request):
    """Admin: get dashboard stats."""
    verify_admin(request)
    conn = get_db()

    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_members = conn.execute("SELECT COUNT(*) FROM users WHERE is_member=1").fetchone()[0]
    total_conversions = conn.execute("SELECT SUM(total_conversions) FROM users").fetchone()[0] or 0
    pending_payments = conn.execute("SELECT COUNT(*) FROM payments WHERE status='pending'").fetchone()[0]
    total_payments = conn.execute("SELECT COUNT(*) FROM payments WHERE status='confirmed'").fetchone()[0]
    total_revenue = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status='confirmed'").fetchone()[0]

    recent_payments = conn.execute(
        "SELECT p.id, p.user_id, p.tx_hash, p.amount, p.wallet_sender, p.status, p.created_at FROM payments p ORDER BY p.created_at DESC LIMIT 20"
    ).fetchall()

    recent_users = conn.execute(
        "SELECT id, wallet_address, is_member, member_until, total_conversions, created_at FROM users ORDER BY created_at DESC LIMIT 20"
    ).fetchall()

    conn.close()

    return {
        "stats": {
            "total_users": total_users,
            "total_members": total_members,
            "total_conversions": total_conversions,
            "pending_payments": pending_payments,
            "total_payments": total_payments,
            "total_revenue_usdt": total_revenue
        },
        "pending_payments_list": [
            {"id": p["id"], "user_id": p["user_id"], "tx_hash": p["tx_hash"],
             "amount": p["amount"], "sender": p["wallet_sender"] or "n/a",
             "status": p["status"], "created_at": p["created_at"]}
            for p in recent_payments
        ],
        "recent_users": [
            {"id": u["id"], "wallet": u["wallet_address"][:12] + "...",
             "is_member": bool(u["is_member"]), "conversions": u["total_conversions"],
             "created_at": u["created_at"]}
            for u in recent_users
        ]
    }


@app.post("/api/admin/confirm-payment")
def admin_confirm_payment(request: Request, payment_id: int = Form(...), user_id: int = Form(...)):
    """Admin: manually confirm a pending payment."""
    verify_admin(request)
    conn = get_db()
    conn.execute("UPDATE payments SET status='confirmed', verified_at=datetime('now') WHERE id=? AND user_id=?",
                 (payment_id, user_id))
    conn.execute("UPDATE users SET is_member=1, member_until='permanent' WHERE id=?",
                 (user_id,))
    conn.execute(
        "INSERT INTO admin_logs (action, details) VALUES ('confirm_payment', ?)",
        (f"Payment #{payment_id} for user #{user_id}",)
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "message": "Membership activated!"}


@app.post("/api/admin/revoke-membership")
def admin_revoke_membership(request: Request, user_id: int = Form(...)):
    """Admin: revoke a user's membership."""
    verify_admin(request)
    conn = get_db()
    conn.execute("UPDATE users SET is_member=0, member_until=NULL WHERE id=?",
                 (user_id,))
    conn.execute(
        "INSERT INTO admin_logs (action, details) VALUES ('revoke_membership', ?)",
        (f"User #{user_id} membership revoked",)
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "message": "Membership revoked"}


@app.get("/api/admin/members")
def admin_members(request: Request):
    """Admin: list all members."""
    verify_admin(request)
    conn = get_db()
    rows = conn.execute(
        "SELECT id, wallet_address, is_member, member_until, total_conversions, created_at FROM users ORDER BY id DESC LIMIT 100"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─── Admin Frontend Page ──────────────────────────────────────

@app.get("/admin")
def admin_page():
    """Serve the admin dashboard HTML."""
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>vitqa 管理后台</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    background: #0a0a1a;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
}}
.login-screen {{
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh;
}}
.login-box {{
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
}}
.login-box h1 {{ font-size: 24px; margin-bottom: 8px; }}
.login-box p {{ color: #888; margin-bottom: 24px; }}
input {{
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    color: #e0e0e0;
    font-size: 14px;
    margin-bottom: 12px;
}}
input:focus {{ outline: none; border-color: #6c5ce7; }}
button {{
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #6c5ce7, #a855f7);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}}
button:hover {{ opacity: 0.9; }}
.dashboard {{ display: none; padding: 24px; max-width: 1200px; margin: 0 auto; }}
.stats-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}}
.stat-card {{
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 20px;
}}
.stat-card h3 {{ font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }}
.stat-card .value {{ font-size: 28px; font-weight: 700; margin-top: 8px; }}
.section {{ margin-bottom: 32px; }}
.section h2 {{ font-size: 18px; margin-bottom: 16px; color: #ccc; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }}
table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
th {{ text-align: left; padding: 10px 12px; background: rgba(255,255,255,0.05); color: #888; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }}
td {{ padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }}
.pending {{ color: #f59e0b; }}
.confirmed {{ color: #10b981; }}
.btn-sm {{
    padding: 5px 12px;
    background: #10b981;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 11px;
    cursor: pointer;
}}
.btn-danger {{
    background: #ef4444;
}}
.error {{ color: #ef4444; font-size: 13px; margin-top: 8px; display: none; }}
.logout {{ float: right; background: rgba(255,255,255,0.1); padding: 8px 16px; border: none; border-radius: 6px; color: #e0e0e0; cursor: pointer; }}
</style>
</head>
<body>
<div class="login-screen" id="loginScreen">
    <div class="login-box">
        <h1>🔐 vitqa 管理</h1>
        <p>输入你的 Admin Key 进入后台</p>
        <input type="password" id="adminKeyInput" placeholder="Admin Key" onkeydown="if(event.key==='Enter')login()">
        <div class="error" id="loginError">密钥错误</div>
        <button onclick="login()">登录</button>
    </div>
</div>

<div class="dashboard" id="dashboard">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1 style="font-size:22px">📊 vitqa 管理后台</h1>
        <button class="logout" onclick="document.getElementById('loginScreen').style.display='flex';document.getElementById('dashboard').style.display='none'">退出</button>
    </div>

    <div class="stats-grid" id="statsGrid"></div>

    <div class="section" id="pendingSection">
        <h2>⏳ 待审核付款</h2>
        <div id="pendingTable"></div>
    </div>

    <div class="section">
        <h2>📋 最近用户</h2>
        <div id="userTable"></div>
    </div>
</div>

<script>
let adminKey = '';

function login() {{
    const key = document.getElementById('adminKeyInput').value;
    adminKey = key;
    fetchDashboard();
}}

async function fetchDashboard() {{
    try {{
        const res = await fetch('/api/admin/dashboard?admin_key=' + encodeURIComponent(adminKey));
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        renderDashboard(data);
    }} catch(e) {{
        document.getElementById('loginError').style.display = 'block';
    }}
}}

function renderDashboard(data) {{
    const s = data.stats;
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><h3>总用户</h3><div class="value">${{s.total_users}}</div></div>
        <div class="stat-card"><h3>会员</h3><div class="value" style="color:#10b981">${{s.total_members}}</div></div>
        <div class="stat-card"><h3>待审核</h3><div class="value" style="color:${{s.pending_payments > 0 ? '#f59e0b' : '#888'}}">${{s.pending_payments}}</div></div>
        <div class="stat-card"><h3>总收入</h3><div class="value" style="color:#f59e0b">${{s.total_revenue_usdt}} USDT</div></div>
        <div class="stat-card"><h3>处理次数</h3><div class="value">${{s.total_conversions}}</div></div>
        <div class="stat-card"><h3>成功付款</h3><div class="value">${{s.total_payments}}</div></div>
    `;

    // Pending payments
    const pending = data.pending_payments_list.filter(p => p.status === 'pending');
    const section = document.getElementById('pendingSection');
    if (pending.length === 0) {{
        section.style.display = 'none';
    }} else {{
        section.style.display = 'block';
        document.getElementById('pendingTable').innerHTML = `<table>
            <tr><th>ID</th><th>用户ID</th><th>Tx Hash</th><th>金额</th><th>发送者</th><th>时间</th><th>操作</th></tr>
            ${{pending.map(p => `<tr>
                <td>${{p.id}}</td>
                <td>${{p.user_id}}</td>
                <td style="font-family:monospace;font-size:11px">${{p.tx_hash.slice(0,16)}}...</td>
                <td>${{p.amount}} USDT</td>
                <td style="font-family:monospace;font-size:11px">${{p.sender.slice(0,12)}}...</td>
                <td>${{p.created_at}}</td>
                <td><button class="btn-sm" onclick="confirmPayment(${{p.id}},${{p.user_id}})">确认</button></td>
            </tr>`).join('')}
        </table>`;
    }}

    // Users
    document.getElementById('userTable').innerHTML = `<table>
        <tr><th>ID</th><th>钱包</th><th>会员</th><th>转换次数</th><th>注册时间</th><th>操作</th></tr>
        ${{data.recent_users.map(u => `<tr>
            <td>${{u.id}}</td>
            <td style="font-family:monospace;font-size:11px">${{u.wallet}}</td>
            <td class="${{u.is_member ? 'confirmed' : ''}}">${{u.is_member ? '✅ 是' : '否'}}</td>
            <td>${{u.conversions}}</td>
            <td>${{u.created_at}}</td>
            <td>${{u.is_member ? `<button class="btn-sm btn-danger" onclick="revoke(${{u.id}})">撤回</button>` : ''}}</td>
        </tr>`).join('')}
    </table>`;
}}

async function confirmPayment(paymentId, userId) {{
    if (!confirm('确认这笔付款？')) return;
    const form = new FormData();
    form.append('payment_id', paymentId);
    form.append('user_id', userId);
    const res = await fetch('/api/admin/confirm-payment?admin_key=' + encodeURIComponent(adminKey), {{ method: 'POST', body: form }});
    if (res.ok) fetchDashboard();
}}

async function revoke(userId) {{
    if (!confirm('撤回该用户会员？')) return;
    const form = new FormData();
    form.append('user_id', userId);
    const res = await fetch('/api/admin/revoke-membership?admin_key=' + encodeURIComponent(adminKey), {{ method: 'POST', body: form }});
    if (res.ok) fetchDashboard();
}}
</script>
</body>
</html>"""
    return HTMLResponse(html)


# ─── Frontend ─────────────────────────────────────────────────

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if full_path == "" or full_path is None:
        full_path = "index.html"
    filepath = FRONTEND_DIR / full_path
    if filepath.exists() and filepath.is_file():
        return FileResponse(str(filepath))
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return HTMLResponse(index_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>vitqa</h1><p>Frontend not found</p>")


# ─── Startup ───────────────────────────────────────────────────

@app.on_event("startup")
def startup():
    init_db()
    UPLOAD_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"vitqa started | USDT: {USDT_WALLET} | Price: {USDT_PRICE} USDT")
    print(f"Admin key: {ADMIN_KEY} (save this!)")


@app.on_event("shutdown")
def shutdown():
    cleanup_old_files(1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
