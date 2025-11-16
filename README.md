# Experts15 - JEE Mock Test Platform

A comprehensive mock test platform for JEE Mains & Advanced with realistic exam simulation, payment integration, and admin management.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   
   Update `.env` file with your credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/experts15
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your_sendgrid_api_key
   FRONTEND_URL=http://localhost:3000
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   OTP_TTL_MINUTES=10
   ```

4. **Start the application**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Features

### Student Features
- Email OTP Authentication - Secure signup with email verification
- Realistic Mock Tests - JEE Mains & Advanced pattern tests
- Timer-based Test Engine - Auto-submit with countdown timer
- Instant Results - Detailed scorecards and performance analysis
- Payment Integration - Razorpay for paid test enrollments
- Progress Tracking - Dashboard with attempt history and scores
- Responsive Design - Mobile-first UI with Tailwind CSS

### Admin Features
- Test Management - Create, edit, and publish tests
- PDF Upload & Parsing - Auto-extract questions from PDFs
- Answer Key Processing - Upload and map answer keys
- User Management - View and manage student accounts
- Analytics Dashboard - Revenue, enrollments, and user stats
- Content Review - Edit parsed questions before publishing

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- React Hook Form + Yup validation
- Axios for API calls
- React Toastify for notifications

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication with refresh tokens
- Bcrypt for password hashing
- Nodemailer for email services
- Multer for file uploads
- PDF-Parse for question extraction
- Razorpay for payment processing

## Project Structure

```
experts15/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js API
│   ├── config/             # Database config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   ├── uploads/           # File storage
│   ├── package.json
│   └── server.js          # Express server
├── .env                   # Environment variables
└── README.md
```

## Usage Flow

### Student Journey
1. Signup → Enter name/email → Receive OTP → Verify → Welcome
2. Browse Tests → View available tests on dashboard
3. Enroll → Free tests: instant enrollment | Paid tests: Razorpay payment
4. Take Test → Timer-based test with question navigation
5. Results → Instant scorecard with detailed analysis

### Admin Journey
1. Login → Access admin panel
2. Create Test → Set title, duration, marks, price
3. Upload Questions → PDF upload → Auto-parsing → Review/edit
4. Upload Answer Key → PDF upload → Auto-mapping
5. Publish → Make test available to students

## Admin Account Setup

Create an admin user manually in MongoDB:

```javascript
// Connect to your MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@experts15.com",
  passwordHash: "$2b$12$hashed_password_here", // Use bcrypt to hash
  role: "admin",
  isEmailVerified: true,
  createdAt: new Date()
})
```

Or use the signup flow and manually change the role to "admin" in the database.

## API Endpoints

### Authentication
- POST /api/auth/signup - User registration
- POST /api/auth/verify-otp - Email verification
- POST /api/auth/login - User login
- POST /api/auth/resend-otp - Resend OTP

### Tests
- GET /api/tests - List published tests
- GET /api/tests/:id - Get test details
- POST /api/tests/:id/start - Start test attempt
- POST /api/tests/:id/submit - Submit test

### Payments
- POST /api/tests/:id/enroll - Create payment order
- POST /api/payments/verify - Verify payment

### Admin
- GET /api/admin/analytics - Dashboard analytics
- POST /api/admin/tests - Create test
- POST /api/admin/tests/:id/upload-questions - Upload PDF
- POST /api/admin/tests/:id/publish - Publish test

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet.js security headers
- Input validation with Joi
- File upload restrictions

Built with ❤️ for JEE aspirants