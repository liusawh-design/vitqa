#!/bin/bash
# vitqa deploy script - update CSS + JS and restart
set -e

VITQA_DIR="/root/vitqa"

echo "=== 1. Downloading latest CSS and JS ==="
curl -sL -o "$VITQA_DIR/frontend/css/style.css" "https://raw.githubusercontent.com/liusawh-design/vitqa/main/frontend/css/style.css"
curl -sL -o "$VITQA_DIR/frontend/js/app.js" "https://raw.githubusercontent.com/liusawh-design/vitqa/main/frontend/js/app.js"

echo "=== 2. Killing old vitqa process ==="
OLD_PID=$(ps aux | grep "python run.py" | grep -v grep | awk '{print $2}')
if [ -n "$OLD_PID" ]; then
  kill $OLD_PID 2>/dev/null
  sleep 1
fi

echo "=== 3. Restarting vitqa ==="
cd "$VITQA_DIR/backend"
nohup python run.py > /dev/null 2>&1 &

echo "=== 4. Done! ==="
sleep 2
curl -sI http://localhost:5005/ | head -1
