const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['main', 'advanced'],
    required: true
  },
  subjects: [{
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics'],
    default: ['Physics', 'Chemistry', 'Mathematics']
  }],
  durationMins: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Hard', 'Mixed'],
    default: 'Mixed'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'scheduled'],
    default: 'public'
  },
  scheduledDate: Date,
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    calculatorAccess: { type: Boolean, default: true },
    fullscreenRequired: { type: Boolean, default: true },
    tabSwitchPunishment: {
      type: String,
      enum: ['warning', 'subtract_marks', 'auto_submit'],
      default: 'warning'
    },
    autoSaveInterval: { type: Number, default: 10 },
    maxTabSwitches: { type: Number, default: 3 }
  },
  answerKeyFileUrl: String,
  questionPdfFileUrl: String,
  parsedQuestions: [{
    qno: Number,
    subject: String,
    text: String,
    options: [String],
    correctOptionIndex: Number,
    marks: Number,
    negativeMarks: { type: Number, default: -1 },
    questionType: {
      type: String,
      enum: ['MCQ', 'MSQ', 'Integer'],
      default: 'MCQ'
    },
    imageUrl: String,
    solution: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);