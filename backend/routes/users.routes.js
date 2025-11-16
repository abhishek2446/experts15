const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate({
        path: 'enrollments',
        populate: {
          path: 'testId',
          select: 'title examType durationMins totalMarks'
        }
      });

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const { name, profile } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (profile) updateData.profile = { ...req.user.profile, ...profile };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate('testId', 'title examType durationMins totalMarks isPaid price')
      .sort({ enrolledAt: -1 });

    const dashboardData = {
      totalEnrollments: enrollments.length,
      totalAttempts: enrollments.reduce((sum, e) => sum + e.attempts.length, 0),
      enrollments: enrollments.map(enrollment => ({
        _id: enrollment._id,
        test: enrollment.testId,
        enrolledAt: enrollment.enrolledAt,
        attempts: enrollment.attempts.length,
        lastAttempt: enrollment.attempts.length > 0 ? 
          enrollment.attempts[enrollment.attempts.length - 1] : null,
        bestScore: enrollment.attempts.length > 0 ? 
          Math.max(...enrollment.attempts.map(a => a.score || 0)) : 0
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;