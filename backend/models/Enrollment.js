const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  paymentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'free'],
    default: 'pending'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  attempts: [{
    attemptNumber: {
      type: Number,
      required: true
    },
    startedAt: {
      type: Date,
      required: true
    },
    completedAt: Date,
    score: {
      type: Number,
      default: 0
    },
    responses: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      chosen: Number,
      marksObtained: {
        type: Number,
        default: 0
      }
    }]
  }]
}, {
  timestamps: true
});

enrollmentSchema.index({ userId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);