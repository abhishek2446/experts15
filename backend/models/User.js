const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    phone: String,
    institute: String,
    city: String,
    state: String,
    targetExam: {
      type: String,
      enum: ['JEE Main', 'JEE Advanced', 'Both'],
      default: 'JEE Main'
    },
    targetYear: String,
    profileImage: String,
    bio: String
  },
  enrollments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment'
  }],
  subscription: {
    active: {
      type: Boolean,
      default: false
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'ultimate'],
      default: 'free'
    },
    startDate: Date,
    expiryDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  progress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProgress'
  },
  lastLoginDate: Date,
  totalStudyTime: {
    type: Number,
    default: 0
  }
},
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      dailyReminder: {
        type: Boolean,
        default: true
      },
      testReminder: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  if (this.passwordHash) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);