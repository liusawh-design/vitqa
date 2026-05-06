#!/usr/bin/env python3
"""Auto-submit vitqa to web indexes and directories."""
import urllib.parse
import urllib.request
import json

SITE = "https://vitqa.com"

def ping_bing():
    url = f"https://www.bing.com/ping?sitemap={urllib.parse.quote(SITE + '/robots.txt')}"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return f"Bing: HTTP {r.status}"
    except Exception as e:
        return f"Bing: {e}"

def ping_yandex():
    url = f"https://webmaster.yandex.com/ping?sitemap={urllib.parse.quote(SITE + '/robots.txt')}"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return f"Yandex: HTTP {r.status}"
    except Exception as e:
        return f"Yandex: {e}"

def ping_archive():
    url = f"https://web.archive.org/save/{SITE}/"
    try:
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=15) as r:
            return f"Archive: HTTP {r.status}"
    except Exception as e:
        return f"Archive: {e}"

def check_site():
    try:
        with urllib.request.urlopen(SITE, timeout=10) as r:
            return f"Site: Online (HTTP {r.status})"
    except Exception as e:
        return f"Site: {e}"

if __name__ == "__main__":
    print(check_site())
    print(ping_bing())
    print(ping_yandex())
    print(ping_archive())
