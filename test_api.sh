#!/bin/bash
set -e
cd /root/.openclaw/workspace/vitqa

# Kill old server
pkill -f "uvicorn" 2>/dev/null || true
sleep 1

# Start server
cd backend
../venv/bin/python -c "
import uvicorn
import main
uvicorn.run(main.app, host='0.0.0.0', port=8000, log_level='info')
" > /tmp/vitqa_server.log 2>&1 &
SERVER_PID=$!
cd ..
sleep 3

# Test health
curl -s http://localhost:8000/api/health && echo ""

# Test register
echo "=== REGISTER ==="
REG=$(curl -s -X POST -d "email=test@vitqa.com&password=test123456" http://localhost:8000/api/register)
echo "$REG"
TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Make member
cd backend
../venv/bin/python3 -c "
import sqlite3
conn = sqlite3.connect('vitqa.db')
conn.execute(\"UPDATE users SET is_member=1, member_until='permanent' WHERE email='test@vitqa.com'\")
conn.commit()
print('Made member')
conn.close()
"
cd ..

# Test convert endpoint
echo "=== UPLOAD ==="
UPLOAD=$(curl -s -F "file=@/tmp/test_audio.wav" "http://localhost:8000/api/upload?token=$TOKEN")
echo "$UPLOAD"
UPLOAD_ID=$(echo "$UPLOAD" | python3 -c "import sys,json; print(json.load(sys.stdin)['upload_id'])")

echo "=== CONVERT ==="
CONV=$(curl -s -X POST -d "upload_id=$UPLOAD_ID&mode=standard" "http://localhost:8000/api/convert?token=$TOKEN")
echo "$CONV"

echo "=== DONE ==="
# Kill server
kill $SERVER_PID 2>/dev/null || true
