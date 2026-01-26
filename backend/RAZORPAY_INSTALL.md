# Quick Setup Instructions for Razorpay Integration

## 1. Install Razorpay Package

Run this command in your backend directory:

```bash
npm install razorpay
```

Or if using yarn:

```bash
yarn add razorpay
```

## 2. Install Type Definitions (TypeScript)

```bash
npm install --save-dev @types/razorpay
```

## 3. Set Environment Variables

Add these to your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

**Get your Razorpay keys from:**
👉 https://dashboard.razorpay.com/app/website-app-settings/api-keys

## 4. That's it! The code is ready to use.

Your backend is now configured to:
- ✅ Create Razorpay payment orders
- ✅ Verify payment signatures
- ✅ Track donation history
- ✅ Handle book donations

## Testing

Use Razorpay test credentials:
- **Test Card**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

For more details, see [RAZORPAY_SETUP.md](./RAZORPAY_SETUP.md)
