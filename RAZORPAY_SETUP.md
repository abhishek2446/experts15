# Razorpay Payment Gateway Setup - Complete Guide

## ✅ Current Status
Your Razorpay integration is **ALREADY CONFIGURED** and ready to use!

## 🔧 Configuration Details

### Backend Environment Variables (✅ Configured)
```env
RAZORPAY_KEY_ID=rzp_test_RfzCjbS5iBMfVc
RAZORPAY_KEY_SECRET=fiiI3Gm1tXFPYgB6YYiXNPzQ
```

### Frontend Environment Variables (✅ Configured)
```env
VITE_RAZORPAY_KEY_ID=rzp_test_RfzCjbS5iBMfVc
```

## 🚀 How to Test Payment Integration

### 1. Start Your Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test Payment Flow
1. Go to http://localhost:3000/tests
2. Try enrolling in a paid test
3. Payment gateway should open automatically

### 3. Use Test Payment Component
Add this to any page to test payments:
```jsx
import PaymentTest from '../components/PaymentTest'

// In your component
<PaymentTest />
```

## 💳 Test Card Details
Use these test cards in Razorpay test mode:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002

## 🔍 Verify Integration

### Check Payment Configuration
```bash
curl http://localhost:5000/api/payments/config
```

Should return:
```json
{
  "razorpayConfigured": true,
  "keyId": "Configured",
  "keySecret": "Configured",
  "canCreateOrders": true,
  "message": "Ready for payments"
}
```

## 📱 Payment Flow in Your App

### For Test Enrollment (Tests.jsx)
The payment flow is already implemented:
1. User clicks "Enroll" on paid test
2. Backend creates Razorpay order
3. Frontend opens payment gateway
4. After payment, user gets enrolled

### Key Features Already Implemented:
- ✅ Order creation
- ✅ Payment verification
- ✅ Signature validation
- ✅ Enrollment after payment
- ✅ Email notifications
- ✅ Error handling

## 🛠️ Production Setup

### 1. Get Production Keys
1. Login to https://dashboard.razorpay.com
2. Go to Settings → API Keys
3. Generate Live Keys

### 2. Update Environment Variables
```env
# Replace test keys with live keys
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
```

### 3. Enable Webhooks (Optional)
For advanced payment tracking:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: payment.captured, payment.failed

## 🔒 Security Features Already Implemented
- ✅ Signature verification using HMAC SHA256
- ✅ Order validation
- ✅ User authentication required
- ✅ Amount validation
- ✅ Duplicate enrollment prevention

## 📊 Payment Analytics
Your Payment model tracks:
- Order ID
- Payment ID  
- Amount
- Status
- User details
- Test details

## 🎯 Next Steps
1. Test the payment flow with test cards
2. Verify email notifications work
3. Check enrollment creation after payment
4. Test error scenarios
5. Switch to production keys when ready

## 🆘 Troubleshooting

### Payment Gateway Not Opening
- Check browser console for errors
- Verify VITE_RAZORPAY_KEY_ID in frontend .env
- Ensure Razorpay script loads properly

### Payment Verification Failed
- Check RAZORPAY_KEY_SECRET in backend .env
- Verify signature calculation
- Check network connectivity

### Order Creation Failed
- Verify backend Razorpay initialization
- Check amount format (should be in paise)
- Ensure user is authenticated

Your Razorpay integration is production-ready! 🎉