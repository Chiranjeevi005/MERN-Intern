const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  
  // Check if the dist directory exists
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      try {
        const filePath = path.join(distPath, 'index.html');
        if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
        } else {
          // Fallback API response if index.html doesn't exist
          res.status(200).json({ 
            message: 'Backend API is running successfully!', 
            api_docs: 'Use /api endpoints for backend functionality',
            frontend_build: 'Frontend build files not found. Please build the frontend.'
          });
        }
      } catch (error) {
        // Fallback API response if there's an error serving the file
        res.status(200).json({ 
          message: 'Backend API is running successfully!', 
          api_docs: 'Use /api endpoints for backend functionality',
          frontend_build: 'Frontend build files not found. Please build the frontend.'
        });
      }
    });
  } else {
    // If frontend dist directory doesn't exist, provide API-only response
    app.get('*', (req, res) => {
      res.status(200).json({ 
        message: 'Backend API is running successfully!', 
        api_docs: 'Use /api endpoints for backend functionality',
        frontend_build: 'Frontend build files not found. Please build and deploy the frontend separately.'
      });
    });
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Export app for testing
module.exports = app;

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`Frontend dist path: ${path.join(__dirname, '../frontend/dist')}`);
  });
}