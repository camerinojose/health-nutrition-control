#!/bin/bash
# Backend startup script for development

cd "$(dirname "$0")/backend" || exit

echo "🚀 Starting Bienestar App Backend..."
echo "📍 Server will run on http://localhost:8080"
echo "🔌 API base: http://localhost:8080/api"
echo ""

go run main.go oauth_handlers.go nutritionist_handlers.go
