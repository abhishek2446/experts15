const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Test = require('../models/Test');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { sendPaymentSuccessEmail } = require('../utils/email');

const router = express.Router();

// Initialize Razorpay
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_SECRET !== 'YOUR_SECRET_KEY_HERE' && 
    process.env.RAZORPAY_KEY_SECRET !== 'test_secret_key_placeholder') {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error.message);
  }
} else {
  console.log('Razorpay not configured - using test mode');
}

// POST /api/tests/:id/enroll - Create Razorpay order for test enrollment
router.post('/tests/:id/enroll', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || test.status !== 'published') {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId: test._id
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this test' });
    }

    // For free tests, create enrollment directly
    if (!test.isPaid || test.price === 0) {
      const enrollment = new Enrollment({
        userId: req.user._id,
        testId: test._id,
        paymentId: 'FREE'
      });
      await enrollment.save();

      // Add to user's enrollments
      await User.findByIdAndUpdate(req.user._id, {
        $push: { enrollments: enrollment._id }
      });

      return res.json({
        message: 'Enrolled successfully',
        enrollment,
        isFree: true
      });
    }

    // Create Razorpay order for paid tests
    if (!razorpay) {
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const options = {
      amount: test.price * 100, // amount in paise
      currency: 'INR',
      receipt: `test_${test._id}_${Date.now()}`,
      notes: {
        testId: test._id.toString(),
        userId: req.user._id.toString(),
        testTitle: test.title
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      razorpayOrderId: order.id,
      userId: req.user._id,
      testId: test._id,
      amount: test.price,
      status: 'created'
    });
    await payment.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      testTitle: test.title,
      userEmail: req.user.email,
      userName: req.user.name
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payments/verify - Verify Razorpay payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user._id
    }).populate('testId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update payment status
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = 'paid';
    await payment.save();

    // Create enrollment
    const enrollment = new Enrollment({
      userId: req.user._id,
      testId: payment.testId._id,
      paymentId: razorpay_payment_id
    });
    await enrollment.save();

    // Add to user's enrollments
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrollments: enrollment._id }
    });

    // Send success email
    await sendPaymentSuccessEmail(
      req.user.email,
      req.user.name,
      payment.testId.title
    );

    res.json({
      message: 'Payment verified and enrollment completed',
      enrollment,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/payments/config - Get payment configuration status (public)
router.get('/config', (req, res) => {
  const isSecretValid = process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_SECRET !== 'YOUR_SECRET_KEY_HERE' && 
    process.env.RAZORPAY_KEY_SECRET !== 'test_secret_key_placeholder';
    
  res.json({
    razorpayConfigured: !!razorpay,
    keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured',
    keySecret: isSecretValid ? 'Configured' : 'Not configured (using placeholder)',
    canCreateOrders: !!razorpay,
    message: razorpay ? 'Ready for payments' : 'Razorpay credentials needed'
  });
});

// GET /api/payments/test-auth - Test authentication
router.get('/test-auth', auth, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    console.log('Creating subscription order for user:', req.user._id);
    console.log('Request body:', req.body);
    
    const { plan, amount } = req.body;
    
    // Validation
    if (!plan || !amount) {
      return res.status(400).json({ error: 'Plan and amount are required' });
    }
    
    if (amount < 1) {
      return res.status(400).json({ error: 'Amount must be at least 1' });
    }
    
    if (!['premium', 'ultimate'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be premium or ultimate' });
    }
    
    // Check if Razorpay is properly configured
    if (!razorpay) {
      return res.status(500).json({ 
        error: 'Payment service not configured' 
      });
    }
    
    // Generate short receipt (< 40 chars)
    const receipt = `order_${Date.now()}`;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: req.user._id.toString(),
        plan: plan,
        type: 'subscription'
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Save order in database
    const orderRecord = new Payment({
      userId: req.user._id,
      razorpayOrderId: order.id,
      amount: amount,
      plan: plan,
      status: 'created',
      type: 'subscription'
    });
    await orderRecord.save();
    
    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      plan: plan
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Unable to create order',
      message: error.message 
    });
  }
});

// POST /api/payments/verify - Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      plan
    } = req.body;

    // Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find and update payment record
    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      userId: req.user._id
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update payment status
    payment.razorpayPaymentId = paymentId;
    payment.status = 'paid';
    await payment.save();

    // Update user subscription
    const user = await User.findById(req.user._id);
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month validity
    
    user.subscription = {
      active: true,
      plan: plan,
      startDate: new Date(),
      expiryDate: subscriptionEnd
    };
    
    await user.save();

    // Send success email
    try {
      await sendPaymentSuccessEmail(
        user.email,
        user.name,
        `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      message: 'Payment verified and subscription activated',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;