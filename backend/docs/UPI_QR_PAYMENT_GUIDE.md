# UPI QR Code Payment Integration Guide

## Overview
This implementation uses a simple UPI QR code-based payment system where users scan a QR code displayed on the website to complete their donation.

## How It Works

### Payment Flow:
1. **User initiates donation** → Backend creates a donation record with `pending` status
2. **User scans UPI QR code** → Displayed on frontend with your UPI ID
3. **User completes payment** → Through their UPI app (Google Pay, PhonePe, Paytm, etc.)
4. **User submits UPI Transaction ID** → Backend updates donation to `completed`

---

## Setup Instructions

### Step 1: Add Your UPI Details to `.env`

```env
UPI_ID=yourname@paytm
UPI_NAME=EduReach
```

Replace `yourname@paytm` with your actual UPI ID (e.g., `9876543210@paytm`, `myname@oksbi`, etc.)

---

## API Endpoints

### 1. Create Donation Order
**POST** `/api/donor/create-order`

**Request:**
```json
{
  "amount": 1000,
  "currency": "INR",
  "paymentMethod": "UPI"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation order created. Please scan QR code and complete payment.",
  "data": {
    "donationId": "64a5b1c2d3e4f5g6h7i8j9k0",
    "transactionRef": "TXN_1234567890_abc123",
    "amount": 1000,
    "currency": "INR",
    "upiId": "yourname@paytm",
    "upiName": "EduReach"
  }
}
```

### 2. Submit Payment Proof
**POST** `/api/donor/verify`

After user completes payment and gets UPI Transaction ID from their app:

**Request:**
```json
{
  "donationId": "64a5b1c2d3e4f5g6h7i8j9k0",
  "upiTransactionId": "123456789012",
  "transactionRef": "TXN_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment submitted successfully. Your donation will be verified shortly.",
  "data": {
    "donationId": "64a5b1c2d3e4f5g6h7i8j9k0",
    "status": "completed",
    "receiptUrl": "https://edureach.app/receipts/64a5b1c2d3e4f5g6h7i8j9k0",
    "upiTransactionId": "123456789012"
  }
}
```

---

## Frontend Implementation

### Generate UPI QR Code

You can use libraries like `qrcode` to generate QR codes:

```bash
npm install qrcode
```

```javascript
import QRCode from 'qrcode';

// After getting response from create-order API
const { upiId, upiName, amount, transactionRef } = response.data;

// Create UPI payment string
const upiString = `upi://pay?pa=${upiId}&pn=${upiName}&am=${amount}&cu=INR&tn=Donation-${transactionRef}`;

// Generate QR code
QRCode.toCanvas(document.getElementById('qr-canvas'), upiString, {
  width: 300,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
});
```

### React/Next.js Example

```jsx
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

function DonationPage() {
  const [qrCode, setQrCode] = useState('');
  const [donationId, setDonationId] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');

  const createDonation = async (amount) => {
    const response = await fetch('/api/donor/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency: 'INR' })
    });

    const data = await response.json();
    
    if (data.success) {
      const { upiId, upiName, amount, transactionRef, donationId } = data.data;
      
      // Generate UPI payment string
      const upiString = `upi://pay?pa=${upiId}&pn=${upiName}&am=${amount}&cu=INR&tn=Donation-${transactionRef}`;
      
      // Generate QR code as Data URL
      const qrDataUrl = await QRCode.toDataURL(upiString);
      setQrCode(qrDataUrl);
      setDonationId(donationId);
    }
  };

  const submitPaymentProof = async () => {
    const response = await fetch('/api/donor/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        donationId,
        upiTransactionId: upiTxnId
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('Payment submitted! Your donation will be verified.');
    }
  };

  return (
    <div>
      <h2>Donate via UPI</h2>
      <button onClick={() => createDonation(1000)}>Donate ₹1000</button>
      
      {qrCode && (
        <div>
          <img src={qrCode} alt="UPI QR Code" />
          <p>Scan this QR code with any UPI app to complete payment</p>
          
          <input
            type="text"
            placeholder="Enter UPI Transaction ID"
            value={upiTxnId}
            onChange={(e) => setUpiTxnId(e.target.value)}
          />
          <button onClick={submitPaymentProof}>Submit Payment Proof</button>
        </div>
      )}
    </div>
  );
}
```

---

## Payment Verification Process

### Manual Verification (Recommended)
Since UPI transactions can't be automatically verified without payment gateway APIs, you should:

1. **Create an admin panel** to review submitted donations
2. **Match UPI Transaction IDs** with your bank statement
3. **Update donation status** accordingly

### Admin Endpoint (To be implemented)
```
PATCH /api/admin/donations/:id/verify
- Mark donation as verified after checking bank statement
```

---

## UPI Apps Supported

Users can pay using any UPI-enabled app:
- ✅ Google Pay (GPay)
- ✅ PhonePe
- ✅ Paytm
- ✅ BHIM
- ✅ Amazon Pay
- ✅ Any bank's UPI app

---

## Finding Your UPI Transaction ID

Instruct users to:

### Google Pay:
1. Open Google Pay app
2. Go to "Activity" or "Transactions"
3. Find the payment to your UPI ID
4. Tap on it to see "UPI transaction ID"

### PhonePe:
1. Open PhonePe app
2. Go to "History"
3. Find the transaction
4. Tap "Transaction Details"
5. Copy "UTR" or "Transaction ID"

### Paytm:
1. Open Paytm app
2. Go to "Passbook"
3. Find the transaction
4. Tap on it to see "Transaction ID"

---

## Security Considerations

✅ **DO:**
- Verify all UPI transaction IDs with your bank statement
- Implement rate limiting on verification endpoint
- Log all transactions for audit trail
- Create admin panel for manual verification
- Ask for payment screenshot (optional)

❌ **DON'T:**
- Accept payments without verification
- Automatically mark all donations as completed
- Trust client-side validation alone

---

## Benefits of UPI QR Code Approach

✅ **Zero transaction fees** (no payment gateway charges)
✅ **Simple implementation** (no complex API integration)
✅ **Direct to your bank** (instant settlement)
✅ **All UPI apps supported** (maximum reach)
✅ **No monthly subscription** (unlike payment gateways)

---

## Limitations

⚠️ **Manual verification required** - Can't auto-verify payments
⚠️ **Fraud risk** - Users might submit fake transaction IDs
⚠️ **No refund API** - Manual process for refunds
⚠️ **Scalability** - Manual verification doesn't scale well

---

## Recommended Next Steps

For production, consider:
1. Implementing an admin verification panel
2. Asking users to upload payment screenshots
3. Setting up automated bank statement parsing (advanced)
4. Or upgrading to Razorpay/Stripe for automatic verification

---

## Testing

1. Set your UPI ID in `.env`
2. Create a donation order via API
3. Generate QR code on frontend
4. Scan with your UPI app and pay ₹1
5. Get transaction ID from your UPI app
6. Submit via verify API
7. Check donation history

---

## Support

For UPI-related queries:
- Your bank's customer support
- NPCI UPI Support: https://www.npci.org.in/what-we-do/upi
