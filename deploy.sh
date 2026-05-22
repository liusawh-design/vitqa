#!/bin/bash
# vitqa deploy script - use jsDelivr CDN (works in China)
set -e

VITQA_DIR="/root/vitqa"
CDN_URL="https://cdn.jsdelivr.net/gh/liusawh-design/vitqa@main"

echo "=== 1. Downloading latest CSS and JS via CDN ==="
curl -sL -o "$VITQA_DIR/frontend/css/style.css" "$CDN_URL/frontend/css/style.css"
CSS_SIZE=$(wc -c < "$VITQA_DIR/frontend/css/style.css")
echo "   CSS: $CSS_SIZE bytes"

curl -sL -o "$VITQA_DIR/frontend/js/app.js" "$CDN_URL/frontend/js/app.js"
JS_SIZE=$(wc -c < "$VITQA_DIR/frontend/js/app.js")
echo "   JS: $JS_SIZE bytes"

echo "=== 2. Killing old vitqa process ==="
OLD_PID=$(ps aux | grep "python run.py" | grep -v grep | awk '{print $2}')
if [ -n "$OLD_PID" ]; then
  echo "   Killing PID: $OLD_PID"
  kill $OLD_PID 2>/dev/null
  sleep 2
fi

echo "=== 3. Restarting vitqa ==="
cd "$VITQA_DIR/backend"
nohup python3 run.py > /tmp/vitqa.log 2>&1 &
sleep 2
NEW_PID=$(ps aux | grep "python run.py" | grep -v grep | awk '{print $2}')
echo "   New PID: $NEW_PID"

echo "=== 4. Done! ==="
curl -s http://localhost:5005/api/health | head -1
