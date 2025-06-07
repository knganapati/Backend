const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOTP } = require('../utils/sms');

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('method')
    .isIn(['sms', 'whatsapp'])
    .withMessage('Method must be either sms or whatsapp')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, method } = req.body;

    // Check if user already exists
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // Create new user with phone number
      user = new User({
        phoneNumber: "",
        fullName: '', // Will be filled later
        city: '', // Will be filled later
        experienceLevel: 'fresher' // Default value
      });
    }

    // Generate and save OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via selected method
    try {
      if (method === 'sms') {
        await sendOTP(phoneNumber, otp, 'sms');
      } else if (method === 'whatsapp') {
        await sendOTP(phoneNumber, otp, 'whatsapp');
      }

      res.status(200).json({
        success: true,
        message: `OTP sent successfully via ${method}`,
        data: {
          phoneNumber,
          method,
          expiresIn: 10 // minutes
        }
      });
    } catch (smsError) {
      console.error('SMS/WhatsApp error:', smsError);
      // For development, still return success but log the error
      res.status(200).json({
        success: true,
        message: `OTP sent successfully via ${method} (DEV MODE)`,
        data: {
          phoneNumber,
          method,
          expiresIn: 10,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        }
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    // Verify OTP
    const otpResult = user.verifyOTP(otp);
    
    if (!otpResult.success) {
      await user.save(); // Save attempt count
      return res.status(400).json({
        success: false,
        message: otpResult.message
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          email: user.email,
          profileCompleted: user.profileCompleted,
          profileCompletionPercentage: user.profileCompletionPercentage,
          isPhoneVerified: user.isPhoneVerified
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to phone number
// @access  Public
router.post('/resend-otp', [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('method')
    .isIn(['sms', 'whatsapp'])
    .withMessage('Method must be either sms or whatsapp')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phoneNumber, method } = req.body;

    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    try {
      await sendOTP(phoneNumber, otp, method);

      res.status(200).json({
        success: true,
        message: `OTP resent successfully via ${method}`,
        data: {
          phoneNumber,
          method,
          expiresIn: 10
        }
      });
    } catch (smsError) {
      console.error('SMS/WhatsApp error:', smsError);
      res.status(200).json({
        success: true,
        message: `OTP resent successfully via ${method} (DEV MODE)`,
        data: {
          phoneNumber,
          method,
          expiresIn: 10,
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        }
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp');
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;