#!/bin/bash
# Email Verification Testing Script
# Usage: bash test-email-verification.sh

BASE_URL="http://localhost:5000/api/auth"
TEST_EMAIL="test$(date +%s)@gmail.com"

echo "==================================="
echo "Email Verification Testing"
echo "==================================="
echo ""

# Test 1: Register a new user
echo "1️⃣  Registering new user..."
echo "Email: $TEST_EMAIL"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPassword123!\",
    \"phone\": \"9876543210\",
    \"role\": \"donor\"
  }")

echo "Response:"
echo $REGISTER_RESPONSE | jq '.'
echo ""

# Extract user ID if registration was successful
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.id // empty')

if [ -z "$USER_ID" ]; then
  echo "❌ Registration failed!"
  exit 1
fi

echo "✅ User registered successfully!"
echo "User ID: $USER_ID"
echo ""
echo "📧 Check your email for verification link!"
echo ""

# Test 2: Try login before verification
echo "2️⃣  Testing login before email verification..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPassword123!\"
  }")

echo "Response:"
echo $LOGIN_RESPONSE | jq '.'
echo ""

EMAIL_VERIFIED=$(echo $LOGIN_RESPONSE | jq -r '.emailVerified')
if [ "$EMAIL_VERIFIED" == "false" ]; then
  echo "✅ Email correctly marked as unverified"
else
  echo "⚠️  Email should be unverified at this point"
fi

echo ""
echo "==================================="
echo "Test Steps Remaining:"
echo "==================================="
echo ""
echo "3. Copy the verification token from your email"
echo "4. Run this command to verify the email:"
echo ""
echo "curl -X POST $BASE_URL/verify-email \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"token\": \"PASTE_TOKEN_HERE\"}'"
echo ""
echo "5. After verification, login again to see emailVerified: true"
echo ""
