const express = require('express');
const { auth } = require('../middleware/auth');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');

const router = express.Router();

// Initialize Razorpay
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// GET /api/tests - List all published tests
router.get('/', async (req, res) => {
  try {
    const { examType, isPaid, subject, difficulty } = req.query;
    
    const filter = { status: 'published' };
    if (examType) filter.examType = examType;
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';
    if (subject) filter.subjects = { $in: [subject] };
    if (difficulty) filter.difficulty = difficulty;

    const tests = await Test.find(filter)
      .select('title description examType subjects durationMins totalMarks totalQuestions difficulty isPaid price createdAt')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add question count for each test
    const testsWithQuestionCount = await Promise.all(
      tests.map(async (test) => {
        const questionCount = await Question.countDocuments({ testId: test._id });
        return {
          ...test.toObject(),
          questionCount
        };
      })
    );

    res.json(testsWithQuestionCount);
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tests/:id - Get test details
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-parsedQuestions');

    if (!test || test.status !== 'published') {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    let enrollment = null;
    
    if (req.user) {
      enrollment = await Enrollment.findOne({
        userId: req.user._id,
        testId: test._id
      });
      
      // Auto-enroll in demo test if not enrolled
      if (!enrollment && test.title.includes('Demo Test')) {
        enrollment = new Enrollment({
          userId: req.user._id,
          testId: test._id,
          enrolledAt: new Date(),
          paymentStatus: 'free'
        });
        await enrollment.save();
      }
      
      isEnrolled = !!enrollment;
    }

    const response = {
      ...test.toObject(),
      isEnrolled,
      enrollment
    };

    // Only include questions if user is enrolled
    if (isEnrolled) {
      const questions = await Question.find({ testId: test._id })
        .select('qno text options marks images')
        .sort({ qno: 1 });
      response.questions = questions;
    }

    res.json(response);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tests/:id/start - Start a test attempt
router.post('/:id/start', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId: req.params.id
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this test' });
    }

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Create new attempt
    const attemptNumber = enrollment.attempts.length + 1;
    const newAttempt = {
      attemptNumber,
      startedAt: new Date(),
      responses: []
    };

    enrollment.attempts.push(newAttempt);
    await enrollment.save();

    // Get questions for the test
    const questions = await Question.find({ testId: test._id })
      .select('qno text options marks images')
      .sort({ qno: 1 });

    res.json({
      message: 'Test started successfully',
      attempt: newAttempt,
      test: {
        _id: test._id,
        title: test.title,
        durationMins: test.durationMins,
        totalMarks: test.totalMarks
      },
      questions
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tests/:id/enroll - Enroll in test (create payment order for paid tests)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || test.status !== 'published') {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId: test._id
    });

    if (existingEnrollment) {
      return res.json({
        message: 'Already enrolled in this test',
        enrollment: existingEnrollment,
        alreadyEnrolled: true
      });
    }

    if (test.isPaid && test.price > 0) {
      if (!razorpay) {
        return res.status(500).json({ error: 'Payment service not configured' });
      }
      
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: test.price * 100, // Convert to paise
        currency: 'INR',
        receipt: `test_${test._id}_${req.user._id}`,
        notes: {
          testId: test._id.toString(),
          userId: req.user._id.toString(),
          testTitle: test.title
        }
      });

      // Create payment record
      const payment = new Payment({
        userId: req.user._id,
        testId: test._id,
        orderId: order.id,
        amount: test.price,
        currency: 'INR',
        status: 'created',
        type: 'test'
      });

      await payment.save();

      res.json({
        message: 'Payment order created',
        orderId: order.id,
        amount: test.price,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        test: {
          title: test.title,
          price: test.price
        }
      });
    } else {
      // Free test - direct enrollment
      const enrollment = new Enrollment({
        userId: req.user._id,
        testId: test._id,
        enrolledAt: new Date(),
        paymentStatus: 'free'
      });

      await enrollment.save();

      res.json({
        message: 'Enrolled successfully in free test',
        enrollment
      });
    }
  } catch (error) {
    console.error('Enroll test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tests/:id/submit - Submit test attempt
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { responses } = req.body; // Array of { questionId, chosen }

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId: req.params.id
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this test' });
    }

    // Find the current attempt (last one that's not completed)
    const currentAttempt = enrollment.attempts.find(a => !a.completedAt);
    if (!currentAttempt) {
      return res.status(400).json({ error: 'No active attempt found' });
    }

    // Calculate score
    const questions = await Question.find({ testId: req.params.id });
    let totalScore = 0;

    const processedResponses = responses.map(response => {
      const question = questions.find(q => q._id.toString() === response.questionId);
      let marksObtained = 0;

      if (question && response.chosen === question.correctOptionIndex) {
        marksObtained = question.marks;
        totalScore += marksObtained;
      }

      return {
        questionId: response.questionId,
        chosen: response.chosen,
        marksObtained
      };
    });

    // Update attempt
    currentAttempt.completedAt = new Date();
    currentAttempt.score = totalScore;
    currentAttempt.responses = processedResponses;

    await enrollment.save();

    res.json({
      message: 'Test submitted successfully',
      score: totalScore,
      attempt: currentAttempt
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;