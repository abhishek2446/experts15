const express = require('express');
const router = express.Router();
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get user dashboard data with progress
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subscription.package')
      .populate('progress');

    let userProgress = user.progress;
    if (!userProgress) {
      userProgress = new UserProgress({ user: user._id });
      await userProgress.save();
      user.progress = userProgress._id;
      await user.save();
    }

    // Update last login
    user.lastLoginDate = new Date();
    await user.save();

    // Get today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayTasks = userProgress.dailyTasks.find(dt => 
      dt.date.toDateString() === today.toDateString()
    );

    if (!todayTasks && user.subscription.package) {
      // Generate today's tasks from package
      const packageData = user.subscription.package;
      todayTasks = {
        date: today,
        tasks: packageData.dailyTasks.map(task => ({
          taskId: task._id.toString(),
          title: task.title,
          completed: false
        }))
      };
      userProgress.dailyTasks.push(todayTasks);
      await userProgress.save();
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        lastLoginDate: user.lastLoginDate,
        totalStudyTime: user.totalStudyTime
      },
      progress: userProgress,
      todayTasks: todayTasks?.tasks || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete daily task
router.post('/task/:taskId/complete', auth, async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ user: req.user.id });
    if (!userProgress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = userProgress.dailyTasks.find(dt => 
      dt.date.toDateString() === today.toDateString()
    );

    if (todayTasks) {
      const task = todayTasks.tasks.find(t => t.taskId === req.params.taskId);
      if (task) {
        task.completed = true;
        task.completedAt = new Date();
        task.score = req.body.score || 0;

        // Update streak if all tasks completed
        const allCompleted = todayTasks.tasks.every(t => t.completed);
        if (allCompleted) {
          userProgress.updateStreak();
        }

        await userProgress.save();
        res.json({ message: 'Task completed', task });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } else {
      res.status(404).json({ error: 'No tasks for today' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly progress
router.get('/weekly', auth, async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ user: req.user.id });
    if (!userProgress) {
      return res.json({ weeklyProgress: [] });
    }

    // Get last 7 days progress
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayTasks = userProgress.dailyTasks.find(dt => 
        dt.date.toDateString() === date.toDateString()
      );

      const completedTasks = dayTasks ? dayTasks.tasks.filter(t => t.completed).length : 0;
      const totalTasks = dayTasks ? dayTasks.tasks.length : 0;

      weekData.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    res.json({ weeklyProgress: weekData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;