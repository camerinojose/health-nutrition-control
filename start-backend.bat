@echo off
REM Backend startup script for Windows

cd /d "%~dp0\backend" || exit /b 1

echo.
echo 🚀 Starting Bienestar App Backend...
echo 📍 Server will run on http://localhost:8080
echo 🔌 API base: http://localhost:8080/api
echo.

go run main.go oauth_handlers.go nutritionist_handlers.go
