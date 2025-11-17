const mongoose = require('mongoose');
require('dotenv').config();

const Package = require('../models/Package');

const packages = [
  {
    name: 'Free Starter',
    description: 'Perfect for getting started with JEE preparation',
    price: 0,
    duration: 30,
    type: 'free',
    features: [
      '5 Free Mock Tests',
      'Basic Performance Analysis',
      'Solutions & Explanations',
      'Progress Tracking',
      'Mobile Friendly Interface'
    ],
    dailyTasks: [
      {
        title: 'Daily Practice Quiz',
        description: 'Solve 10 questions from previous year papers',
        type: 'quiz'
      },
      {
        title: 'Formula Review',
        description: 'Review important formulas for 15 minutes',
        type: 'reading'
      }
    ]
  },
  {
    name: 'Premium Plan',
    description: 'Most popular plan for serious JEE aspirants',
    price: 499,
    duration: 30,
    type: 'premium',
    features: [
      'Unlimited Mock Tests',
      'Advanced Analytics & Insights',
      'Rank Prediction Algorithm',
      'Video Solutions',
      'Priority Support',
      'Daily Study Tasks',
      'Weekly Progress Reports',
      'Subject-wise Analysis',
      'Time Management Tips'
    ],
    dailyTasks: [
      {
        title: 'Morning Quiz Challenge',
        description: 'Start your day with 15 challenging questions',
        type: 'quiz'
      },
      {
        title: 'Concept Deep Dive',
        description: 'Study one important concept thoroughly',
        type: 'reading'
      },
      {
        title: 'Practice Session',
        description: 'Solve 25 questions from weak areas',
        type: 'practice'
      },
      {
        title: 'Video Lecture',
        description: 'Watch expert explanation videos',
        type: 'video'
      }
    ]
  },
  {
    name: 'Ultimate Plan',
    description: 'Complete package for JEE Main & Advanced mastery',
    price: 999,
    duration: 30,
    type: 'ultimate',
    features: [
      'Everything in Premium',
      '1-on-1 Mentorship Sessions',
      'Custom Study Plans',
      'Live Doubt Clearing Sessions',
      'Personal Performance Coach',
      'Advanced Test Series',
      'IIT Alumni Guidance',
      'Exclusive Study Materials',
      'Career Counseling',
      '24/7 Support'
    ],
    dailyTasks: [
      {
        title: 'Morning Intensive Quiz',
        description: 'Advanced level questions to challenge yourself',
        type: 'quiz'
      },
      {
        title: 'Concept Mastery',
        description: 'Deep dive into complex topics with mentor guidance',
        type: 'reading'
      },
      {
        title: 'Problem Solving Session',
        description: 'Solve 50 questions with detailed analysis',
        type: 'practice'
      },
      {
        title: 'Expert Video Session',
        description: 'Learn from IIT alumni and experts',
        type: 'video'
      },
      {
        title: 'Doubt Clearing',
        description: 'Get your doubts cleared by mentors',
        type: 'practice'
      }
    ]
  }
];

async function createPackages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing packages
    await Package.deleteMany({});
    console.log('Cleared existing packages');

    // Create new packages
    const createdPackages = await Package.insertMany(packages);
    console.log(`Created ${createdPackages.length} packages:`);
    
    createdPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.type}) - ₹${pkg.price}`);
    });

    console.log('Packages created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating packages:', error);
    process.exit(1);
  }
}

createPackages();