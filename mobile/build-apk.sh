#!/bin/bash
# Script para generar APK de BienestarApp

echo "🚀 Generando APK de BienestarApp..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "app.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio mobile/"
    exit 1
fi

# Verificar que EAS CLI esté instalado
if ! command -v eas &> /dev/null; then
    echo "📦 Instalando EAS CLI..."
    npm install -g eas-cli
fi

# Login (si es necesario)
echo "🔐 Verificando sesión de Expo..."
eas whoami || eas login

# Generar APK
echo ""
echo "🔨 Generando APK (esto puede tardar 10-15 minutos)..."
echo ""
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ ¡Listo! El APK estará disponible en el link que se mostró arriba."
echo "📱 Descárgalo en tu celular e instálalo para probar las notificaciones push."
