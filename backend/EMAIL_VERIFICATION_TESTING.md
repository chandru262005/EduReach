# Email Verification Testing Guide

## Step 1: Set Up Environment Variables

Create or update your `.env` file in the backend directory with these settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/edureach

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@edureach.com
FRONTEND_URL=http://localhost:5173
```

### Getting Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Use this password in SMTP_PASSWORD (without spaces)

---

## Step 2: Start Your Server

```bash
npm run dev
```

You should see: "Email transporter ready" if configured correctly

---

## Step 3: Test Registration (Postman or cURL)

### Using Postman:
1. Create a new POST request
2. URL: `http://localhost:5000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "name": "Test User",
  "email": "testuser@gmail.com",
  "password": "Password123!",
  "phone": "9876543210",
  "role": "donor"
}
```

5. Click Send

You should receive:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "id": "...",
    "email": "testuser@gmail.com",
    "role": "donor"
  }
}
```

**Check your email for the verification link!**

---

## Step 4: Test Email Verification

### Extract the token from the email link
The email will contain: `http://localhost:5173/verify-email?token=abc123def456...`

Extract the token part: `abc123def456...`

### Verify the token via API:

```json
{
  "token": "the-token-you-extracted-from-email"
}
```

POST to: `http://localhost:5000/api/auth/verify-email`

Success response:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "testuser@gmail.com",
    "verified": true
  }
}
```

---

## Step 5: Test Login (with and without verification)

### Login endpoint:
```json
{
  "email": "testuser@gmail.com",
  "password": "Password123!"
}
```

POST to: `http://localhost:5000/api/auth/login`

Response will include `"emailVerified": true/false`

---

## Step 6: Test Resend Verification Email

```json
{
  "email": "testuser@gmail.com"
}
```

POST to: `http://localhost:5000/api/auth/resend-verification-email`

---

## Step 7: Test Volunteer Registration

```json
{
  "name": "John Volunteer",
  "email": "volunteer@gmail.com",
  "password": "Password123!",
  "phone": "9876543210",
  "expertise": ["teaching", "mentoring"],
  "skills": ["English", "Math"],
  "availability": ["weekends"]
}
```

POST to: `http://localhost:5000/api/auth/volunteer/register`

---

## Curl Examples

### Register User:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@gmail.com",
    "password": "Password123!",
    "phone": "9876543210",
    "role": "donor"
  }'
```

### Verify Email:
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-token-from-email"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "Password123!"
  }'
```

---

## Troubleshooting

### Email not sending?
- Check if SMTP credentials are correct
- Check server logs for error messages
- Ensure Gmail App Password is used (not regular password)
- Check spam/promotions folder in Gmail

### Token expired?
- Tokens expire in 24 hours
- Use resend-verification-email endpoint to get a new token

### Can't verify token?
- Make sure you're using the exact token from the email
- Check if 24 hours haven't passed
- Look at server logs for specific error

---

## Testing Without Email Service (Development Only)

If you want to test without configuring email, you can:

1. Check the server console logs - tokens are logged there
2. Or temporarily modify emailService.ts to log tokens
3. Or use a fake email service like Mailtrap or MailHog

