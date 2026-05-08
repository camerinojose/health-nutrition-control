@echo off
REM Backend startup script for Windows - LOCAL DEVELOPMENT with SQLite

cd /d "%~dp0\backend" || exit /b 1

echo.
echo 🚀 Starting Bienestar App Backend (LOCAL MODE - SQLite)
echo 📍 Server will run on http://localhost:8080
echo 🔌 API base: http://localhost:8080/api
echo 🗄️  Database: SQLite (data.db)
echo.

REM Set environment variables for local development with SQLite
set USE_SQLITE=true
set DB_PATH=./data.db
set JWT_SECRET=dev-local-secret-change-me

go run main.go oauth_handlers.go nutritionist_handlers.go
