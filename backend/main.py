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
import random
import requests
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from collections import defaultdict

import jwt
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel

from audio_processor import process_audio, allowed_file, cleanup_old_files, UPLOAD_DIR, OUTPUT_DIR

# ─── Config ────────────────────────────────────────────────────────────────────
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_urlsafe(32))
ADMIN_KEY = os.environ.get("ADMIN_KEY", "vitqa-admin-2026")
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 720  # 30 days
USDT_PRICE = 20  # USDT for permanent membership
USDT_WALLET = os.environ.get("USDT_WALLET", "TBjQRf2DY1Vxi9yrvKYhifumcuz8rUrcwm")

# ─── WeChat Pay Price (XorPay) ──────────────────────────────
WECHAT_PRICE = "198.00"  # ¥198 WeChat Pay (standard)
WECHAT_PRICE_FLOAT = 198.0

# ─── Referral Discount Config ────────────────────────────────
REFERRAL_DISCOUNT_PER_STEP = 5     # 每个有效注册减5%
MAX_REFERRAL_STEPS = 10            # 最多10个 = 50%
MAX_REFERRAL_DISCOUNT = 50         # 最高折扣50%

# ─── VIP Tier Pricing ─────────────────────────────────────────
VIP_1D_PRICE = "8.80"
VIP_1D_PRICE_FLOAT = 8.8
VIP_1M_PRICE = "98.00"
VIP_1M_PRICE_FLOAT = 98.0
VIP_PERM_PRICE = "198.00"
VIP_PERM_PRICE_FLOAT = 198.0

# ─── SMTP Config ─────────────────────────────────────────────
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.qq.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "944415536@qq.com")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)


XORPAY_AID = os.environ.get("XORPAY_AID", "704401")
XORPAY_APP_SECRET = os.environ.get("XORPAY_APP_SECRET", "8b8cf7dd0cde48368019ee09bd09d8dd")
XORPAY_API = "https://xorpay.com/api/pay"  # POST to {XORPAY_API}/{aid}
TRONGRID_API = "https://api.trongrid.io"
MAX_CONVERSIONS_PER_DAY = 50  # per-user limit
FREE_TRIAL_LIMIT = 0  # no free trials, must purchase membership
RATE_LIMIT_PER_MINUTE = 20  # requests per minute per IP

DB_PATH = Path(__file__).parent / "data" / "vitqa.db"
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(title="vitqa", version="1.0.0")

# ─── Security Headers Middleware ──────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ─── CORS: tightly restricted ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://vitqa.com",
        "https://vitqa.com",
        "http://www.vitqa.com",
        "https://www.vitqa.com",
        "http://43.133.209.20:5003",
        "https://xorpay.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "token"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ─── Rate Limiting (in-memory, simple IP-based) ──────────────
rate_limit_store: dict[str, list[float]] = {}
auth_rate_limit_store: dict[str, list[float]] = {}  # Separate stricter rate limit for auth
free_trial_store: dict[str, int] = {}  # IP -> free conversions used

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


def check_auth_rate_limit(request: Request):
    """Stricter rate limit for auth endpoints: 5 requests per minute per IP."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60.0
    hits = auth_rate_limit_store.get(client_ip, [])
    hits = [t for t in hits if now - t < window]
    if len(hits) >= 5:
        raise HTTPException(429, "Too many auth attempts. Please wait.")
    hits.append(now)
    auth_rate_limit_store[client_ip] = hits


# ─── Database ──────────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def migrate_db(conn):
    """Migrate existing database to new schema."""
    try:
        conn.execute("SELECT total_conversions FROM users LIMIT 1")
    except sqlite3.OperationalError:
        conn.executescript("""
            ALTER TABLE users ADD COLUMN conversions_today INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN last_conversion_date TEXT;
            ALTER TABLE users ADD COLUMN total_conversions INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;
        """)
    try:
        conn.execute("SELECT wallet_sender FROM payments LIMIT 1")
    except sqlite3.OperationalError:
        conn.execute("ALTER TABLE payments ADD COLUMN wallet_sender TEXT DEFAULT ''")
    try:
        conn.execute("SELECT mode FROM conversions LIMIT 1")
    except sqlite3.OperationalError:
        conn.execute("ALTER TABLE conversions ADD COLUMN mode TEXT DEFAULT 'standard'")
    # Create referral tables if not exist (safe migration)
    try:
        conn.execute("SELECT id FROM referral_codes LIMIT 1")
    except sqlite3.OperationalError:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS referral_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                code TEXT NOT NULL UNIQUE,
                discount_used INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS share_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                share_type TEXT NOT NULL,
                verified INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        """)
    # Create user_referrals table if not exists (safe migration)
    try:
        conn.execute("SELECT id FROM user_referrals LIMIT 1")
    except sqlite3.OperationalError:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS user_referrals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                referred_user_id INTEGER NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (referred_user_id) REFERENCES users(id),
                UNIQUE(user_id, referred_user_id)
            );
        """)
    conn.commit()


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
        CREATE TABLE IF NOT EXISTS verification_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS referral_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            code TEXT NOT NULL UNIQUE,
            discount_used INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS share_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            share_type TEXT NOT NULL,
            verified INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS user_referrals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            referred_user_id INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (referred_user_id) REFERENCES users(id),
            UNIQUE(user_id, referred_user_id)
        );
        CREATE TABLE IF NOT EXISTS site_announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            badge TEXT DEFAULT '',
            link_url TEXT DEFAULT '',
            link_text TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    # seed default announcement (idempotent — first row only)
    existing = conn.execute("SELECT COUNT(*) FROM site_announcements").fetchone()[0]
    if existing == 0:
        conn.execute(
            "INSERT INTO site_announcements (title, content, badge, link_url, link_text) VALUES (?, ?, ?, ?, ?)",
            (
                "引擎升级 v3",
                "声码器全面重写：多频带人声分离 × 自适应降噪 × 动态压缩 × 限幅输出。音质大幅提升，码率不低于 128kbps CBR 硬性保证。同时修复了 vocal_ratio 参数无效的 Bug。",
                "🎉 重大升级",
                "#features",
                "查看详情"
            )
        )
    # Add indexes for payment queries
    conn.execute("CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_payments_user_id_status ON payments(user_id, status)")
    conn.commit()
    conn.close()


def validate_email(email: str) -> bool:
    """Validate email format and length."""
    if len(email) > 254:
        return False
    return bool(re.match(r'^[\w.+-]+@[\w.-]+\.\w{2,}$', email))


def validate_password(password: str) -> tuple[bool, str]:
    """Validate password: 6-128 chars."""
    if len(password) < 6:
        return False, "密码至少6位"
    if len(password) > 128:
        return False, "密码太长"
    return True, ""


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


@app.get("/api/announcement")
def get_announcement():
    """Return the latest active site announcement, or empty dict."""
    conn = get_db()
    row = conn.execute(
        "SELECT title, content, badge, link_url, link_text FROM site_announcements WHERE is_active=1 ORDER BY id DESC LIMIT 1"
    ).fetchone()
    conn.close()
    if not row:
        return {}
    return {
        "title": row[0],
        "content": row[1],
        "badge": row[2] or "",
        "link_url": row[3] or "",
        "link_text": row[4] or ""
    }


# ─── Email Verification ────────────────────────────────────────

def send_email(to_email: str, subject: str, body: str) -> str | None:
    """Send email via SMTP. Returns None on success, error message on failure."""
    if not SMTP_PASS:
        return "SMTP未配置，请联系管理员"
    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to_email
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, [to_email], msg.as_string())
        return None
    except Exception as e:
        # Log without exposing email
        print(f"[SMTP] Failed to send: {str(e)[:80]}")
        return f"发送失败: {str(e)[:60]}"


def generate_code(length=6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def verify_code(email: str, code: str) -> bool:
    conn = get_db()
    row = conn.execute(
        "SELECT code, created_at FROM verification_codes WHERE email = ? ORDER BY id DESC LIMIT 1",
        (email,)
    ).fetchone()
    conn.close()
    if not row:
        return False
    created = datetime.fromisoformat(row["created_at"])
    if datetime.utcnow() - created > timedelta(minutes=10):
        return False
    return row["code"] == code


@app.post("/api/send-code")
def send_verification_code(request: Request, email: str = Form(...)):
    """Send a verification code to the email."""
    check_auth_rate_limit(request)
    email = email.strip().lower()
    if not validate_email(email):
        raise HTTPException(400, "邮箱格式不正确")

    conn = get_db()
    last = conn.execute(
        "SELECT created_at FROM verification_codes WHERE email = ? ORDER BY id DESC LIMIT 1",
        (email,)
    ).fetchone()
    if last:
        last_time = datetime.fromisoformat(last["created_at"])
        if datetime.utcnow() - last_time < timedelta(seconds=60):
            conn.close()
            remaining = 60 - (datetime.utcnow() - last_time).seconds
            raise HTTPException(429, f"请 {remaining} 秒后再试")

    code = generate_code()
    conn.execute(
        "INSERT INTO verification_codes (email, code) VALUES (?, ?)",
        (email, code)
    )
    conn.commit()
    conn.close()

    subject = "vitqa 邮箱验证码"
    body = f"您的 vitqa 验证码是：{code}\n\n验证码有效期为 10 分钟，请勿泄露。\n\n—— vitqa 团队"

    err = send_email(email, subject, body)
    if err:
        print(f"[VERIFY] Code for registration: sent to email")
        return {"status": "ok", "message": "验证码已发送（请在日志中查看）", "code": code if not SMTP_PASS else None}
    return {"status": "ok", "message": "验证码已发送到您的邮箱"}


# ─── Email Auth Routes ───────────────────────────────────────

@app.post("/api/register")
def email_register(request: Request, email: str = Form(...), password: str = Form(...), code: str = Form(...), ref: str = Form(None)):
    """Register with email, password, and verification code. Optional ref=referral_code."""
    check_auth_rate_limit(request)

    email = email.strip().lower()
    if not validate_email(email):
        raise HTTPException(400, "邮箱格式不正确")

    pw_valid, pw_msg = validate_password(password)
    if not pw_valid:
        raise HTTPException(400, pw_msg)

    if not code or len(code) < 4:
        raise HTTPException(400, "请输入验证码")

    if not verify_code(email, code):
        raise HTTPException(400, "验证码错误或已过期，请重新获取")

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(400, "该邮箱已注册，请直接登录")

    pw_hash = hash_password(password)
    cursor = conn.execute(
        "INSERT INTO users (email, password_hash, is_member) VALUES (?, ?, 0)",
        (email, pw_hash)
    )
    user_id = cursor.lastrowid

    # Handle referral code if provided
    if ref:
        ref = ref.strip()
        ref_row = conn.execute(
            "SELECT user_id FROM referral_codes WHERE code = ?",
            (ref,)
        ).fetchone()
        if ref_row:
            referrer_id = ref_row["user_id"]
            # Cannot refer yourself
            if referrer_id != user_id:
                # Check duplicate
                existing_ref = conn.execute(
                    "SELECT id FROM user_referrals WHERE user_id = ? AND referred_user_id = ?",
                    (referrer_id, user_id)
                ).fetchone()
                if not existing_ref:
                    conn.execute(
                        "INSERT INTO user_referrals (user_id, referred_user_id) VALUES (?, ?)",
                        (referrer_id, user_id)
                    )

    conn.commit()
    conn.close()

    token = create_token(user_id=user_id, email=email)
    return {
        "status": "ok",
        "token": token,
        "user_id": user_id,
        "email": email,
        "is_member": False,
        "message": "注册成功！"
    }


@app.post("/api/login")
def email_login(request: Request, email: str = Form(...), password: str = Form(...)):
    """Login with email and password."""
    check_auth_rate_limit(request)
    email = email.strip().lower()

    if not validate_email(email):
        raise HTTPException(400, "邮箱格式不正确")

    pw_valid, pw_msg = validate_password(password)
    if not pw_valid:
        raise HTTPException(400, pw_msg)

    conn = get_db()
    row = conn.execute(
        "SELECT id, email, password_hash, is_member FROM users WHERE email = ?",
        (email,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(401, "邮箱未注册")
    if row["password_hash"] != hash_password(password):
        raise HTTPException(401, "密码错误")

    token = create_token(user_id=row["id"], email=row["email"])
    return {
        "status": "ok",
        "token": token,
        "user_id": row["id"],
        "email": row["email"],
        "is_member": bool(row["is_member"] or 0),
        "message": "登录成功！"
    }


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
        alt_message = f"vitqa Login\nWallet: {wallet_address}\nNonce: {nonce}\n\nSign this message to prove wallet ownership."
        if not verify_eth_signature(wallet_address, alt_message, signature):
            conn.close()
            raise HTTPException(401, "Invalid signature")

    conn.execute("DELETE FROM nonces WHERE wallet_address = ?", (wallet_address,))
    conn.commit()

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
            "SELECT id, email, wallet_address, is_member, member_until, total_conversions FROM users WHERE id = ?",
            (user["user_id"],)
        ).fetchone()
        if not row:
            conn.close()
            raise HTTPException(404, "User not found")

        # Auto-expire time-limited memberships
        member_until = row["member_until"] or ""
        is_member = bool(row["is_member"] or 0)
        membership_tier = "none"

        if member_until:
            if member_until == "permanent":
                membership_tier = "perm"
                is_member = True
            else:
                try:
                    until = datetime.fromisoformat(member_until)
                    if datetime.utcnow() > until:
                        # Expired
                        conn.execute("UPDATE users SET is_member=0 WHERE id=?", (user["user_id"],))
                        conn.commit()
                        is_member = False
                        membership_tier = "expired"
                    else:
                        # Active time-limited membership
                        is_member = True
                        days_until = (until - datetime.utcnow()).days
                        if days_until < 2:
                            membership_tier = "1d"
                        else:
                            membership_tier = "1m"
                except Exception as e:
                    print(f"[Auth] membership_tier parse error for user {user['user_id']}: {str(e)[:60]}")
                    membership_tier = "unknown"

        conn.close()
        return {
            "email": row["email"] or "",
            "wallet_address": row["wallet_address"] or "",
            "is_member": is_member,
            "member_until": member_until,
            "membership_tier": membership_tier,
            "total_conversions": row["total_conversions"]
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Invalid token")


# ─── XorPay Helpers ────────────────────────────────────────────
def xorpay_sign(*args) -> str:
    """Generate XorPay sign: MD5 of concatenated values (no separators)."""
    raw = "".join(str(a) for a in args)
    return hashlib.md5(raw.encode("utf-8")).hexdigest().lower()


def xorpay_verify_sign(aoid: str, order_id: str, pay_price: str, pay_time: str, sign: str) -> bool:
    expected = xorpay_sign(aoid, order_id, pay_price, pay_time, XORPAY_APP_SECRET)
    return expected == sign.lower()


def generate_xorpay_order_id(user_id: int, tier: str = "perm") -> str:
    ts = int(time.time())
    rand = uuid.uuid4().hex[:8]
    return f"V{user_id}T{ts}R{rand}-{tier}"


# ─── XorPay Payment Routes ───────────────────────────────────

@app.post("/api/xorpay/pay")
async def xorpay_create_order(token: str = Query(...), tier: str = Form("perm")):
    """Create a WeChat Native payment via XorPay. Returns QR code URL."""
    user = get_current_user(token)

    conn = get_db()
    row = conn.execute("SELECT is_member FROM users WHERE id = ?", (user["user_id"],)).fetchone()
    if row and row["is_member"]:
        conn.close()
        return {"status": "already_member", "message": "已经是会员了"}

    # Determine tier pricing and name
    if tier == "1d":
        price_float = VIP_1D_PRICE_FLOAT
        name = "vitqa一日VIP"
        discount_percent = 0  # No referral discount for 1D
    elif tier == "1m":
        price_float = VIP_1M_PRICE_FLOAT
        name = "vitqa一月VIP"
        discount_percent = 0  # No referral discount for 1M
    else:
        price_float = VIP_PERM_PRICE_FLOAT
        name = "vitqa永久会员"
        # Only permanent members get referral discount
        referral_count = _get_referral_count(conn, user["user_id"])
        discount_percent = _calc_discount(referral_count)

    discount_mult = (100.0 - discount_percent) / 100.0
    discounted_price = round(price_float * discount_mult, 2)

    # Clean up expired pending orders for this user (older than 1 hour)
    try:
        conn.execute(
            "DELETE FROM payments WHERE user_id=? AND status='pending' AND created_at < datetime('now', '-1 hour')",
            (user["user_id"],)
        )
        conn.commit()
    except Exception:
        pass
    conn.close()

    order_id = generate_xorpay_order_id(user["user_id"], tier)
    pay_type = "native"
    price = f"{discounted_price:.2f}"
    notify_url = "http://vitqa.com/api/xorpay/notify"
    sign = xorpay_sign(name, pay_type, price, order_id, notify_url, XORPAY_APP_SECRET)

    payload = {
        "name": name,
        "pay_type": pay_type,
        "price": price,
        "order_id": order_id,
        "notify_url": notify_url,
        "sign": sign,
        "order_uid": str(user["user_id"]),
        "more": f'{{"user_id":{user["user_id"]},"tier":"{tier}"}}',
        "expire": "3600",
    }

    try:
        resp = requests.post(
            f"{XORPAY_API}/{XORPAY_AID}",
            data=payload,
            timeout=15
        )
        result = resp.json()

        if result.get("status") == "ok":
            info = result.get("info", {})
            conn = get_db()
            try:
                conn.execute(
                    "INSERT INTO payments (user_id, tx_hash, amount, wallet_sender, status) VALUES (?, ?, ?, ?, 'pending')",
                    (user["user_id"], order_id, discounted_price, f"xorpay:{result.get('aoid','')}")
                )
                conn.commit()
            except Exception:
                pass
            conn.close()

            return {
                "status": "ok",
                "order_id": order_id,
                "aoid": result.get("aoid", ""),
                "qr_url": info.get("qr", ""),
                "expires_in": result.get("expires_in", 3600),
                "message": "微信支付二维码已生成，请用微信扫码支付"
            }
        else:
            return {"status": "error", "message": f"支付创建失败: {result.get('status','unknown')}"}

    except Exception as e:
        return {"status": "error", "message": f"系统错误"}


@app.post("/api/xorpay/notify")
async def xorpay_notify(request: Request):
    """XorPay payment callback."""
    try:
        form = await request.form()
        data = {k: v for k, v in form.items()}
    except Exception:
        return "error"

    aoid = data.get("aoid", "")
    order_id = data.get("order_id", "")
    pay_price = data.get("pay_price", "0")
    pay_time = data.get("pay_time", "")
    sign = data.get("sign", "")

    if not xorpay_verify_sign(aoid, order_id, str(pay_price), pay_time, sign):
        print(f"[XorPay] Invalid sign for order: {order_id[:20]}...")
        return "sign_error"

    try:
        parts = order_id.split("T")
        user_id = int(parts[0].lstrip("V"))
    except (ValueError, IndexError):
        return "order_id_error"

    # Determine tier from order_id suffix
    tier = "perm"
    if "-" in order_id:
        tier = order_id.split("-")[-1]

    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT id, status FROM payments WHERE tx_hash = ? AND user_id = ?",
            (order_id, user_id)
        ).fetchone()

        if existing and existing["status"] == "confirmed":
            conn.close()
            return "success"

        price_val = float(pay_price)

        # Verify price matches what was stored in the payment record
        stored_row = conn.execute(
            "SELECT amount FROM payments WHERE tx_hash=? AND user_id=?",
            (order_id, user_id)
        ).fetchone()
        if stored_row:
            expected = stored_row["amount"]
            if abs(price_val - expected) > 0.01:
                print(f"[XorPay] Price mismatch: expected {expected}, got {price_val} (order {order_id[:20]})")
                conn.close()
                return "price_error"

        conn.execute(
            "INSERT OR REPLACE INTO payments (user_id, tx_hash, amount, wallet_sender, status, verified_at) VALUES (?, ?, ?, ?, 'confirmed', datetime('now'))",
            (user_id, order_id, price_val, f"xorpay:{aoid}")
        )

        # Set member_until based on tier
        if tier == "1d":
            conn.execute(
                "UPDATE users SET is_member=1, member_until=datetime('now', '+1 day') WHERE id=?",
                (user_id,)
            )
        elif tier == "1m":
            conn.execute(
                "UPDATE users SET is_member=1, member_until=datetime('now', '+1 month') WHERE id=?",
                (user_id,)
            )
        else:
            conn.execute(
                "UPDATE users SET is_member=1, member_until='permanent' WHERE id=?",
                (user_id,)
            )

        conn.execute(
            "INSERT INTO admin_logs (action, details) VALUES ('xorpay_payment', ?)",
            (f"User #{user_id} paid via WeChat (tier={tier}, price={pay_price})",)
        )
        conn.commit()
        print(f"[XorPay] User #{user_id} payment confirmed (tier={tier})")
        conn.close()
        return "success"
    except Exception as e:
        conn.close()
        print(f"[XorPay] Error: {str(e)[:60]}")
        return "error"


@app.post("/api/xorpay/status")
async def xorpay_order_status(token: str = Query(...), order_id: str = Form(...)):
    """Check XorPay order status."""
    user = get_current_user(token)
    conn = get_db()
    row = conn.execute(
        "SELECT status, verified_at FROM payments WHERE tx_hash = ? AND user_id = ?",
        (order_id, user["user_id"])
    ).fetchone()
    conn.close()
    if not row:
        return {"status": "not_found", "message": "订单不存在"}
    if row["status"] == "confirmed":
        return {"status": "confirmed", "message": "🎉 支付成功！会员已激活！"}
    return {"status": "pending", "message": "支付处理中，请在微信确认支付"}


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
    """Verify a USDT TRC-20 transaction."""
    user = get_current_user(token)

    tx_hash = tx_hash.strip()
    if not tx_hash:
        raise HTTPException(400, "Transaction hash required")
    if not re.match(r'^[a-fA-F0-9]{64}$', tx_hash):
        raise HTTPException(400, "Invalid transaction hash format")

    conn = get_db()

    existing = conn.execute(
        "SELECT id, status FROM payments WHERE tx_hash = ?", (tx_hash,)
    ).fetchone()
    if existing:
        if existing["status"] == "confirmed":
            conn.execute(
                "UPDATE users SET is_member=1, member_until='permanent' WHERE id=?",
                (user["user_id"],)
            )
            conn.commit()
            conn.close()
            return {"status": "ok", "message": "Membership already active!", "is_member": True}
        else:
            # Don't close conn — _try_trongrid_verify takes ownership to commit/close
            return _try_trongrid_verify(conn, user, tx_hash)

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
                print(f"[Payment] USDT verify: tx {tx_hash[:16]}... not found on chain")
                return _mark_pending(conn, user, tx_hash, "Transaction not found on chain")

            tx_data = tx_data_list[0]
            raw_data = tx_data.get("raw_data", {})

            is_usdt = False
            transfer_amount = 0
            sender = ""

            # Extract sender from raw_data contract
            contract_list = raw_data.get("contract", [])
            if contract_list:
                contract = contract_list[0]
                parameter = contract.get("parameter", {}).get("value", {})
                sender_hex = parameter.get("owner_address", "")
                if sender_hex.startswith("41"):
                    sender = "T" + sender_hex[2:]
                elif sender_hex.startswith("0x"):
                    sender = "T" + sender_hex[2:]
                else:
                    sender = sender_hex

            USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
            USDT_WALLET_HEX = "41546251526632445931567869397272764b59686966756d63757a385572557263776d"

            # Parse TRC-20 transfer logs
            for log in tx_data.get("log", []):
                log_addr = log.get("address", "")
                # Check if log is from USDT contract
                if log_addr.lower() != USDT_CONTRACT.lower():
                    continue

                log_data = log.get("data", "")
                if len(log_data) < 136:
                    continue

                # TRC-20 Transfer event: to address = bytes 12..31 (20 bytes after first 12 bytes of padding)
                to_addr_hex = log_data[32:72]
                value_hex = log_data[-64:]
                to_addr_padded = "41" + to_addr_hex[24:] if len(to_addr_hex) >= 24 else "41" + to_addr_hex

                try:
                    transfer_amount = int(value_hex, 16) / 1_000_000
                except ValueError:
                    continue

                # Check if destination is our wallet
                if to_addr_padded.upper() == USDT_WALLET_HEX.upper():
                    is_usdt = True
                    break

            if not is_usdt:
                print(f"[Payment] USDT verify: tx {tx_hash[:16]}... not a USDT transfer to our wallet")
                return _mark_pending(conn, user, tx_hash, "Not a USDT transfer to our wallet")

            if transfer_amount >= USDT_PRICE:
                print(f"[Payment] USDT confirmed: {transfer_amount} USDT from {sender[:8]}... via {tx_hash[:16]}")
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
                    "message": f"Payment confirmed! {transfer_amount} USDT received. Permanent membership activated!",
                    "is_member": True,
                    "amount": transfer_amount,
                    "sender": sender
                }
            else:
                print(f"[Payment] USDT amount too low: {transfer_amount} USDT (min {USDT_PRICE})")
                return _mark_pending(conn, user, tx_hash,
                    f"Amount too low: {transfer_amount} USDT (minimum {USDT_PRICE} USDT)")

        print(f"[Payment] Trongrid API error for {tx_hash[:16]}: status {resp.status_code}")
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
    except Exception as e:
        print(f"[Payment] _mark_pending error for {tx_hash[:16]}: {str(e)[:60]}")
    conn.close()
    return {
        "status": "pending",
        "message": f"Transaction recorded. Admin will review and activate your membership.",
        "tx_hash": tx_hash
    }


# ─── Referral / Fission Routes ────────────────────────────────

def _generate_share_texts(code: str) -> dict:
    """Generate share texts for all platforms. Dynamic, not stored in DB."""
    link = f"https://vitqa.com/?ref={code}"
    return {
        "wechat": (
            f"🎵 AI音乐人必备！vitqa 帮你绕过AI检测\n"
            f"Suno/Udio生成的歌老被检测出AI味？vitqa基于HPSS技术，"
            f"只处理背景层保留人声质感，平均AI概率降到12.5%！\n"
            f"永久会员才198，通过我的链接注册还能享折扣👇\n"
            f"{link}"
        ),
        "moments": (
            f"🔥 发现个宝藏工具 vitqa！AI音乐人的福音\n"
            f"HPSS谐波分离技术，Suno/Udio歌曲一键绕过AI检测，"
            f"人声无损保留。永久会员¥198，邀请好友还能再打折！\n"
            f"{link}"
        ),
        "douyin": (
            f"🔥 AI音乐被检测？vitqa一招搞定！\n"
            f"HPSS分离技术，保留人声，绕过检测。\n"
            f"点击链接注册有折扣！\n"
            f"{link}"
        ),
        "xianyu": (
            f"🎵 AI音乐去检测处理，永久会员¥198\n"
            f"HPSS技术不损伤人声，三档处理模式，"
            f"通过率超高！闲鱼价已是最低，"
            f"通过链接注册还能再享阶梯折扣！\n"
            f"{link}"
        ),
        "kuaishou": (
            f"🔥 AI音乐人看过来！vitqa去检测神器\n"
            f"Suno/Udio做的歌总被检测？HPSS分离技术，"
            f"人声无损保留，平均AI概率降到12.5%！\n"
            f"通过我链接注册享折扣👇\n"
            f"{link}"
        ),
        "xiaohongshu": (
            f"🎵 AI音乐人看过来！发现了宝藏工具 vitqa✨\n"
            f"Suno/Udio生成的歌总被检测出AI味？vitqa基于HPSS技术，"
            f"只处理背景层保留人声质感，平均AI概率降到12.5%！\n"
            f"永久会员才198，现在通过我的链接注册还能享折扣👇\n"
            f"{link}"
        ),
        "weibo": (
            f"#AI音乐 #vitqa #去检测 #音乐人必备\n"
            f"AI音乐人福音来了！vitqa基于HPSS谐波分离技术，"
            f"精准绕过AI检测，保留原声质感。三档处理模式，"
            f"¥198永久会员，邀请好友注册还能享阶梯折扣！\n"
            f"{link}"
        )
    }


def _get_referral_count(conn, user_id: int) -> int:
    """Get the count of successfully referred users."""
    row = conn.execute(
        "SELECT COUNT(*) FROM user_referrals WHERE user_id = ?",
        (user_id,)
    ).fetchone()
    return row[0] if row else 0


def _calc_discount(referral_count: int) -> int:
    """Calculate discount percent based on referral count."""
    discount = referral_count * REFERRAL_DISCOUNT_PER_STEP
    return min(discount, MAX_REFERRAL_DISCOUNT)


def _get_or_create_code(conn, user_id: int) -> str:
    """Get existing or create a new referral code for user."""
    row = conn.execute(
        "SELECT code FROM referral_codes WHERE user_id = ?",
        (user_id,)
    ).fetchone()
    if row:
        return row["code"]
    code = uuid.uuid4().hex[:8]
    conn.execute(
        "INSERT OR IGNORE INTO referral_codes (user_id, code) VALUES (?, ?)",
        (user_id, code)
    )
    conn.commit()
    row = conn.execute(
        "SELECT code FROM referral_codes WHERE user_id = ?",
        (user_id,)
    ).fetchone()
    return row["code"] if row else code


@app.get("/api/referral/code")
def get_referral_code(token: str = Query(...)):
    """Get user's referral code. Creates one if needed."""
    user = get_current_user(token)
    conn = get_db()
    code = _get_or_create_code(conn, user["user_id"])
    conn.close()
    return {"code": code}


@app.get("/api/referral/stats")
def get_referral_stats(token: str = Query(...)):
    """Get user's referral statistics with dynamic discount and share texts."""
    user = get_current_user(token)
    conn = get_db()

    code = _get_or_create_code(conn, user["user_id"])
    referral_count = _get_referral_count(conn, user["user_id"])
    discount_percent = _calc_discount(referral_count)

    conn.close()

    share_link = f"https://vitqa.com/?ref={code}"
    share_texts = _generate_share_texts(code)

    return {
        "code": code,
        "referral_count": referral_count,
        "discount_percent": discount_percent,
        "max_referrals": MAX_REFERRAL_STEPS,
        "share_link": share_link,
        "share_texts": share_texts
    }


# ─── File Upload ──────────────────────────────────────────────

# MIME magic bytes for audio files
AUDIO_MAGIC = {
    b'RIFF': ['wav', 'avi'],       # WAV
    b'\xff\xfb': ['mp3'],          # MP3 ID3v2
    b'\xff\xf3': ['mp3'],          # MP3
    b'\xff\xf2': ['mp3'],          # MP3
    b'fLaC': ['flac'],             # FLAC
    b'ftypM4A': ['m4a'],           # M4A
    b'ftypmp4': ['mp4', 'm4a'],   # MP4/M4A
    b'ftypisom': ['mp4', 'm4a'],  # MP4
    b'OggS': ['ogg', 'oga'],       # OGG
    b'\xff\xf1': ['aac'],          # AAC
    b'ID3': ['mp3'],               # MP3 with ID3 tag
}

VALID_AUDIO_EXTS = {'wav', 'mp3', 'flac', 'm4a', 'ogg', 'aac', 'mp4', 'wma'}

def validate_audio_file_header(content: bytes, ext: str) -> bool:
    """Validate audio file using magic bytes (first 12 bytes)."""
    if len(content) < 4:
        return False
    ext = ext.lower()
    # Check known magic bytes
    for magic, exts in AUDIO_MAGIC.items():
        if content.startswith(magic) and ext in exts:
            return True
    # If no magic match but ext is valid, allow it
    if ext in VALID_AUDIO_EXTS:
        return True
    return False


@app.get("/api/free-trial")
async def check_free_trial(request: Request):
    """Check free trial remaining for this IP."""
    ip = request.client.host if request.client else "unknown"
    used = free_trial_store.get(ip, 0)
    remaining = max(0, FREE_TRIAL_LIMIT - used)
    return {"remaining": remaining, "total": FREE_TRIAL_LIMIT}

@app.post("/api/upload")
async def upload_audio(request: Request, token: str = Query(None), file: UploadFile = File(...)):
    """Upload audio file for processing (members only)."""
    check_rate_limit(request)
    user = None
    try:
        user = check_member(token)
    except HTTPException:
        ip = request.client.host if request.client else "unknown"
        used = free_trial_store.get(ip, 0)
        if used >= FREE_TRIAL_LIMIT:
            raise HTTPException(403, "Free trial exhausted. Connect wallet or purchase membership.")

    if not file or not file.filename:
        raise HTTPException(400, "No file provided")

    filename = file.filename
    if not allowed_file(filename or ""):
        raise HTTPException(400, "Unsupported format. Allowed: WAV, MP3, FLAC, M4A, OGG, AAC")

    # Read with size check
    content = await file.read()
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(400, "File too large. Maximum 100MB")

    # Validate file header with magic bytes
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if not validate_audio_file_header(content, ext):
        raise HTTPException(400, "Invalid file format (file header mismatch)")

    # Daily conversion limit (skip for free trial - they have IP-based limit)
    if user:
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
    token: str = Query(None),
    upload_id: str = Form(...),
    mode: str = Form("standard")
):
    """Run the HPSS conversion pipeline (members or free trial)."""
    check_rate_limit(request)
    user = None
    try:
        user = check_member(token)
    except HTTPException:
        ip = request.client.host if request.client else "unknown"
        used = free_trial_store.get(ip, 0)
        if used >= FREE_TRIAL_LIMIT:
            raise HTTPException(403, "Free trial exhausted. Connect wallet or purchase membership.")
        free_trial_store[ip] = used + 1

    if mode not in ("standard", "gentle", "aggressive"):
        raise HTTPException(400, "Invalid mode. Choose: standard, gentle, aggressive")

    input_path = None
    for f in UPLOAD_DIR.iterdir():
        if f.name.startswith(upload_id):
            input_path = str(f)
            break

    if not input_path:
        raise HTTPException(404, "Upload not found. Please upload first.")

    params = {
        "standard": {"vocal_ratio": 0.28, "background_bitrate": "64k", "output_bitrate": "192k",
                      "mix_vocal_gain": 1.8, "mix_bg_gain": 0.35},
        "gentle": {"vocal_ratio": 0.35, "background_bitrate": "80k", "output_bitrate": "256k",
                    "mix_vocal_gain": 2.2, "mix_bg_gain": 0.45},
        "aggressive": {"vocal_ratio": 0.18, "background_bitrate": "32k", "output_bitrate": "128k",
                        "mix_vocal_gain": 1.2, "mix_bg_gain": 0.3}
    }[mode]

    result = process_audio(input_path, **params)
    if result["status"] == "error":
        raise HTTPException(500, result["error"])

    if user:
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
def download_audio(request: Request, filename: str, token: str = Query(None)):
    """Download processed audio (members or recent free trial)."""
    check_rate_limit(request)
    if token:
        user = check_member(token)

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
        "SELECT p.id, p.user_id, p.tx_hash, p.amount, p.wallet_sender, p.status, p.created_at FROM payments p ORDER BY p.created_at DESC LIMIT 50"
    ).fetchall()

    recent_users = conn.execute(
        "SELECT id, email, wallet_address, is_member, member_until, total_conversions, created_at FROM users ORDER BY created_at DESC LIMIT 50"
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
            {"id": u["id"], "email": u["email"], "wallet": (u["wallet_address"] or "legacy")[:12] + "...",
             "is_member": bool(u["is_member"]), "member_until": u["member_until"] or "",
             "conversions": u["total_conversions"] or 0,
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
    admin_html_path = Path(__file__).parent / "admin_template.html"
    if admin_html_path.exists():
        html = admin_html_path.read_text(encoding="utf-8")
    else:
        html = "<h1>vitqa Admin</h1><p>Template not loaded</p>"
    return HTMLResponse(html)


# ─── Demo / Landing Pages ────────────────────────────────────

@app.get("/demo")
def demo_page():
    demo_path = FRONTEND_DIR / "demo.html"
    if demo_path.exists():
        return HTMLResponse(demo_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>vitqa Demo</h1><p>Page not found</p>")


# ─── Sitemap & Robots ─────────────────────────────────────────

@app.get("/sitemap.xml")
async def serve_sitemap():
    path = FRONTEND_DIR / "sitemap.xml"
    if path.exists():
        return FileResponse(path, media_type="application/xml", headers={"Cache-Control": "max-age=3600"})
    return HTMLResponse("Not Found", status_code=404)

@app.get("/robots.txt")
async def serve_robots():
    path = FRONTEND_DIR / "robots.txt"
    if path.exists():
        return FileResponse(path, media_type="text/plain", headers={"Cache-Control": "max-age=86400"})
    return HTMLResponse("Not Found", status_code=404)

@app.get("/tools/{path:path}")
async def serve_tools(path: str):
    if not path or path.endswith("/"):
        path = "index.html"
    if "." not in path:
        path = path + ".html"
    file_path = FRONTEND_DIR / "tools" / path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path, headers={"Cache-Control": "max-age=3600"})
    return HTMLResponse("Not Found", status_code=404)

@app.get("/blog/{path:path}")
async def serve_blog(path: str):
    if not path or path.endswith("/"):
        path = "index.html"
    if "." not in path:
        path = path + ".html"
    file_path = FRONTEND_DIR / "blog" / path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path, headers={"Cache-Control": "max-age=3600"})
    return HTMLResponse("Not Found", status_code=404)

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
    conn = get_db()
    migrate_db(conn)
    conn.close()
    UPLOAD_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    DB_PATH.parent.mkdir(exist_ok=True)
    print(f"[Startup] vitqa started | Price: ¥{WECHAT_PRICE} | USDT: {USDT_PRICE}")
    print(f"[Startup] Admin key: {ADMIN_KEY[:8]}... (save this!)")


@app.on_event("shutdown")
def shutdown():
    cleanup_old_files(1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
