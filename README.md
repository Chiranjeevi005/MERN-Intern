# MERN Role-Based Dashboard

A complete MERN (MongoDB, Express, React, Node.js) application with authentication, role-based access control, and CRUD operations.

## Features

- User authentication with email verification
- Role-based access control (Admin and Student roles)
- Admin dashboard with student management (CRUD operations)
- Student dashboard with profile management
- Password reset functionality
- Pagination for student listings
- Comprehensive test suite

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Project Structure

```
mern-role-dashboard/
├─ backend/
│  ├─ server.js
│  ├─ config/db.js
│  ├─ models/User.js
│  ├─ models/Student.js
│  ├─ routes/auth.js
│  ├─ routes/students.js
│  ├─ middleware/auth.js
│  ├─ middleware/roles.js
│  ├─ utils/email.js
│  └─ seedAdmin.js
├─ frontend/
│  ├─ src/
│  │  ├─ api/axiosInstance.js
│  │  ├─ components/
│  │  │  ├─ ProtectedRoute.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Signup.jsx
│  │  │  ├─ AdminDashboard.jsx
│  │  │  ├─ StudentDashboard.jsx
│  │  │  ├─ ForgotPassword.jsx
│  │  │  └─ ResetPassword.jsx
│  │  ├─ App.jsx
│  │  └─ main.jsx
└─ tests/
   ├─ backend/
   │  ├─ auth.test.js
   │  └─ students.test.js
   └─ frontend/
      ├─ login.test.jsx
      ├─ signup.test.jsx
      ├─ adminDashboard.test.jsx
      └─ studentDashboard.test.jsx
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mern-role-dashboard
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=http://localhost:3000
   ```

4. Update the `MONGO_URI` and `JWT_SECRET` with your own values.

5. Start the backend server:
   ```
   npm run dev
   ```

### Database Setup

1. Make sure MongoDB is running on your system.

2. The application will automatically create the database and collections when you start the server.

3. To create a default admin user, run:
   ```
   npm run seed-admin
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

## Default Admin User

After running the seed script, you can log in with the following credentials:
- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/change-password` - Change password (authenticated users)

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/me` - Get student profile (Student only)
- `PUT /api/students/me` - Update student profile (Student only)
- `POST /api/students` - Add student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

## Running Tests

### Backend Tests

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run tests:
   ```
   npm test
   ```

### Frontend Tests

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Run tests:
   ```
   npm test
   ```

## Environment Variables

### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for redirects

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens with expiration
- Email verification required before login
- Role-based access control
- Password reset tokens expire after 1 hour
- Server-side role enforcement

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Nodemailer for email (mocked in development)

### Frontend
- React.js
- React Router
- Axios for HTTP requests
- CSS3 for styling

### Testing
- Jest for backend testing
- Supertest for API testing
- React Testing Library for frontend testing
- Vitest for frontend unit tests

## Deployment

### Backend Deployment
Your backend is successfully deployed at: https://mern-intern-1.onrender.com

The API endpoints are available at:
- Authentication: https://mern-intern-1.onrender.com/api/auth/
- Student Management: https://mern-intern-1.onrender.com/api/students/

### Frontend Deployment
For detailed deployment instructions for the frontend, please refer to [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md).

#### Quick Start for Vercel Deployment:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

4. Set the environment variable in the Vercel dashboard:
   - Name: `VITE_API_URL`
   - Value: `https://mern-intern-1.onrender.com/api` (Replace with your actual backend URL)

5. Redeploy your project

### Environment Variables for Production

Make sure to set the following environment variables in your deployments:

**Backend (Render):**
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key for JWT tokens
- `CLIENT_URL` - Your frontend URL (e.g., https://your-frontend.vercel.app)

**Frontend (Vercel/Netlify/Render):**
- `VITE_API_URL` - Your backend URL (e.g., https://your-backend.onrender.com/api or https://your-backend.vercel.app/api)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.