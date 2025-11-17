const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const auth = require('../middleware/auth');

// Get all packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true })
      .populate('mockTests.test', 'title description durationMins totalMarks examType')
      .sort({ price: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to package
router.post('/:packageId/subscribe', auth, async (req, res) => {
  try {
    const package = await Package.findById(req.params.packageId);
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const user = await User.findById(req.user.id);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + package.duration);

    // Update user subscription
    user.subscription = {
      active: true,
      package: package._id,
      plan: package.type,
      startDate: new Date(),
      expiryDate: expiryDate,
      autoRenew: req.body.autoRenew || false
    };

    // Create or update user progress
    let userProgress = await UserProgress.findOne({ user: user._id });
    if (!userProgress) {
      userProgress = new UserProgress({
        user: user._id,
        package: package._id
      });
      await userProgress.save();
      user.progress = userProgress._id;
    } else {
      userProgress.package = package._id;
      await userProgress.save();
    }

    await user.save();

    res.json({
      message: 'Successfully subscribed to package',
      subscription: user.subscription,
      package: package
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's current package details
router.get('/my-package', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subscription.package')
      .populate('progress');

    if (!user.subscription.active) {
      return res.json({ message: 'No active subscription' });
    }

    res.json({
      subscription: user.subscription,
      progress: user.progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;