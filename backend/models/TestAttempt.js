const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
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
  attemptNumber: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: Date,
  timeSpent: Number, // in seconds
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'auto_submitted'],
    default: 'in_progress'
  },
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedOption: Number,
    selectedOptions: [Number], // For MSQ
    integerAnswer: Number, // For Integer type
    isMarkedForReview: { type: Boolean, default: false },
    timeSpent: Number, // in seconds
    visitCount: { type: Number, default: 0 },
    isAnswered: { type: Boolean, default: false }
  }],
  score: {
    total: { type: Number, default: 0 },
    physics: { type: Number, default: 0 },
    chemistry: { type: Number, default: 0 },
    mathematics: { type: Number, default: 0 }
  },
  analytics: {
    totalQuestions: Number,
    attempted: Number,
    correct: Number,
    incorrect: Number,
    markedForReview: Number,
    notVisited: Number,
    accuracy: Number,
    percentile: Number,
    rank: Number
  },
  warnings: [{
    type: {
      type: String,
      enum: ['tab_switch', 'window_blur', 'fullscreen_exit']
    },
    timestamp: Date,
    count: { type: Number, default: 1 }
  }],
  tabSwitchCount: { type: Number, default: 0 },
  autoSaveData: {
    lastSaved: Date,
    currentQuestion: Number,
    currentSubject: String
  }
}, {
  timestamps: true
});

testAttemptSchema.index({ userId: 1, testId: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);