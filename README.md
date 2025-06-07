# Job Portal Backend API

A comprehensive backend API for a job portal application built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication**: Phone number-based authentication with OTP verification
- **Profile Management**: Complete user profile with personal details, experience, skills, and preferences
- **Location Preferences**: Multiple preferred work locations with relocation preferences  
- **Work Availability**: Full-time, part-time, contract, and freelance options
- **Experience Tracking**: Fresher/experienced categorization with detailed work history
- **Skills & Certifications**: Comprehensive skills management with proficiency levels
- **Job Preferences**: Job categories, shift preferences, and availability settings
- **Notification Management**: Customizable notification preferences
- **SMS/WhatsApp Integration**: OTP delivery via SMS or WhatsApp using Twilio

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **SMS Service**: Twilio (SMS & WhatsApp)
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
/
├── models/
│   └── User.js              # User schema with all profile fields
├── routes/
│   ├── auth.js             # Authentication routes (OTP, login)
│   ├── user.js             # User profile management routes
│   └── profile.js          # Advanced profile features
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── utils/
│   └── sms.js              # SMS/WhatsApp utility functions
├── server.js               # Main server file
├── .env                    # Environment variables
└── README.md              # This file
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send-otp` | Send OTP to phone number |
| POST | `/verify-otp` | Verify OTP and authenticate user |
| POST | `/resend-otp` | Resend OTP to phone number |
| GET | `/me` | Get current user data |
| POST | `/logout` | Logout user |

### User Routes (`/api/user`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/personal-details` | Update personal information |
| PUT | `/language-preference` | Update language preference |
| PUT | `/location-preferences` | Update location preferences |
| PUT | `/work-availability` | Update work availability |
| PUT | `/notification-settings` | Update notification preferences |

### Profile Routes (`/api/profile`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/experience` | Update experience and salary details |
| PUT | `/skills` | Update skills and certifications |
| PUT | `/job-preferences` | Update job preferences |
| GET | `/complete-profile` | Get complete user profile |

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/jobportal

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup MongoDB**
   - Install MongoDB Compass
   - Create a database named `jobportal`
   - Update the `MONGODB_URI` in your `.env` file

3. **Configure Twilio (Optional for Development)**
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get your Account SID, Auth Token, and Phone Number
   - Update the Twilio variables in your `.env` file

4. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## MongoDB Database Structure

The application uses a single `User` collection with the following main sections:

- **Basic Information**: Phone number, email, verification status
- **Personal Details**: Full name, date of birth, gender, city
- **Language Preferences**: Selected language and known languages
- **Location Preferences**: Preferred work locations and relocation willingness
- **Work Availability**: Employment types (full-time, part-time, etc.)
- **Experience**: Experience level, work history, salary information
- **Skills & Certifications**: Technical skills and professional certifications
- **Job Preferences**: Job categories, shift preferences, joining availability
- **Notification Settings**: Customizable notification preferences

## Testing with Postman

### 1. Send OTP
```http
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "method": "sms"
}
```

### 2. Verify OTP
```http
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

### 3. Update Personal Details (Authenticated)
```http
PUT http://localhost:5000/api/user/personal-details
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fullName": "John Doe",
  "city": "New York",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

### 4. Get Complete Profile
```http
GET http://localhost:5000/api/profile/complete-profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## MongoDB Compass Usage

1. **Connect to Database**
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Select the `jobportal` database

2. **View Collections**
   - `users`: Contains all user profiles and data
   - Use filters to search specific users: `{"phoneNumber": "+1234567890"}`
   - Sort by creation date: `{"createdAt": -1}`

3. **Monitor User Registration Flow**
   - Watch new user documents being created
   - Monitor profile completion percentages
   - Track OTP verification status

## Profile Completion Tracking

The system automatically calculates profile completion percentage based on:
- Personal details (name, email, city, etc.)
- Location preferences  
- Work availability
- Experience level
- Skills
- Job preferences

Users with 80%+ completion are marked as having completed profiles.

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive validation using Express Validator  
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Various security headers
- **Phone Verification**: OTP-based phone number verification

## Development Notes

- In development mode, OTP codes are included in API responses for testing
- Profile completion is automatically calculated on user data updates
- All timestamps are handled automatically by MongoDB
- Phone numbers should include country codes (e.g., +1234567890)

## Deployment Considerations

- Set `NODE_ENV=production` in production
- Use environment variables for all sensitive configuration
- Consider using MongoDB Atlas for cloud database hosting
- Implement proper logging and monitoring
- Set up SSL/TLS certificates for HTTPS
- Configure proper CORS origins for your frontend domain

This backend is designed to be scalable and can handle multiple users globally with proper deployment infrastructure.