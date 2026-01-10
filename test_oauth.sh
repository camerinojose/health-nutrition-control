#!/bin/bash
# Test script to run backend with full logging

echo "=== Killing old processes ==="
pkill -f "go run" 2>/dev/null || true
pkill -f "./bienestar" 2>/dev/null || true
sleep 2

echo "=== Starting backend ==="
cd /c/Users/camer/github/backend

# Try to compile fresh
go build -o bienestar_test 2>&1 | head -10

# Run it
PORT=8888 ./bienestar_test 2>&1 | tee /tmp/oauth_logs.txt &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
sleep 3

echo "=== Backend is running on port 8888 ==="
echo "Logs are being written to /tmp/oauth_logs.txt"
echo "Test Google login now and check the logs for:"
echo "  - [OAUTH] Storing state->redirect mapping"
echo "  - [OAUTH] Final redirect URL"
echo ""
echo "=== Press Ctrl+C to stop ==="

# Keep script running to see logs
wait $BACKEND_PID
