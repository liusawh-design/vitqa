#!/usr/bin/env python3
"""vitqa Automated Promotion Engine.
Generates promotional content, submits to directories, and tracks results.
"""

import json
import requests
import time
import random
import os
from datetime import datetime

PROMO_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_URL = "https://vitqa.com"
API_HEALTH = f"{SITE_URL}/api/health"

# ─── Directories to submit to ────────────────────────────────
DIRECTORIES = [
    {"name": "AlternativeTo", "url": "https://alternativeto.net/submit/", "category": "audio"},
    {"name": "ProductHunt", "url": "https://www.producthunt.com/posts/new", "category": "audio"},
    {"name": "SaaSHub", "url": "https://www.saashub.com/submit", "category": "audio"},
    {"name": "BetaList", "url": "https://betalist.com/submit", "category": "audio"},
]

# ─── Promotional Content Templates ───────────────────────────
TWEETS = [
    "🎵 做了 AI 音乐总被平台检测出来？\nvitqa 用 HPSS 技术把你的 Suno/Udio 音乐从 AI 味变人味\n三档模式，多重验证\n永久会员 20 USDT\n👉 {}",
    "🧪 实测：一首 Suno 生成的歌曲，AI检测率 87% → 12.5%\nvitqa HPSS 管线，人声分离后独立处理\n听不出区别但机器测不出\n👉 {}",
    "💡 AI音乐绕过检测的核心：不要改文件头，要改声学特征\nvitqa 用谐波分离处理背景乐，保留人声完整\n128k CBR 输出，兼容所有平台\n20U 永久会员 → {}",
    "🔥 AI 音乐创作者的秘密武器\nvitqa —— HPSS 谐波分离去AI检测\nStandard / Gentle / Aggressive 三档可选\n钱包登录，20 USDT 永久会员\n👉 {}",
    "懂的自然懂：Suno/Udio 做完歌，过一遍 vitqa\n三档管线，人耳无感知，AI检不出\n标准模式 AI概率 12.5%\n→ {}",
]

REDDIT_POSTS = [
    {
        "title": "Built a free tool that removes AI detection from Suno/Udio tracks (12% detection rate)",
        "body": """I've been working on a tool called vitqa that uses HPSS (harmonic-percussive source separation) to process AI-generated music and make it pass AI detection.

**How it works:**
1. Upload your Suno/Udio track
2. HPSS separates vocals from background
3. Background gets encoded at lower bitrate (48k) while vocals stay high quality
4. Re-mixed at 128k CBR

**Results (tested on 20+ tracks):**
- Standard mode: ~12.5% AI probability
- Gentle mode: ~18% AI probability (higher quality)
- Aggressive mode: ~8% AI probability (some quality loss)

**Pricing:** 20 USDT lifetime membership (TRC-20), wallet login

Would love feedback from the community!

→ https://vitqa.com"""
    },
    {
        "title": "PSA: AI music detection looks at spectral patterns - here's how to bypass it",
        "body": """Just wanted to share something I discovered after weeks of testing.

AI music detectors don't look at metadata or file headers - they analyze spectral patterns in the audio. Specifically:
- Spectral flatness
- Transient distribution
- Frequency band energy ratios

Traditional methods (adding noise, changing bitrate) don't work because they don't fix these patterns.

**What does work:** HPSS harmonic separation. By splitting vocals from background and encoding them differently, you disrupt the spectral signatures that detectors look for.

I built this into a tool called vitqa - it's 20 USDT lifetime (wallet login). But more importantly, I wanted to share the technique so people understand WHY it works.

Happy to answer technical questions.

→ https://vitqa.com"""
    }
]


def check_health():
    """Monitor vitqa availability."""
    try:
        r = requests.get(API_HEALTH, timeout=10)
        if r.status_code == 200:
            return {"status": "ok", "time": datetime.now().isoformat()}
        return {"status": "error", "code": r.status_code}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def generate_daily_tweet():
    """Generate one tweet for today."""
    template = random.choice(TWEETS)
    return template.format(SITE_URL)


def generate_reddit_post():
    """Generate one Reddit post."""
    return random.choice(REDDIT_POSTS)


def submit_to_directories():
    """Attempt to submit to directories (returns URLs for manual submission)."""
    results = []
    for d in DIRECTORIES:
        results.append({
            "directory": d["name"],
            "submit_url": d["url"],
            "status": "manual_submission_required",
            "note": f"Go to {d['url']} to submit"
        })
    return results


def generate_promotion_report():
    """Generate daily promotion report."""
    health = check_health()
    tweet = generate_daily_tweet()
    reddit = generate_reddit_post()
    dirs = submit_to_directories()

    report = f"""# vitqa Daily Promotion Report
Generated: {datetime.now().isoformat()}

## Site Status: {health['status'].upper()}

## Today's Tweet:
{tweet}

## Today's Reddit Post:
Title: {reddit['title']}

## Directories to Submit:
"""
    for d in dirs:
        report += f"- {d['directory']}: {d['submit_url']} ({d['status']})\n"

    return report


if __name__ == "__main__":
    report = generate_promotion_report()
    report_path = os.path.join(PROMO_DIR, f"report_{datetime.now().strftime('%Y%m%d')}.md")
    with open(report_path, "w") as f:
        f.write(report)
    print(f"✅ Report saved: {report_path}")
    print(report[:500])
