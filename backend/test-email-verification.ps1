# Email Verification Testing Script (PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File test-email-verification.ps1

$baseUrl = "http://localhost:5000/api/auth"
$timestamp = Get-Date -UFormat "%s"
$testEmail = "test$timestamp@gmail.com"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Email Verification Testing" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register a new user
Write-Host "1️⃣  Registering new user..." -ForegroundColor Yellow
Write-Host "Email: $testEmail" -ForegroundColor Gray
Write-Host ""

$registerPayload = @{
    name = "Test User"
    email = $testEmail
    password = "TestPassword123!"
    phone = "9876543210"
    role = "donor"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/register" `
  -ContentType "application/json" `
  -Body $registerPayload

Write-Host "Response:" -ForegroundColor Green
$registerResponse | ConvertTo-Json | Write-Host
Write-Host ""

$userId = $registerResponse.data.id

if ($null -eq $userId) {
    Write-Host "❌ Registration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ User registered successfully!" -ForegroundColor Green
Write-Host "User ID: $userId" -ForegroundColor Gray
Write-Host ""
Write-Host "📧 Check your email for verification link!" -ForegroundColor Magenta
Write-Host ""

# Test 2: Try login before verification
Write-Host "2️⃣  Testing login before email verification..." -ForegroundColor Yellow
Write-Host ""

$loginPayload = @{
    email = $testEmail
    password = "TestPassword123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/login" `
  -ContentType "application/json" `
  -Body $loginPayload

Write-Host "Response:" -ForegroundColor Green
$loginResponse | ConvertTo-Json | Write-Host
Write-Host ""

$emailVerified = $loginResponse.emailVerified
if ($emailVerified -eq $false) {
    Write-Host "✅ Email correctly marked as unverified" -ForegroundColor Green
} else {
    Write-Host "⚠️  Email should be unverified at this point" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Test Steps Remaining:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copy the verification token from your email" -ForegroundColor White
Write-Host "4. Run this command to verify the email:" -ForegroundColor White
Write-Host ""
Write-Host "Invoke-RestMethod -Method Post `
  -Uri '$baseUrl/verify-email' `
  -ContentType 'application/json' `
  -Body '{``"token``: ``"PASTE_TOKEN_HERE``"}'" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. After verification, login again to see emailVerified: true" -ForegroundColor White
Write-Host ""
