const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/profile/experience
// @desc    Update user experience details
// @access  Private
router.put('/experience', auth, [
  body('experienceLevel')
    .isIn(['fresher', 'experienced'])
    .withMessage('Experience level must be fresher or experienced'),
  body('totalExperienceYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Total experience years must be between 0 and 50'),
  body('experiences')
    .optional()
    .isArray()
    .withMessage('Experiences must be an array'),
  body('lastDrawnSalary.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Last drawn salary must be a positive number'),
  body('lastDrawnSalary.period')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Salary period must be monthly or yearly'),
  body('expectedSalary.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Expected salary must be a positive number'),
  body('expectedSalary.period')
    .optional()
    .isIn(['monthly', 'yearly'])
    .withMessage('Salary period must be monthly or yearly')
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
      experienceLevel,
      totalExperienceYears,
      experiences,
      lastDrawnSalary,
      expectedSalary
    } = req.body;

    const user = await User.findById(req.user.id);
    
    user.experienceLevel = experienceLevel;
    if (totalExperienceYears !== undefined) user.totalExperienceYears = totalExperienceYears;
    if (experiences) user.experiences = experiences;
    if (lastDrawnSalary) user.lastDrawnSalary = lastDrawnSalary;
    if (expectedSalary) user.expectedSalary = expectedSalary;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Experience details updated successfully',
      data: {
        experienceLevel: user.experienceLevel,
        totalExperienceYears: user.totalExperienceYears,
        experiences: user.experiences,
        lastDrawnSalary: user.lastDrawnSalary,
        expectedSalary: user.expectedSalary,
        profileCompletionPercentage: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update experience details'
    });
  }
});

// @route   PUT /api/profile/skills
// @desc    Update user skills and certifications
// @access  Private
router.put('/skills', auth, [
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*.name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Skill name is required'),
  body('skills.*.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, advanced, or expert'),
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('languagesKnown')
    .optional()
    .isArray()
    .withMessage('Languages known must be an array')
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

    const { skills, certifications, languagesKnown } = req.body;

    const user = await User.findById(req.user.id);
    
    if (skills) user.skills = skills;
    if (certifications) user.certifications = certifications;
    if (languagesKnown) user.languagesKnown = languagesKnown;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skills and certifications updated successfully',
      data: {
        skills: user.skills,
        certifications: user.certifications,
        languagesKnown: user.languagesKnown,
        profileCompletionPercentage: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skills and certifications'
    });
  }
});

// @route   PUT /api/profile/job-preferences
// @desc    Update user job preferences
// @access  Private
router.put('/job-preferences', auth, [
  body('jobCategories')
    .optional()
    .isArray()
    .withMessage('Job categories must be an array'),
  body('jobCategories.*')
    .optional()
    .isIn(['security', 'housekeeping', 'hospitality', 'retail', 'food-service', 'logistics', 'construction', 'healthcare', 'education', 'other'])
    .withMessage('Invalid job category'),
  body('preferredShifts')
    .optional()
    .isArray()
    .withMessage('Preferred shifts must be an array'),
  body('preferredShifts.*')
    .optional()
    .isIn(['day', 'night', 'rotational'])
    .withMessage('Invalid shift preference'),
  body('availableForJoining')
    .optional()
    .isIn(['immediate', 'within-week', 'within-month'])
    .withMessage('Available for joining must be immediate, within-week, or within-month'),
  body('accommodationRequired')
    .optional()
    .isBoolean()
    .withMessage('Accommodation required must be true or false')
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
      jobCategories,
      preferredShifts,
      availableForJoining,
      accommodationRequired
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (jobCategories) user.jobCategories = jobCategories;
    if (preferredShifts) user.preferredShifts = preferredShifts;
    if (availableForJoining) user.availableForJoining = availableForJoining;
    if (accommodationRequired !== undefined) user.accommodationRequired = accommodationRequired;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job preferences updated successfully',
      data: {
        jobCategories: user.jobCategories,
        preferredShifts: user.preferredShifts,
        availableForJoining: user.availableForJoining,
        accommodationRequired: user.accommodationRequired,
        profileCompletionPercentage: user.profileCompletionPercentage
      }
    });

  } catch (error) {
    console.error('Update job preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job preferences'
    });
  }
});

// @route   GET /api/profile/complete-profile
// @desc    Get user's complete profile
// @access  Private
router.get('/complete-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp');
    
    res.status(200).json({
      success: true,
      data: {
        user,
        profileStats: {
          completionPercentage: user.profileCompletionPercentage,
          isCompleted: user.profileCompleted,
          sectionsCompleted: {
            personalDetails: !!(user.fullName && user.city && user.email),
            locationPreferences: !!(user.preferredLocations && user.preferredLocations.length > 0),
            workAvailability: !!(user.workAvailability && user.workAvailability.length > 0),
            experience: !!user.experienceLevel,
            skills: !!(user.skills && user.skills.length > 0),
            jobPreferences: !!(user.jobCategories && user.jobCategories.length > 0)
          }
        }
      }
    });

  } catch (error) {
    console.error('Get complete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get complete profile'
    });
  }
});

module.exports = router;