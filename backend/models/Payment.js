const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: function() {
      return this.type === 'test';
    }
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'completed'],
    default: 'created'
  },
  type: {
    type: String,
    enum: ['test', 'subscription'],
    default: 'test'
  },
  plan: {
    type: String,
    enum: ['premium', 'ultimate']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);