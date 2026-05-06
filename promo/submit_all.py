#!/usr/bin/env python3
"""vitqa - Automated Directory Submitter
Submits vitqa.com to free startup/software directories.
Some require manual email verification, so this generates submission-ready data.
"""
import urllib.request
import json

SITE = "https://vitqa.com"
TITLE = "vitqa - AI Music Humanizer"
DESC = "HPSS-based AI music detection bypass. Make Suno/Udio tracks pass AI detection."
TAGS = ["AI music", "audio processing", "HPSS", "music detection bypass", "suno", "udio"]
EMAIL = "admin@vitqa.com"

SUBMISSION_URLS = [
    # Free directories - need manual submission
    {"name": "ProductHunt", "url": "https://www.producthunt.com/posts/new", "type": "manual"},
    {"name": "AlternativeTo", "url": "https://alternativeto.net/submit/", "type": "manual"},
    {"name": "SaaSHub", "url": "https://www.saashub.com/submit", "type": "manual"},
    {"name": "BetaList", "url": "https://betalist.com/submit", "type": "manual"},
    {"name": "Uneed", "url": "https://www.uneed.best/submit-tool", "type": "manual"},
    {"name": "FutureTools", "url": "https://futuretools.io/submit", "type": "manual"},
    {"name": "Toolspedia", "url": "https://toolspedia.io/submit/", "type": "manual"},
    {"name": "AI Tool Directory", "url": "https://aitoolmall.com/submit/", "type": "manual"},
    {"name": "TopAI", "url": "https://topai.tools/submit", "type": "manual"},
    {"name": "G2", "url": "https://www.g2.com/products/new", "type": "manual"},
    {"name": "Capterra", "url": "https://www.capterra.com/p/new/", "type": "manual"},
]

print("=" * 60)
print("VITQA - Automated Submission Report")
print("=" * 60)
print(f"\nSite: {SITE}")
print(f"Title: {TITLE}")
print(f"\nDirectories to submit (manual):")
print("-" * 40)

for d in SUBMISSION_URLS:
    print(f"  [{d['name']}]: {d['url']}")

print()
print("Submission Data (copy-paste for each):")
print("-" * 40)
print(f"  Title: {TITLE}")
print(f"  URL: {SITE}")  
print(f"  Description: {DESC}")
print(f"  Tags: {', '.join(TAGS)}")

# Generate SEO meta for each platform
print()
print("Press Release (for directories):")
print("-" * 40)
release = f"""Product Name: {TITLE}
URL: {SITE}
Tagline: AI music that sounds human - bypass detection, keep quality
Description: {DESC}
Long Description: vitqa is an AI music humanization platform based on HPSS (Harmonic-Percussive Source Separation) technology. It separates AI-generated music into vocal and background layers, encoding only the background to bypass AI detection while preserving vocal quality. Features three processing modes (Standard, Gentle, Aggressive), 128k CBR output, and TRC-20 wallet payment.
Category: AI / Audio Processing / Music Technology
Target Audience: Music producers, content creators, AI music enthusiasts
Pricing: 20 USDT one-time payment (lifetime)
Platform: Web-based (no download required)"""
print(release)
