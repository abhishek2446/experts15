const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in days
    required: true
  },
  features: [{
    type: String,
    required: true
  }],
  mockTests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    scheduledDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  quizzes: [{
    title: String,
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    timeLimit: Number, // in minutes
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  dailyTasks: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['quiz', 'practice', 'reading', 'video'],
      default: 'practice'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  type: {
    type: String,
    enum: ['free', 'premium', 'ultimate'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);