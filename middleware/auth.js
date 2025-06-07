const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // Extract token from "Bearer TOKEN"
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-otp');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = auth;