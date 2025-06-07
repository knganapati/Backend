const twilio = require('twilio');

// Initialize Twilio client
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log('Twilio not configured properly:', error.message);
}

// Send OTP via SMS or WhatsApp
const sendOTP = async (phoneNumber, otp, method = 'sms') => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    let message;
    if (method === 'whatsapp') {
      message = await twilioClient.messages.create({
        body: `Your Job Portal OTP is: ${otp}. This OTP will expire in 10 minutes. Do not share this OTP with anyone.`,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${phoneNumber}`
      });
    } else {
      message = await twilioClient.messages.create({
        body: `Your Job Portal OTP is: ${otp}. This OTP will expire in 10 minutes. Do not share this OTP with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
    }

    console.log(`OTP sent via ${method}:`, message.sid);
    return {
      success: true,
      messageId: message.sid
    };

  } catch (error) {
    console.error(`Failed to send OTP via ${method}:`, error);
    throw error;
  }
};

// Send notification SMS
const sendNotificationSMS = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('Notification SMS sent:', sms.sid);
    return {
      success: true,
      messageId: sms.sid
    };

  } catch (error) {
    console.error('Failed to send notification SMS:', error);
    throw error;
  }
};

module.exports = {
  sendOTP,
  sendNotificationSMS
};