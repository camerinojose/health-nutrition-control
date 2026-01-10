#!/bin/bash

# BienestarApp Quick Test Script
# This script performs automated API tests

echo "🚀 BienestarApp - Automated Test Suite"
echo "========================================"
echo ""

BASE_URL="http://localhost:8080/api"
TEST_EMAIL="testuser@example.com"
TEST_PASSWORD="password123"
ADMIN_EMAIL="admin@example.com"

echo "📝 Test 1: Register New User"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q "ok"; then
  echo "✅ Registration successful"
else
  echo "⚠️  Registration: $REGISTER_RESPONSE (may already exist)"
fi
echo ""

echo "🔐 Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Login successful - Token obtained"
else
  echo "❌ Login failed: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

echo "👤 Test 3: Get Profile"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
  echo "✅ Profile retrieved"
  echo "   $PROFILE_RESPONSE"
else
  echo "❌ Profile failed: $PROFILE_RESPONSE"
fi
echo ""

echo "📊 Test 4: Create History Entry"
HISTORY_CREATE=$(curl -s -X POST "$BASE_URL/history" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2025-12-27",
    "weight": 75.5,
    "fat_percentage": 22.3,
    "muscle_percentage": 42.1
  }')

if echo "$HISTORY_CREATE" | grep -q "ok"; then
  echo "✅ History entry created"
else
  echo "❌ History creation failed: $HISTORY_CREATE"
fi
echo ""

echo "📋 Test 5: List History"
HISTORY_LIST=$(curl -s -X GET "$BASE_URL/history" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HISTORY_LIST" | grep -q "weight"; then
  echo "✅ History retrieved"
  echo "   Entries: $(echo "$HISTORY_LIST" | grep -o "id" | wc -l)"
else
  echo "⚠️  No history entries or error: $HISTORY_LIST"
fi
echo ""

echo "🖼️  Test 6: OCR Upload (requires image)"
if [ -f "../peso camerino.jpg" ]; then
  OCR_RESPONSE=$(curl -s -X POST "$BASE_URL/ocr" \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@../peso camerino.jpg")
  
  if echo "$OCR_RESPONSE" | grep -q "confidence"; then
    echo "✅ OCR endpoint working"
    echo "   Response: $OCR_RESPONSE"
  else
    echo "❌ OCR failed: $OCR_RESPONSE"
  fi
else
  echo "⚠️  Image file not found, skipping OCR test"
fi
echo ""

echo "========================================"
echo "✨ Basic tests complete!"
echo ""
echo "To test admin features:"
echo "1. Update user role: UPDATE users SET role='admin' WHERE email='$TEST_EMAIL';"
echo "2. Login again and access:"
echo "   - GET $BASE_URL/admin/users"
echo "   - GET $BASE_URL/admin/export"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
