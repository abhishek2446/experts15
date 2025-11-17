const express = require('express');
const multer = require('multer');
const path = require('path');
const { adminAuth } = require('../middleware/auth');
const Test = require('../models/Test');
const Question = require('../models/Question');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Package = require('../models/Package');
const UserProgress = require('../models/UserProgress');
const { parseQuestionPDF, parseAnswerKeyPDF } = require('../utils/pdfParser');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /api/admin/users - List all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .populate('enrollments')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/tests - List all tests
router.get('/tests', adminAuth, async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    console.error('Get admin tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests - Create new test
router.post('/tests', adminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      examType,
      subjects,
      durationMins,
      totalMarks,
      totalQuestions,
      difficulty,
      isPaid,
      price,
      visibility,
      scheduledDate,
      settings
    } = req.body;

    const test = new Test({
      title,
      description,
      examType,
      subjects: subjects || ['Physics', 'Chemistry', 'Mathematics'],
      durationMins,
      totalMarks,
      totalQuestions,
      difficulty: difficulty || 'Mixed',
      isPaid: isPaid || false,
      price: price || 0,
      visibility: visibility || 'public',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      settings: {
        shuffleQuestions: settings?.shuffleQuestions || false,
        shuffleOptions: settings?.shuffleOptions || false,
        calculatorAccess: settings?.calculatorAccess !== false,
        fullscreenRequired: settings?.fullscreenRequired !== false,
        tabSwitchPunishment: settings?.tabSwitchPunishment || 'warning',
        autoSaveInterval: settings?.autoSaveInterval || 10,
        maxTabSwitches: settings?.maxTabSwitches || 3
      },
      createdBy: req.user._id,
      status: 'draft'
    });

    await test.save();

    res.status(201).json({
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/tests/:id - Update test
router.put('/tests/:id', adminAuth, async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({
      message: 'Test updated successfully',
      test
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests/:id/upload-questions - Upload question PDF
router.post('/tests/:id/upload-questions', adminAuth, upload.single('questionPdf'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Parse PDF with enhanced extraction
    const parseResult = await parseQuestionPDF(req.file.path);
    
    // Enhance questions with auto-detection
    if (parseResult.success && parseResult.questions) {
      const { enhanceQuestions } = require('../utils/pdfParser');
      parseResult.questions = enhanceQuestions(parseResult.questions);
    }
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Failed to parse PDF: ' + parseResult.error });
    }

    // Update test with parsed questions and file URL
    test.questionPdfFileUrl = `/uploads/${req.file.filename}`;
    test.parsedQuestions = parseResult.questions;
    await test.save();

    res.json({
      message: 'Questions uploaded and parsed successfully',
      questionsCount: parseResult.questions.length,
      questions: parseResult.questions,
      fileUrl: test.questionPdfFileUrl
    });
  } catch (error) {
    console.error('Upload questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests/:id/upload-answerkey - Upload answer key PDF
router.post('/tests/:id/upload-answerkey', adminAuth, upload.single('answerKeyPdf'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Parse answer key PDF
    const parseResult = await parseAnswerKeyPDF(req.file.path);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Failed to parse answer key: ' + parseResult.error });
    }

    // Update parsed questions with correct answers
    if (test.parsedQuestions && test.parsedQuestions.length > 0) {
      test.parsedQuestions.forEach(question => {
        if (parseResult.answers[question.qno] !== undefined) {
          question.correctOptionIndex = parseResult.answers[question.qno];
        }
      });
    }

    test.answerKeyFileUrl = `/uploads/${req.file.filename}`;
    await test.save();

    res.json({
      message: 'Answer key uploaded and processed successfully',
      answers: parseResult.answers,
      fileUrl: test.answerKeyFileUrl
    });
  } catch (error) {
    console.error('Upload answer key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests/:id/publish - Publish test (convert parsed questions to Question documents)
router.post('/tests/:id/publish', adminAuth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (!test.parsedQuestions || test.parsedQuestions.length === 0) {
      return res.status(400).json({ error: 'No questions found. Please upload questions first.' });
    }

    // Validate that questions have correct answers
    const questionsWithoutAnswers = test.parsedQuestions.filter(q => q.correctOptionIndex === undefined || q.correctOptionIndex === null);
    if (questionsWithoutAnswers.length > 0) {
      return res.status(400).json({ 
        error: `${questionsWithoutAnswers.length} questions are missing correct answers. Please upload answer key first.`,
        questionsWithoutAnswers: questionsWithoutAnswers.map(q => q.qno)
      });
    }

    // Check if test is already published
    if (test.status === 'published') {
      return res.status(400).json({ error: 'Test is already published' });
    }

    // Create Question documents from parsed questions
    const questions = [];
    const subjectMapping = {
      'Physics': 'Physics',
      'Chemistry': 'Chemistry', 
      'Mathematics': 'Mathematics',
      'Math': 'Mathematics',
      'Maths': 'Mathematics'
    };
    
    for (const parsedQ of test.parsedQuestions) {
      // Determine subject based on question number or default assignment
      let subject = 'Physics'; // default
      if (parsedQ.subject) {
        subject = subjectMapping[parsedQ.subject] || 'Physics';
      } else {
        // Auto-assign based on question number (assuming equal distribution)
        const questionsPerSubject = Math.ceil(test.parsedQuestions.length / 3);
        if (parsedQ.qno <= questionsPerSubject) {
          subject = 'Physics';
        } else if (parsedQ.qno <= questionsPerSubject * 2) {
          subject = 'Chemistry';
        } else {
          subject = 'Mathematics';
        }
      }
      
      const question = new Question({
        testId: test._id,
        qno: parsedQ.qno,
        subject: subject,
        text: parsedQ.text,
        options: parsedQ.options || [],
        correctOptionIndex: parsedQ.correctOptionIndex,
        marks: parsedQ.marks || 4,
        negativeMarks: parsedQ.negativeMarks || -1,
        questionType: parsedQ.questionType || 'MCQ',
        images: parsedQ.images || [],
        explanation: parsedQ.explanation || ''
      });
      
      try {
        await question.save();
        questions.push(question._id);
      } catch (error) {
        console.error(`Error saving question ${parsedQ.qno}:`, error);
        throw new Error(`Failed to save question ${parsedQ.qno}: ${error.message}`);
      }
    }

    // Update test
    test.questions = questions;
    test.status = 'published';
    test.totalQuestions = questions.length; // Update actual question count
    await test.save();

    res.json({
      message: 'Test published successfully',
      questionsCreated: questions.length,
      testId: test._id
    });
  } catch (error) {
    console.error('Publish test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/tests/:id - Delete test
router.delete('/tests/:id', adminAuth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Delete associated questions if published
    if (test.status === 'published') {
      await Question.deleteMany({ testId: test._id });
    }

    // Delete associated enrollments
    await Enrollment.deleteMany({ testId: test._id });

    // Delete the test
    await Test.findByIdAndDelete(req.params.id);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests/:id/unpublish - Unpublish test
router.post('/tests/:id/unpublish', adminAuth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.status !== 'published') {
      return res.status(400).json({ error: 'Test is not published' });
    }

    // Delete associated questions
    await Question.deleteMany({ testId: test._id });

    // Update test status
    test.status = 'draft';
    test.questions = [];
    await test.save();

    res.json({ message: 'Test unpublished successfully' });
  } catch (error) {
    console.error('Unpublish test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests/:id/duplicate - Duplicate test
router.post('/tests/:id/duplicate', adminAuth, async (req, res) => {
  try {
    const originalTest = await Test.findById(req.params.id);
    if (!originalTest) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const duplicatedTest = new Test({
      ...originalTest.toObject(),
      _id: undefined,
      title: `${originalTest.title} (Copy)`,
      status: 'draft',
      questions: [],
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicatedTest.save();
    res.json({ message: 'Test duplicated successfully', test: duplicatedTest });
  } catch (error) {
    console.error('Duplicate test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/tests/:id/attempts - View test attempts
router.get('/tests/:id/attempts', adminAuth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ testId: req.params.id })
      .populate('userId', 'name email')
      .populate('testId', 'title totalMarks')
      .sort({ createdAt: -1 });

    const attempts = enrollments.flatMap(enrollment => 
      enrollment.attempts.map(attempt => ({
        userId: enrollment.userId._id,
        userName: enrollment.userId.name,
        userEmail: enrollment.userId.email,
        testTitle: enrollment.testId.title,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        score: attempt.score,
        timeSpent: attempt.timeSpent,
        status: attempt.completedAt ? 'completed' : 'in_progress'
      }))
    ).filter(attempt => attempt.completedAt);

    res.json({ attempts });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/tests/:id/export - Export results as CSV
router.get('/tests/:id/export', adminAuth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const enrollments = await Enrollment.find({ testId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const csvData = [];
    csvData.push(['Name', 'Email', 'Score', 'Time Spent (mins)', 'Completed At', 'Rank']);

    const completedAttempts = enrollments
      .flatMap(enrollment => 
        enrollment.attempts
          .filter(attempt => attempt.completedAt)
          .map(attempt => ({
            name: enrollment.userId.name,
            email: enrollment.userId.email,
            score: attempt.score || 0,
            timeSpent: Math.round((attempt.timeSpent || 0) / 60),
            completedAt: attempt.completedAt,
          }))
      )
      .sort((a, b) => b.score - a.score);

    completedAttempts.forEach((attempt, index) => {
      csvData.push([
        attempt.name,
        attempt.email,
        attempt.score,
        attempt.timeSpent,
        new Date(attempt.completedAt).toLocaleString(),
        index + 1
      ]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${test.title}_results.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export results error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/tests/:id/toppers - Get top performers
router.get('/tests/:id/toppers', adminAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const enrollments = await Enrollment.find({ testId: req.params.id })
      .populate('userId', 'name email')
      .populate('testId', 'title totalMarks');

    const toppers = enrollments
      .flatMap(enrollment => 
        enrollment.attempts
          .filter(attempt => attempt.completedAt)
          .map(attempt => ({
            userId: enrollment.userId._id,
            name: enrollment.userId.name,
            email: enrollment.userId.email,
            score: attempt.score || 0,
            timeSpent: attempt.timeSpent || 0,
            completedAt: attempt.completedAt,
            percentage: ((attempt.score || 0) / enrollment.testId.totalMarks) * 100
          }))
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map((topper, index) => ({ ...topper, rank: index + 1 }));

    res.json({ toppers });
  } catch (error) {
    console.error('Get toppers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/tests/:id/questions - Add/Update questions manually
router.post('/tests/:id/questions', adminAuth, async (req, res) => {
  try {
    const { questions } = req.body
    const test = await Test.findById(req.params.id)
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' })
    }

    // Update parsed questions
    test.parsedQuestions = questions
    await test.save()

    res.json({
      message: 'Questions updated successfully',
      questionsCount: questions.length
    })
  } catch (error) {
    console.error('Update questions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/admin/notifications/send - Send test notifications
router.post('/notifications/send', adminAuth, async (req, res) => {
  try {
    const { testId, recipients, customEmails, subject, message } = req.body
    
    let emailList = []
    
    if (recipients === 'all') {
      const users = await User.find({ role: 'student' }, 'email')
      emailList = users.map(u => u.email)
    } else if (recipients === 'enrolled') {
      const enrollments = await Enrollment.find({ testId }).populate('userId', 'email')
      emailList = enrollments.map(e => e.userId.email)
    } else if (recipients === 'custom') {
      emailList = customEmails
    }

    // Here you would integrate with your email service
    // For now, we'll just log the notification
    console.log('Sending notification to:', emailList.length, 'recipients')
    console.log('Subject:', subject)
    console.log('Message:', message)

    res.json({
      message: `Notification sent to ${emailList.length} recipients`,
      recipients: emailList.length
    })
  } catch (error) {
    console.error('Send notification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/admin/debug/test-creation - Debug test creation
router.post('/debug/test-creation', adminAuth, async (req, res) => {
  try {
    console.log('Debug: Test creation request received');
    console.log('Request body:', req.body);
    
    const testData = {
      title: 'Debug Test',
      description: 'Test for debugging',
      examType: 'main',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      durationMins: 180,
      totalMarks: 300,
      totalQuestions: 75,
      difficulty: 'Mixed',
      isPaid: false,
      price: 0,
      visibility: 'public',
      createdBy: req.user._id,
      status: 'draft'
    };
    
    const test = new Test(testData);
    await test.save();
    
    console.log('Debug: Test created successfully:', test._id);
    
    res.json({
      success: true,
      message: 'Debug test created successfully',
      test: test
    });
  } catch (error) {
    console.error('Debug test creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Package Management Routes

// GET /api/admin/packages - List all packages
router.get('/packages', adminAuth, async (req, res) => {
  try {
    const packages = await Package.find()
      .populate('mockTests.test', 'title description durationMins totalMarks')
      .sort({ price: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/packages - Create package
router.post('/packages', adminAuth, async (req, res) => {
  try {
    const package = new Package(req.body);
    await package.save();
    res.status(201).json({ message: 'Package created successfully', package });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/packages/:id - Update package
router.put('/packages/:id', adminAuth, async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json({ message: 'Package updated successfully', package });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/packages/:id/add-test - Add test to package
router.post('/packages/:id/add-test', adminAuth, async (req, res) => {
  try {
    const { testId, scheduledDate } = req.body;
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    package.mockTests.push({
      test: testId,
      scheduledDate: new Date(scheduledDate),
      isActive: true
    });

    await package.save();
    res.json({ message: 'Test added to package successfully', package });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/packages/:id/add-quiz - Add quiz to package
router.post('/packages/:id/add-quiz', adminAuth, async (req, res) => {
  try {
    const { title, questions, timeLimit } = req.body;
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }

    package.quizzes.push({
      title,
      questions,
      timeLimit,
      isActive: true
    });

    await package.save();
    res.json({ message: 'Quiz added to package successfully', package });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/packages/:id/add-task - Add daily task to package
router.post('/packages/:id/add-task', adminAuth, async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }

    package.dailyTasks.push({
      title,
      description,
      type,
      isActive: true
    });

    await package.save();
    res.json({ message: 'Daily task added to package successfully', package });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users/:id/progress - Get user progress
router.get('/users/:id/progress', adminAuth, async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ user: req.params.id })
      .populate('user', 'name email')
      .populate('package', 'name type');
    
    if (!userProgress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    res.json(userProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/analytics - Enhanced analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalTests = await Test.countDocuments();
    const publishedTests = await Test.countDocuments({ status: 'published' });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalPackages = await Package.countDocuments();
    const activeSubscriptions = await User.countDocuments({ 'subscription.active': true });

    // Revenue calculation
    const paidEnrollments = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'test'
        }
      },
      {
        $unwind: '$test'
      },
      {
        $match: {
          'test.isPaid': true
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$test.price' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Package revenue
    const packageRevenue = await User.aggregate([
      {
        $match: {
          'subscription.active': true
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: 'subscription.package',
          foreignField: '_id',
          as: 'package'
        }
      },
      {
        $unwind: '$package'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$package.price' },
          count: { $sum: 1 }
        }
      }
    ]);

    const testRevenue = paidEnrollments.length > 0 ? paidEnrollments[0].totalRevenue : 0;
    const subscriptionRevenue = packageRevenue.length > 0 ? packageRevenue[0].totalRevenue : 0;

    res.json({
      totalUsers,
      totalTests,
      publishedTests,
      totalEnrollments,
      totalPackages,
      activeSubscriptions,
      totalRevenue: testRevenue + subscriptionRevenue,
      testRevenue,
      subscriptionRevenue,
      paidEnrollments: paidEnrollments.length > 0 ? paidEnrollments[0].count : 0
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;