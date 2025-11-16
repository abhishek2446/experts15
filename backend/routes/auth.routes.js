const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/email');

const router = express.Router();

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create or update user
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    let user;
    if (existingUser) {
      user = existingUser;
      user.name = name;
      user.passwordHash = password;
    } else {
      user = new User({
        name,
        email,
        passwordHash: password,
        isEmailVerified: false
      });
    }
    
    await user.save();

    // Generate and save OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_TTL_MINUTES) * 60 * 1000);
    
    await OTP.findOneAndDelete({ email }); // Remove any existing OTP
    await OTP.create({
      email,
      otp,
      expiresAt: otpExpiry
    });

    // Send OTP email
    await sendOTPEmail(email, name, otp);

    res.json({ 
      message: 'OTP sent to your email',
      status: 'OTP_SENT'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find and verify OTP
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Update user verification status
    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    res.json({
      message: 'Email verified successfully',
      user,
      accessToken,
      refreshToken,
      welcomeMessage: `Thanks for registering, ${user.name}! Check your dashboard.`
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isEmailVerified) {
      return res.status(400).json({ error: 'Invalid credentials or email not verified' });
    }

    // Check password if provided
    if (password) {
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_TTL_MINUTES) * 60 * 1000);
    
    await OTP.findOneAndDelete({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: otpExpiry
    });

    // Send OTP email
    await sendOTPEmail(email, user.name, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_TTL_MINUTES) * 60 * 1000);
    
    await OTP.findOneAndDelete({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: otpExpiry,
      type: 'password_reset'
    });

    // Send password reset OTP
    await sendOTPEmail(email, user.name, otp, 'Password Reset');

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP with password_reset type
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      used: false,
      type: 'password_reset',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Update user password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.passwordHash = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;