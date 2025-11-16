const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  qno: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'MSQ', 'Integer'],
    default: 'MCQ'
  },
  options: [String],
  correctOptionIndex: {
    type: Number,
    min: 0,
    max: 3
  },
  correctOptions: [Number], // For MSQ
  correctAnswer: Number, // For Integer type
  marks: {
    type: Number,
    required: true,
    default: 4
  },
  negativeMarks: {
    type: Number,
    default: -1
  },
  images: [String],
  explanation: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Hard'],
    default: 'Moderate'
  }
}, {
  timestamps: true
});

questionSchema.index({ testId: 1, qno: 1 }, { unique: true });

module.exports = mongoose.model('Question', questionSchema);