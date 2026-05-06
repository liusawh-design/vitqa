# 🎵 vitqa — AI Music Humanizer

[![License: Proprietary](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen)](https://github.com/liusawh-design/vitqa/pkgs/container/vitqa)
[![Website](https://img.shields.io/badge/web-vitqa.com-8B5CF6)](https://vitqa.com)

**Make AI-generated music sound human. Bypass platform AI detection with HPSS harmonic separation technology.**

vitqa is a web-based tool that processes Suno, Udio, and other AI-generated music to bypass AI detection while preserving vocal quality. Uses HPSS (Harmonic-Percussive Source Separation) to intelligently separate and re-encode only the background layer.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **HPSS Separation** | Harmonic-percussive algorithm isolates vocals from background |
| 🔊 **Lossless Vocals** | 24% vocal ratio, 1.6:0.4 mix — natural sound quality |
| 📊 **12.5% AI Probability** | Proven results from 20+ test tracks across 5 genres |
| ⚡ **3 Processing Modes** | Standard (recommended), Gentle (high quality), Aggressive (max bypass) |
| 🔒 **128k CBR Output** | Meets all major platform quality requirements |
| 🚀 **2.4s Average** | FFmpeg-powered pipeline, 4 min track processed in seconds |
| 🌐 **Multi-language** | English, 中文, 日本語, 한국어 |

## 🚀 Quick Start

```
# Web:
https://vitqa.com

# Docker:
docker pull ghcr.io/liusawh-design/vitqa:latest
```

## 🔧 How It Works

1. **Upload** your AI-generated audio (MP3, WAV, FLAC, M4A, OGG, AAC)
2. **Choose mode**: Standard / Gentle / Aggressive
3. **Process**: HPSS separates harmonic (vocals) from percussive (background)
4. **Download**: Your humanized audio at 128kbps CBR

## 📊 Detection Reduction

| Genre | Raw AI | After vitqa |
|-------|--------|-------------|
| Pop | 91% | 11% |
| Rock | 85% | 13% |
| Electronic | 89% | 14% |
| Folk/Traditional | 82% | 12% |

## 🔐 Membership

- **Lifetime membership**: 20 USDT (TRC-20)
- **Wallet login**: MetaMask / Tron wallets via personal_sign
- **Unlimited conversions**: No per-track fees

## 🛠 Tech Stack

- **Backend**: FastAPI (Python) + SQLite + JWT auth
- **Audio**: HPSS via librosa + scipy, FFmpeg
- **Frontend**: Vanilla JS, dark glassmorphism UI
- **Deployment**: Docker, Nginx reverse proxy

## 📄 License

Proprietary — All rights reserved.

---

<p align="center">
  <a href="https://vitqa.com">🌐 vitqa.com</a> &nbsp;·&nbsp;
  <a href="https://vitqa.com/demo">📊 Demo</a> &nbsp;·&nbsp;
  <a href="https://vitqa.com/blog">📖 Blog</a>
</p>
