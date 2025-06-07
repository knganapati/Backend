const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
  employerName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  timePeriod: {
    from: { type: Date, required: true },
    to: { type: Date }
  },
  currentlyWorking: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  }
});

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  issuingOrganization: {
    type: String,
    trim: true
  },
  issueDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  credentialId: {
    type: String,
    trim: true
  }
});

const userSchema = new mongoose.Schema({
  // Basic Information
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Personal Details
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  
  // Language Preferences
  selectedLanguage: {
    type: String,
    required: true,
    default: 'english'
  },
  languagesKnown: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['basic', 'intermediate', 'fluent', 'native'],
      default: 'basic'
    }
  }],
  
  // Location Preferences
  preferredLocations: [{
    city: { type: String, required: true },
    priority: { type: Number, required: true } // 1, 2, 3
  }],
  willingToRelocate: {
    type: Boolean,
    default: false
  },
  
  // Work Availability
  workAvailability: [{
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  }],
  
  // Experience
  experienceLevel: {
    type: String,
    enum: ['fresher', 'experienced'],
    required: true
  },
  totalExperienceYears: {
    type: Number,
    default: 0
  },
  experiences: [experienceSchema],
  
  // Salary
  lastDrawnSalary: {
    amount: { type: Number },
    period: { 
      type: String, 
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  expectedSalary: {
    amount: { type: Number },
    period: { 
      type: String, 
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  
  // Skills and Certifications
  skills: [{
    name: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  }],
  certifications: [certificationSchema],
  
  // Job Preferences
  jobCategories: [{
    type: String,
    enum: ['security', 'housekeeping', 'hospitality', 'retail', 'food-service', 'logistics', 'construction', 'healthcare', 'education', 'other']
  }],
  preferredShifts: [{
    type: String,
    enum: ['day', 'night', 'rotational']
  }],
  availableForJoining: {
    type: String,
    enum: ['immediate', 'within-week', 'within-month'],
    default: 'within-week'
  },
  accommodationRequired: {
    type: Boolean,
    default: false
  },
  
  // Notification Preferences
  notificationSettings: {
    allowNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    jobAlerts: { type: Boolean, default: true },
    marketingNotifications: { type: Boolean, default: false }
  },
  
  // Profile Status
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profileCompletionPercentage: {
    type: Number,
    default: 0
  },
  
  // OTP and Verification
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ city: 1 });
userSchema.index({ jobCategories: 1 });
userSchema.index({ preferredLocations: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Method to calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function() {
  let completed = 0;
  let total = 10; // Total sections to complete
  
  if (this.fullName) completed++;
  if (this.email) completed++;
  if (this.dateOfBirth) completed++;
  if (this.gender) completed++;
  if (this.city) completed++;
  if (this.preferredLocations && this.preferredLocations.length > 0) completed++;
  if (this.workAvailability && this.workAvailability.length > 0) completed++;
  if (this.experienceLevel) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.jobCategories && this.jobCategories.length > 0) completed++;
  
  const percentage = Math.round((completed / total) * 100);
  this.profileCompletionPercentage = percentage;
  this.profileCompleted = percentage >= 80;
  
  return percentage;
};

// Pre-save middleware to calculate profile completion
userSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.calculateProfileCompletion();
  }
  next();
});

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(inputOTP) {
  if (!this.otp || !this.otp.code) {
    return { success: false, message: 'No OTP found' };
  }
  
  if (this.otp.expiresAt < new Date()) {
    return { success: false, message: 'OTP has expired' };
  }
  
  if (this.otp.attempts >= 3) {
    return { success: false, message: 'Maximum OTP attempts exceeded' };
  }
  
  if (this.otp.code !== inputOTP) {
    this.otp.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid
  this.isPhoneVerified = true;
  this.otp = undefined;
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('User', userSchema);