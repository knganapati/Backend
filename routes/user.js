const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/user/personal-details
// @desc    Update user personal details
// @access  Private
router.put('/personal-details', auth, [
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
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

    const { fullName, city, email, dateOfBirth, gender } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered with another account'
        });
      }
    }

    // Update user details
    user.fullName = fullName;
    user.city = city;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Personal details updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          city: user.city,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          age: user.age,
          profileCompletionPercentage: user.profileCompletionPercentage
        }
      }
    });

  } catch (error) {
    console.error('Update personal details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal details'
    });
  }
});

// @route   PUT /api/user/language-preference
// @desc    Update user language preference
// @access  Private
router.put('/language-preference', auth, [
  body('selectedLanguage')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Please select a valid language')
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

    const { selectedLanguage } = req.body;

    const user = await User.findById(req.user.id);
    user.selectedLanguage = selectedLanguage;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Language preference updated successfully',
      data: {
        selectedLanguage: user.selectedLanguage
      }
    });

  } catch (error) {
    console.error('Update language preference error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update language preference'
    });
  }
});

// @route   PUT /api/user/location-preferences
// @desc    Update user location preferences
// @access  Private
router.put('/location-preferences', auth, [
  body('preferredLocations')
    .isArray({ min: 1, max: 3 })
    .withMessage('Please provide 1-3 preferred locations'),
  body('preferredLocations.*.city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City name must be at least 2 characters long'),
  body('preferredLocations.*.priority')
    .isInt({ min: 1, max: 3 })
    .withMessage('Priority must be between 1 and 3'),
  body('willingToRelocate')
    .isBoolean()
    .withMessage('Willing to relocate must be true or false')
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

    const { preferredLocations, willingToRelocate } = req.body;

    // Validate unique priorities
    const priorities = preferredLocations.map(loc => loc.priority);
    if (new Set(priorities).size !== priorities.length) {
      return res.status(400).json({
        success: false,
        message: 'Each location must have a unique priority'
      });
    }

    const user = await User.findById(req.user.id);
    user.preferredLocations = preferredLocations;
    user.willingToRelocate = willingToRelocate;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Location preferences updated successfully',
      data: {
        preferredLocations: user.preferredLocations,
        willingToRelocate: user.willingToRelocate,
        profileCompletionPercentage: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Update location preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location preferences'
    });
  }
});

// @route   PUT /api/user/work-availability
// @desc    Update user work availability
// @access  Private
router.put('/work-availability', auth, [
  body('workAvailability')
    .isArray({ min: 1 })
    .withMessage('Please select at least one work availability option'),
  body('workAvailability.*')
    .isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    .withMessage('Invalid work availability option')
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

    const { workAvailability } = req.body;

    const user = await User.findById(req.user.id);
    user.workAvailability = workAvailability;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Work availability updated successfully',
      data: {
        workAvailability: user.workAvailability,
        profileCompletionPercentage: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Update work availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update work availability'
    });
  }
});

// @route   PUT /api/user/notification-settings
// @desc    Update user notification settings
// @access  Private
router.put('/notification-settings', auth, [
  body('allowNotifications')
    .optional()
    .isBoolean()
    .withMessage('Allow notifications must be true or false'),
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be true or false'),
  body('smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be true or false'),
  body('jobAlerts')
    .optional()
    .isBoolean()
    .withMessage('Job alerts must be true or false'),
  body('marketingNotifications')
    .optional()
    .isBoolean()
    .withMessage('Marketing notifications must be true or false')
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

    const {
      allowNotifications,
      emailNotifications,
      smsNotifications,
      jobAlerts,
      marketingNotifications
    } = req.body;

    const user = await User.findById(req.user.id);
    
    // Update notification settings
    if (allowNotifications !== undefined) user.notificationSettings.allowNotifications = allowNotifications;
    if (emailNotifications !== undefined) user.notificationSettings.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.notificationSettings.smsNotifications = smsNotifications;
    if (jobAlerts !== undefined) user.notificationSettings.jobAlerts = jobAlerts;
    if (marketingNotifications !== undefined) user.notificationSettings.marketingNotifications = marketingNotifications;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        notificationSettings: user.notificationSettings
      }
    });

  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
});

module.exports = router;