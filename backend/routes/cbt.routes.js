const express = require('express');
const { auth } = require('../middleware/auth');
const Test = require('../models/Test');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// POST /api/cbt/:testId/start - Start CBT test
router.post('/:testId/start', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await Test.findById(testId);
    if (!test || test.status !== 'published') {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Check enrollment or auto-enroll for demo test
    let enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId
    });

    if (!enrollment) {
      // Check if this is the demo test
      const isDemoTest = test.title.includes('Demo Test');
      
      if (isDemoTest) {
        // Auto-enroll in demo test
        enrollment = new Enrollment({
          userId: req.user._id,
          testId,
          enrolledAt: new Date(),
          paymentStatus: 'free'
        });
        await enrollment.save();
      } else {
        return res.status(403).json({ error: 'Not enrolled in this test' });
      }
    }

    // Check if user has active attempt in enrollment
    const activeAttempt = enrollment.attempts.find(a => !a.completedAt);

    if (activeAttempt) {
      // Resume existing attempt - calculate remaining time
      const startTime = new Date(activeAttempt.startedAt);
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const totalDuration = test.durationMins * 60;
      const remainingTime = Math.max(0, totalDuration - elapsed);
      
      const questions = await Question.find({ testId })
        .select('qno subject text options questionType marks images')
        .sort({ qno: 1 });

      return res.json({
        message: 'Resuming existing attempt',
        attempt: {
          ...activeAttempt.toObject(),
          timeElapsed: elapsed,
          timeRemaining: remainingTime
        },
        test: {
          _id: test._id,
          title: test.title,
          subjects: test.subjects || ['Physics', 'Chemistry', 'Mathematics'],
          durationMins: test.durationMins,
          totalMarks: test.totalMarks,
          settings: test.settings || {}
        },
        questions
      });
    }

    // Create new attempt in enrollment
    const attemptNumber = enrollment.attempts.length + 1;
    const startTime = new Date();
    const newAttempt = {
      attemptNumber,
      startedAt: startTime,
      score: 0,
      responses: [],
      timeSpent: 0,
      questionTimeLog: []
    };

    enrollment.attempts.push(newAttempt);
    await enrollment.save();

    // Get questions
    const questions = await Question.find({ testId })
      .select('qno subject text options questionType marks images')
      .sort({ qno: 1 });

    res.json({
      message: 'Test started successfully',
      attempt: {
        ...newAttempt,
        timeElapsed: 0,
        timeRemaining: test.durationMins * 60
      },
      test: {
        _id: test._id,
        title: test.title,
        subjects: test.subjects || ['Physics', 'Chemistry', 'Mathematics'],
        durationMins: test.durationMins,
        totalMarks: test.totalMarks,
        settings: test.settings || {}
      },
      questions
    });
  } catch (error) {
    console.error('Start CBT test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cbt/:testId/save-response - Auto-save response with time tracking
router.post('/:testId/save-response', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, selectedOption, isMarkedForReview, timeSpentOnQuestion, currentQuestionIndex } = req.body;

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'No enrollment found' });
    }

    // Find active attempt
    const activeAttempt = enrollment.attempts.find(a => !a.completedAt);
    if (!activeAttempt) {
      return res.status(404).json({ error: 'No active attempt found' });
    }

    // Update or add response
    const existingResponseIndex = activeAttempt.responses.findIndex(r => r.questionId.toString() === questionId);
    
    if (existingResponseIndex !== -1) {
      // Update existing response
      activeAttempt.responses[existingResponseIndex] = {
        questionId,
        chosen: selectedOption,
        isMarkedForReview: isMarkedForReview || false,
        timeSpent: timeSpentOnQuestion || 0
      };
    } else {
      // Add new response
      activeAttempt.responses.push({
        questionId,
        chosen: selectedOption,
        isMarkedForReview: isMarkedForReview || false,
        timeSpent: timeSpentOnQuestion || 0
      });
    }

    // Log question time if provided
    if (timeSpentOnQuestion && currentQuestionIndex !== undefined) {
      if (!activeAttempt.questionTimeLog) {
        activeAttempt.questionTimeLog = [];
      }
      
      const existingLogIndex = activeAttempt.questionTimeLog.findIndex(log => log.questionIndex === currentQuestionIndex);
      if (existingLogIndex !== -1) {
        activeAttempt.questionTimeLog[existingLogIndex].timeSpent += timeSpentOnQuestion;
      } else {
        activeAttempt.questionTimeLog.push({
          questionIndex: currentQuestionIndex,
          questionId,
          timeSpent: timeSpentOnQuestion,
          visits: 1
        });
      }
    }

    await enrollment.save();
    
    res.json({ message: 'Response saved successfully' });
  } catch (error) {
    console.error('Save response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cbt/:testId/submit - Submit test
router.post('/:testId/submit', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const { finalResponses, questionTimeLog } = req.body;

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'No enrollment found' });
    }

    // Find active attempt
    const activeAttempt = enrollment.attempts.find(a => !a.completedAt);
    if (!activeAttempt) {
      return res.status(404).json({ error: 'No active attempt found' });
    }

    // Calculate actual time spent from start time
    const startTime = new Date(activeAttempt.startedAt);
    const endTime = new Date();
    const actualTimeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Get test duration for validation
    const test = await Test.findById(testId);
    const maxDuration = test.durationMins * 60;
    
    // Validate time spent (shouldn't exceed test duration + 30 seconds buffer)
    const validatedTimeSpent = Math.min(actualTimeSpent, maxDuration + 30);

    // Get questions for scoring
    const questions = await Question.find({ testId });

    // Calculate scores
    let totalScore = 0;
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;

    const processedResponses = finalResponses.map(response => {
      const question = questions.find(q => q._id.toString() === response.questionId);
      if (!question) return null;

      let isCorrect = false;
      let marksObtained = 0;

      if (response.selectedOption !== undefined && response.selectedOption !== null) {
        attempted++;

        if (response.selectedOption === question.correctOptionIndex) {
          isCorrect = true;
          marksObtained = question.marks;
          correct++;
        } else {
          marksObtained = question.negativeMarks || -1;
          incorrect++;
        }

        totalScore += marksObtained;
      }

      return {
        questionId: response.questionId,
        chosen: response.selectedOption,
        isMarkedForReview: response.isMarkedForReview || false,
        marksObtained,
        isCorrect
      };
    }).filter(Boolean);

    // Update attempt with comprehensive data
    activeAttempt.completedAt = endTime;
    activeAttempt.score = totalScore;
    activeAttempt.responses = processedResponses;
    activeAttempt.timeSpent = validatedTimeSpent;
    activeAttempt.questionTimeLog = questionTimeLog || [];

    await enrollment.save();

    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    res.json({
      message: 'Test submitted successfully',
      attempt: {
        ...activeAttempt.toObject(),
        actualTimeSpent: validatedTimeSpent,
        timeExceeded: actualTimeSpent > maxDuration
      },
      score: { total: totalScore },
      analytics: {
        totalQuestions: questions.length,
        attempted,
        correct,
        incorrect,
        notAttempted: questions.length - attempted,
        accuracy: Math.round(accuracy * 100) / 100,
        timeSpent: validatedTimeSpent,
        averageTimePerQuestion: attempted > 0 ? Math.round(validatedTimeSpent / attempted) : 0
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cbt/:testId/warning - Log warning (tab switch, etc.)
router.post('/:testId/warning', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const { type } = req.body; // 'tab_switch', 'window_blur', 'fullscreen_exit'

    const attempt = await TestAttempt.findOne({
      userId: req.user._id,
      testId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ error: 'No active attempt found' });
    }

    // Find existing warning or create new one
    let warning = attempt.warnings.find(w => w.type === type);
    if (warning) {
      warning.count += 1;
      warning.timestamp = new Date();
    } else {
      attempt.warnings.push({
        type,
        timestamp: new Date(),
        count: 1
      });
    }

    if (type === 'tab_switch') {
      attempt.tabSwitchCount += 1;
    }

    await attempt.save();

    // Check if auto-submit is needed
    const test = await Test.findById(testId);
    if (test.settings.tabSwitchPunishment === 'auto_submit' && 
        attempt.tabSwitchCount >= test.settings.maxTabSwitches) {
      attempt.status = 'auto_submitted';
      attempt.completedAt = new Date();
      await attempt.save();
      
      return res.json({ 
        message: 'Warning logged', 
        autoSubmit: true,
        reason: 'Maximum tab switches exceeded'
      });
    }

    res.json({ 
      message: 'Warning logged',
      warningCount: warning?.count || 1,
      totalTabSwitches: attempt.tabSwitchCount
    });
  } catch (error) {
    console.error('Log warning error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cbt/:testId/result - Get test result
router.get('/:testId/result', auth, async (req, res) => {
  try {
    const { testId } = req.params;

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId
    }).populate('testId', 'title examType totalMarks durationMins');

    if (!enrollment || !enrollment.attempts || enrollment.attempts.length === 0) {
      return res.status(404).json({ error: 'No test attempts found' });
    }

    // Get the latest completed attempt
    const completedAttempt = enrollment.attempts
      .filter(a => a.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

    if (!completedAttempt) {
      return res.status(404).json({ error: 'No completed attempt found' });
    }

    // Calculate analytics
    const questions = await Question.find({ testId });
    const totalQuestions = questions.length;
    const attempted = completedAttempt.responses.length;
    const correct = completedAttempt.responses.filter(r => {
      const q = questions.find(qu => qu._id.toString() === r.questionId.toString());
      return q && r.chosen === q.correctOptionIndex;
    }).length;
    const incorrect = attempted - correct;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    res.json({
      attempt: {
        ...completedAttempt.toObject(),
        analytics: {
          totalQuestions,
          attempted,
          correct,
          incorrect,
          notVisited: totalQuestions - attempted,
          accuracy: Math.round(accuracy * 100) / 100
        },
        score: {
          total: completedAttempt.score,
          physics: 0, // Calculate if needed
          chemistry: 0,
          mathematics: 0
        }
      },
      test: enrollment.testId
    });
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cbt/:testId/review - Get test review with solutions
router.get('/:testId/review', auth, async (req, res) => {
  try {
    const { testId } = req.params;

    // First check if user has completed the test via enrollment
    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      testId
    });

    if (!enrollment || !enrollment.attempts || enrollment.attempts.length === 0) {
      return res.status(404).json({ error: 'No test attempts found' });
    }

    // Get the latest completed attempt
    const completedAttempt = enrollment.attempts
      .filter(a => a.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

    if (!completedAttempt) {
      return res.status(404).json({ error: 'No completed attempt found' });
    }

    const questions = await Question.find({ testId })
      .select('qno subject text options questionType correctOptionIndex correctOptions correctAnswer marks explanation images')
      .sort({ qno: 1 });

    const questionsWithResponses = questions.map(question => {
      const response = completedAttempt.responses.find(r => r.questionId.toString() === question._id.toString());
      return {
        ...question.toObject(),
        userResponse: response || null
      };
    });

    res.json({
      questions: questionsWithResponses,
      attempt: {
        score: completedAttempt.score,
        timeSpent: completedAttempt.timeSpent || 0,
        analytics: {
          totalQuestions: questions.length,
          attempted: completedAttempt.responses.length,
          correct: completedAttempt.responses.filter(r => {
            const q = questions.find(qu => qu._id.toString() === r.questionId.toString());
            return q && r.chosen === q.correctOptionIndex;
          }).length
        }
      }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;