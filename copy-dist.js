const fs = require('fs-extra');
const path = require('path');

async function copyDist() {
  try {
    // Remove existing public directory
    if (fs.existsSync('public')) {
      await fs.remove('public');
    }
    
    // Copy frontend/dist to public
    await fs.copy('frontend/dist', 'public');
    
    console.log('Successfully copied frontend/dist to public');
  } catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
  }
}

copyDist();