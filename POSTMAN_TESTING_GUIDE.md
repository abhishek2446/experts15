# 🧪 Postman Testing Guide for Razorpay Integration

## 📋 Prerequisites

1. **Backend server running** on `http://localhost:5000`
2. **Valid JWT token** for authentication
3. **Razorpay credentials** configured in `.env`

## 🔐 Authentication Setup

### Get JWT Token First:

**POST** `http://localhost:5000/api/auth/login`

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Copy the token** and add to all subsequent requests:
- **Header:** `Authorization`
- **Value:** `Bearer YOUR_JWT_TOKEN_HERE`

---

## 💳 Test Payment Flow

### 1. **Create Order**

**POST** `http://localhost:5000/api/payments/create-order`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "premium",
  "amount": 499
}
```

**Expected Response:**
```json
{
  "success": true,
  "key": "rzp_test_RfzCjbS5iBMfVc",
  "amount": 49900,
  "currency": "INR",
  "order_id": "order_ABC123XYZ",
  "plan": "premium"
}
```

### 2. **Verify Payment** (Mock)

**POST** `http://localhost:5000/api/payments/verify`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "order_ABC123XYZ",
  "paymentId": "pay_TEST123",
  "signature": "mock_signature_for_testing",
  "plan": "premium"
}
```

**Expected Response:**
```json
{
  "message": "Payment verified and subscription activated",
  "subscription": {
    "active": true,
    "plan": "premium",
    "startDate": "2024-01-15T10:30:00.000Z",
    "expiryDate": "2024-02-15T10:30:00.000Z"
  }
}
```

---

## 🔍 Test Different Scenarios

### ✅ **Valid Test Cases**

#### Test 1: Premium Plan
```json
{
  "plan": "premium",
  "amount": 499
}
```

#### Test 2: Ultimate Plan
```json
{
  "plan": "ultimate",
  "amount": 999
}
```

### ❌ **Error Test Cases**

#### Test 3: Missing Plan
```json
{
  "amount": 499
}
```
**Expected:** `400 - Plan and amount are required`

#### Test 4: Invalid Amount
```json
{
  "plan": "premium",
  "amount": 0
}
```
**Expected:** `400 - Amount must be at least 1`

#### Test 5: Invalid Plan
```json
{
  "plan": "invalid_plan",
  "amount": 499
}
```
**Expected:** `400 - Invalid plan. Must be premium or ultimate`

#### Test 6: No Authentication
Remove `Authorization` header
**Expected:** `401 - Access denied. No token provided.`

---

## 🛠 Configuration Tests

### Test Razorpay Configuration

**GET** `http://localhost:5000/api/payments/config`

**Expected Response:**
```json
{
  "razorpayConfigured": true,
  "keyId": "Configured",
  "keySecret": "Configured",
  "canCreateOrders": true,
  "message": "Ready for payments"
}
```

### Test Authentication

**GET** `http://localhost:5000/api/payments/test-auth`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "message": "Authentication successful",
  "user": {
    "id": "user_id_here",
    "email": "student@example.com",
    "name": "Student Name"
  }
}
```

---

## 📊 Database Verification

After successful order creation, check MongoDB:

### Orders Collection:
```javascript
db.payments.find().sort({createdAt: -1}).limit(1)
```

**Should show:**
```json
{
  "_id": "...",
  "userId": "...",
  "razorpayOrderId": "order_ABC123XYZ",
  "amount": 499,
  "plan": "premium",
  "status": "created",
  "type": "subscription",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### User Subscription:
```javascript
db.users.findOne({email: "student@example.com"})
```

**After payment verification:**
```json
{
  "subscription": {
    "active": true,
    "plan": "premium",
    "startDate": "2024-01-15T10:30:00.000Z",
    "expiryDate": "2024-02-15T10:30:00.000Z"
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Receipt too long"
**Solution:** Receipt is now fixed to `order_${Date.now()}` (< 40 chars)

### Issue 2: "Razorpay not configured"
**Solution:** Check `.env` file has correct `RAZORPAY_KEY_SECRET`

### Issue 3: "Invalid signature"
**Solution:** For testing, use any mock signature. Real verification happens with actual Razorpay response.

### Issue 4: "Authentication failed"
**Solution:** Ensure JWT token is valid and not expired

---

## 🎯 Success Criteria

✅ Order creation returns `success: true`
✅ Receipt field is under 40 characters
✅ Amount is converted to paise (×100)
✅ Order saved in database with `status: "created"`
✅ Payment verification updates user subscription
✅ All error cases handled properly

---

**🔥 Your Razorpay integration is working when all these tests pass!**