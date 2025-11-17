const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');

const router = express.Router();

// GET /api/reviews - Get approved reviews (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ status: 'approved' })
      .populate('userId', 'name profile.profileImage profile.institute')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ status: 'approved' });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews - Create new review
router.post('/', auth, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    if (!rating || !title || !comment) {
      return res.status(400).json({ error: 'Rating, title, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already has a pending/approved review
    const existingReview = await Review.findOne({
      userId: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You already have a review. You can edit your existing review.' });
    }

    const review = new Review({
      userId: req.user._id,
      rating,
      title,
      comment
    });

    await review.save();
    await review.populate('userId', 'name profile.profileImage profile.institute');

    res.status(201).json({
      message: 'Review submitted successfully. It will be visible after admin approval.',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reviews/my - Get user's own reviews
router.get('/my', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reviews/:id - Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.status === 'approved') {
      return res.status(400).json({ error: 'Cannot edit approved review' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.status = 'pending'; // Reset to pending after edit

    await review.save();
    await review.populate('userId', 'name profile.profileImage profile.institute');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes
// GET /api/reviews/admin - Get all reviews for admin
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const reviews = await Review.find(filter)
      .populate('userId', 'name email profile.profileImage profile.institute')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reviews/admin/:id/status - Update review status
router.put('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.status = status;
    if (adminResponse) review.adminResponse = adminResponse;

    await review.save();
    await review.populate('userId', 'name email profile.profileImage profile.institute');

    res.json({
      message: `Review ${status} successfully`,
      review
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/reviews/admin/:id/pin - Pin/Unpin review
router.put('/admin/:id/pin', adminAuth, async (req, res) => {
  try {
    const { isPinned } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.isPinned = isPinned;
    await review.save();

    res.json({
      message: `Review ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      review
    });
  } catch (error) {
    console.error('Pin review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/reviews/admin/:id - Admin delete review
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;