require('dotenv').config();
const mongoose = require('mongoose');
const Test = require('../models/Test');
const Question = require('../models/Question');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createDemoTest = async () => {
  try {
    await connectDB();

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('Admin user not found. Please create an admin user first.');
      process.exit(1);
    }

    // Check if demo test already exists
    const existingTest = await Test.findOne({ title: 'JEE Mains Demo Test' });
    if (existingTest) {
      console.log('Demo test already exists');
      process.exit(0);
    }

    // Create demo test
    const demoTest = new Test({
      title: 'JEE Mains Demo Test',
      description: 'Free demo test to experience our CBT interface with Physics, Chemistry, and Mathematics questions',
      examType: 'mains',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      durationMins: 30,
      totalMarks: 40,
      totalQuestions: 10,
      difficulty: 'Mixed',
      isPaid: false,
      price: 0,
      visibility: 'public',
      createdBy: admin._id,
      status: 'published',
      settings: {
        shuffleQuestions: false,
        shuffleOptions: false,
        calculatorAccess: true,
        fullscreenRequired: true,
        tabSwitchPunishment: 'warning',
        autoSaveInterval: 10,
        maxTabSwitches: 3
      }
    });

    await demoTest.save();

    // Sample questions
    const questions = [
      // Physics Questions
      {
        testId: demoTest._id,
        qno: 1,
        subject: 'Physics',
        text: 'A ball is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached by the ball? (Take g = 10 m/s²)',
        questionType: 'MCQ',
        options: ['10 m', '20 m', '30 m', '40 m'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'Using v² = u² + 2as, at maximum height v = 0, u = 20 m/s, a = -g = -10 m/s². So 0 = 400 - 20h, h = 20 m.'
      },
      {
        testId: demoTest._id,
        qno: 2,
        subject: 'Physics',
        text: 'The resistance of a wire is 10 Ω. If the wire is stretched to double its length, what will be the new resistance?',
        questionType: 'MCQ',
        options: ['10 Ω', '20 Ω', '40 Ω', '5 Ω'],
        correctOptionIndex: 2,
        marks: 4,
        negativeMarks: -1,
        explanation: 'When length doubles, area becomes half. R = ρl/A, so new R = ρ(2l)/(A/2) = 4ρl/A = 4R = 40 Ω.'
      },
      {
        testId: demoTest._id,
        qno: 3,
        subject: 'Physics',
        text: 'A simple pendulum has a time period of 2 seconds. What is the length of the pendulum? (Take g = 10 m/s²)',
        questionType: 'MCQ',
        options: ['0.5 m', '1 m', '1.5 m', '2 m'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'T = 2π√(l/g), so 2 = 2π√(l/10), solving gives l = 1 m.'
      },
      // Chemistry Questions
      {
        testId: demoTest._id,
        qno: 4,
        subject: 'Chemistry',
        text: 'What is the molecular formula of benzene?',
        questionType: 'MCQ',
        options: ['C₆H₆', 'C₆H₁₂', 'C₆H₁₄', 'C₆H₁₀'],
        correctOptionIndex: 0,
        marks: 4,
        negativeMarks: -1,
        explanation: 'Benzene is an aromatic compound with 6 carbon atoms and 6 hydrogen atoms, formula C₆H₆.'
      },
      {
        testId: demoTest._id,
        qno: 5,
        subject: 'Chemistry',
        text: 'Which of the following is the strongest acid?',
        questionType: 'MCQ',
        options: ['HCl', 'HNO₃', 'H₂SO₄', 'HClO₄'],
        correctOptionIndex: 3,
        marks: 4,
        negativeMarks: -1,
        explanation: 'HClO₄ (perchloric acid) is the strongest acid among the given options.'
      },
      {
        testId: demoTest._id,
        qno: 6,
        subject: 'Chemistry',
        text: 'What is the oxidation state of chromium in K₂Cr₂O₇?',
        questionType: 'MCQ',
        options: ['+3', '+6', '+7', '+2'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'In K₂Cr₂O₇, K is +1, O is -2. So 2(+1) + 2x + 7(-2) = 0, solving gives x = +6.'
      },
      {
        testId: demoTest._id,
        qno: 7,
        subject: 'Chemistry',
        text: 'Which gas is evolved when zinc reacts with dilute hydrochloric acid?',
        questionType: 'MCQ',
        options: ['Oxygen', 'Hydrogen', 'Chlorine', 'Carbon dioxide'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'Zn + 2HCl → ZnCl₂ + H₂. Hydrogen gas is evolved.'
      },
      // Mathematics Questions
      {
        testId: demoTest._id,
        qno: 8,
        subject: 'Mathematics',
        text: 'If log₂ x = 3, then x equals:',
        questionType: 'MCQ',
        options: ['6', '8', '9', '12'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'log₂ x = 3 means 2³ = x, so x = 8.'
      },
      {
        testId: demoTest._id,
        qno: 9,
        subject: 'Mathematics',
        text: 'The derivative of sin(2x) with respect to x is:',
        questionType: 'MCQ',
        options: ['cos(2x)', '2cos(2x)', '-2cos(2x)', '2sin(2x)'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'd/dx[sin(2x)] = cos(2x) × d/dx(2x) = cos(2x) × 2 = 2cos(2x).'
      },
      {
        testId: demoTest._id,
        qno: 10,
        subject: 'Mathematics',
        text: 'The sum of first n natural numbers is:',
        questionType: 'MCQ',
        options: ['n(n+1)', 'n(n+1)/2', 'n(n-1)/2', 'n²'],
        correctOptionIndex: 1,
        marks: 4,
        negativeMarks: -1,
        explanation: 'Sum = 1+2+3+...+n = n(n+1)/2 using the arithmetic series formula.'
      }
    ];

    // Create questions
    const questionIds = [];
    for (const questionData of questions) {
      const question = new Question(questionData);
      await question.save();
      questionIds.push(question._id);
    }

    // Update test with question IDs
    demoTest.questions = questionIds;
    await demoTest.save();

    console.log('✅ Demo test created successfully!');
    console.log(`Test ID: ${demoTest._id}`);
    console.log(`Questions created: ${questionIds.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo test:', error);
    process.exit(1);
  }
};

createDemoTest();