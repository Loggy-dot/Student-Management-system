const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Create Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Function to check if backend dependencies are installed
function checkBackendDependencies() {
  return fs.existsSync(path.join(__dirname, 'backend', 'node_modules'));
}

// Function to check if frontend is built
function checkFrontendBuild() {
  return fs.existsSync(path.join(__dirname, 'student-management-frontend', 'dist'));
}

// Install backend dependencies if needed
if (!checkBackendDependencies()) {
  console.log('Installing backend dependencies...');
  exec('cd backend && npm install', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing backend dependencies: ${error}`);
      return;
    }
    console.log('Backend dependencies installed successfully');
  });
}

// Build frontend if in production and not already built
if (isProduction && !checkFrontendBuild()) {
  console.log('Building frontend...');
  exec('cd student-management-frontend && npm install && npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error building frontend: ${error}`);
      return;
    }
    console.log('Frontend built successfully');
  });
}

// Serve static frontend files in production
if (isProduction) {
  const frontendPath = path.join(__dirname, 'student-management-frontend', 'dist');
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    console.log(`Serving frontend from ${frontendPath}`);
  } else {
    console.warn('Frontend build not found. API-only mode.');
  }
}

// Use the backend API routes
// First try to use the server-module.js if it exists
let backendRouter;
try {
  const serverModulePath = path.join(__dirname, 'backend', 'server-module.js');
  const unifiedServerPath = path.join(__dirname, 'backend', 'unified-server.js');
  
  console.log('Checking backend files:');
  console.log('- server-module.js exists:', fs.existsSync(serverModulePath));
  console.log('- unified-server.js exists:', fs.existsSync(unifiedServerPath));
  
  // Force use of unified-server for now since it's working locally
  if (fs.existsSync(unifiedServerPath)) {
    backendRouter = require('./backend/unified-server');
    console.log('✅ Using unified backend server (unified-server.js)');
  } else if (fs.existsSync(serverModulePath)) {
    backendRouter = require('./backend/server-module');
    console.log('✅ Using modular backend API (server-module.js)');
  } else {
    throw new Error('No backend module found');
  }
  
  app.use('/api', backendRouter);
  console.log('✅ Backend router mounted at /api');
} catch (error) {
  console.error('❌ Error loading backend:', error);
  app.use('/api', (req, res) => {
    res.status(500).json({ error: 'Backend server could not be loaded', details: error.message });
  });
}

// Serve frontend for all other routes in production
if (isProduction) {
  app.use((req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    
    const indexPath = path.join(__dirname, 'student-management-frontend', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not built. Please run npm run build first.');
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Students Management System is running',
    mode: isProduction ? 'production' : 'development',
    backend: backendRouter ? 'loaded' : 'not loaded',
    frontend: checkFrontendBuild() ? 'built' : 'not built'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Mode: ${isProduction ? 'Production' : 'Development'}`);
  
  if (isProduction) {
    console.log('Serving both API and frontend');
  } else {
    console.log('API-only mode. Frontend should be started separately for development.');
  }
});