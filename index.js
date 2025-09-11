#!/usr/bin/env node

// Root entry point for Render deployment
// This file is required for Render to properly start the application

// Start the backend server
const app = require('./backend/server.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});