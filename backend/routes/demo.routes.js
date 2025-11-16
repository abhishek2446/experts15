const express = require('express');
const { auth } = require('../middleware/auth');
const Test = require('../models/Test');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// GET /api/demo/test - Get demo test and auto-enroll user
router.get('/test', auth, async (req, res) => {
  try {
    // Find demo test
    const demoTest = await Test.findOne({ 
      title: 'JEE Mains Demo Test',
      status: 'published' 
    });

    if (!demoTest) {
      return res.status(404).json({ error: 'Demo test not found' });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId: demoTest._id
    });

    // Auto-enroll if not already enrolled
    if (!enrollment) {
      enrollment = new Enrollment({
        userId: req.user._id,
        testId: demoTest._id,
        enrolledAt: new Date(),
        paymentStatus: 'free'
      });
      await enrollment.save();
    }

    res.json({
      message: 'Demo test ready',
      testId: demoTest._id,
      enrollment
    });
  } catch (error) {
    console.error('Demo test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;