const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  },
  dailyTasks: [{
    date: {
      type: Date,
      required: true
    },
    tasks: [{
      taskId: String,
      title: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      score: Number
    }]
  }],
  studyStreak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date
  },
  weeklyProgress: [{
    week: String, // YYYY-WW format
    testsCompleted: {
      type: Number,
      default: 0
    },
    quizzesCompleted: {
      type: Number,
      default: 0
    },
    studyHours: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  }],
  monthlyStats: [{
    month: String, // YYYY-MM format
    testsCompleted: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    rank: Number
  }]
}, {
  timestamps: true
});

// Update study streak
userProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = this.studyStreak.lastActiveDate;
  
  if (!lastActive) {
    this.studyStreak.current = 1;
    this.studyStreak.longest = 1;
  } else {
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.studyStreak.current += 1;
      if (this.studyStreak.current > this.studyStreak.longest) {
        this.studyStreak.longest = this.studyStreak.current;
      }
    } else if (daysDiff > 1) {
      this.studyStreak.current = 1;
    }
  }
  
  this.studyStreak.lastActiveDate = today;
};

module.exports = mongoose.model('UserProgress', userProgressSchema);