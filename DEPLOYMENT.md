# Deployment Guide for MERN Role-Based Dashboard

This guide provides detailed instructions for deploying the MERN Role-Based Dashboard application to various hosting platforms.

## Table of Contents
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [Vercel Deployment](#vercel-deployment)
4. [Render Deployment](#render-deployment)
5. [Other Hosting Platforms](#other-hosting-platforms)
6. [Post-deployment Verification](#post-deployment-verification)

## Pre-deployment Checklist

Before deploying, ensure the following:

- [ ] All tests are passing (both frontend and backend)
- [ ] Frontend builds successfully (`npm run build` in frontend directory)
- [ ] Backend starts without errors (`npm start` in backend directory)
- [ ] Environment variables are configured for production
- [ ] MongoDB database is accessible from the hosting platform
- [ ] JWT_SECRET is a strong, unique secret key
- [ ] MONGO_URI points to your production database

## Environment Variables Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret_key
CLIENT_URL=https://your-frontend-domain.com
```

**Important Notes:**
- Never commit your `.env` file to version control
- For production deployment, configure these variables directly in your hosting platform's dashboard
- Use a strong, unique JWT_SECRET (at least 32 characters)
- Ensure your MONGO_URI includes authentication credentials if required

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variable:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Vercel Deployment

### Backend Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Navigate to the backend directory:
   ```bash
   cd backend
   ```

4. Deploy the backend:
   ```bash
   vercel --prod
   ```

5. Configure environment variables in the Vercel dashboard:
   - Go to your project settings in Vercel
   - Navigate to the "Environment Variables" section
   - Add all required environment variables (MONGO_URI, JWT_SECRET, etc.)

### Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Deploy the frontend:
   ```bash
   vercel --prod
   ```

3. Configure the environment variable in the Vercel dashboard:
   - Add VITE_API_URL pointing to your backend deployment URL

## Render Deployment

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
4. Add environment variables in the Render dashboard:
   - NODE_ENV: production
   - PORT: 5000 (or let Render auto-assign)
   - MONGO_URI: your MongoDB connection string
   - JWT_SECRET: your JWT secret
   - CLIENT_URL: your frontend URL

### Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set the following build settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Add environment variables if needed:
   - VITE_API_URL: your backend URL

## Other Hosting Platforms

### General Deployment Steps

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy the Backend:**
   - Ensure Node.js is available on your server
   - Install backend dependencies:
     ```bash
     cd backend
     npm install
     ```
   - Set environment variables
   - Start the server:
     ```bash
     npm start
     ```

3. **Serve Frontend Files:**
   - The backend is configured to serve frontend files from the `dist` directory in production
   - Ensure the frontend build files are in the correct location

### Docker Deployment (Optional)

If you prefer containerized deployment, you can create Dockerfiles for both frontend and backend services.

## Post-deployment Verification

After deployment, verify that your application works correctly:

1. **Access the Application:**
   - Visit your frontend URL
   - Ensure the homepage loads correctly

2. **Test Authentication:**
   - Try to sign up for a new account
   - Verify email functionality (if configured)
   - Log in with the new account
   - Test password reset functionality

3. **Test Role-based Access:**
   - Log in as an admin user
   - Access the admin dashboard
   - Perform CRUD operations on student data
   - Log in as a student user
   - Access the student dashboard
   - Verify limited access for student role

4. **API Endpoints:**
   - Test all major API endpoints
   - Verify proper error handling
   - Check that CORS is configured correctly

5. **Database Operations:**
   - Ensure data is being saved to MongoDB
   - Verify data retrieval works correctly
   - Test pagination functionality

## Troubleshooting Common Issues

### "Cannot GET /" Error
- Ensure the backend is configured to serve frontend static files
- Check that the frontend build files are in the correct location

### CORS Errors
- Verify that the CLIENT_URL environment variable is set correctly
- Check that the CORS middleware is properly configured in the backend

### Database Connection Issues
- Verify that MONGO_URI is correct and accessible from your hosting platform
- Check that IP whitelisting is configured correctly in MongoDB Atlas (if using)

### Authentication Issues
- Ensure JWT_SECRET is set and consistent between deployments
- Verify that the token expiration settings are appropriate

### Environment Variables Not Loading
- Check that environment variables are configured in your hosting platform's dashboard
- Ensure there are no typos in variable names

## Additional Security Considerations

1. **HTTPS**: Ensure your application is served over HTTPS
2. **Rate Limiting**: Consider implementing rate limiting for API endpoints
3. **Input Validation**: All user inputs should be properly validated
4. **Error Handling**: Ensure sensitive information is not exposed in error messages
5. **Dependency Updates**: Regularly update dependencies to patch security vulnerabilities

## Monitoring and Maintenance

1. **Logging**: Implement proper logging for debugging and monitoring
2. **Backups**: Regularly backup your MongoDB database
3. **Performance Monitoring**: Monitor application performance and response times
4. **Error Tracking**: Implement error tracking to catch unhandled exceptions

By following this deployment guide, your MERN Role-Based Dashboard application should be successfully deployed and running in a production environment.