@echo off
REM Script para generar APK de BienestarApp en Windows

echo.
echo 🚀 Generando APK de BienestarApp...
echo.

cd /d "%~dp0"

REM Verificar que estamos en el directorio correcto
if not exist "app.json" (
    echo ❌ Error: Este script debe ejecutarse desde el directorio mobile/
    exit /b 1
)

REM Verificar que EAS CLI esté instalado
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Instalando EAS CLI...
    npm install -g eas-cli
)

REM Login si es necesario
echo 🔐 Verificando sesión de Expo...
eas whoami || eas login

REM Generar APK
echo.
echo 🔨 Generando APK (esto puede tardar 10-15 minutos)...
echo.
eas build --platform android --profile preview --non-interactive

echo.
echo ✅ ¡Listo! El APK estará disponible en el link que se mostró arriba.
echo 📱 Descárgalo en tu celular e instálalo para probar las notificaciones push.
pause
