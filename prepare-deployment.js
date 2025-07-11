#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * Checks and prepares the Student Management System for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Student Management System - Deployment Preparation\n');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}\n📋 ${msg}${colors.reset}`)
};

// Check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

// Check if directory exists
const dirExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
};

// Read package.json
const readPackageJson = (dir) => {
  try {
    const packagePath = path.join(dir, 'package.json');
    if (fileExists(packagePath)) {
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Check if command exists
const commandExists = (command) => {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Main deployment check function
async function checkDeploymentReadiness() {
  let issues = [];
  let warnings = [];

  log.header('System Requirements Check');

  // Check Node.js
  if (commandExists('node')) {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      log.success(`Node.js installed: ${nodeVersion}`);
      
      const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
      if (majorVersion < 16) {
        warnings.push('Node.js version should be 16 or higher for optimal performance');
      }
    } catch (error) {
      issues.push('Could not determine Node.js version');
    }
  } else {
    issues.push('Node.js is not installed or not in PATH');
  }

  // Check npm
  if (commandExists('npm')) {
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      log.success(`npm installed: ${npmVersion}`);
    } catch (error) {
      issues.push('Could not determine npm version');
    }
  } else {
    issues.push('npm is not installed or not in PATH');
  }

  log.header('Project Structure Check');

  // Check backend directory
  if (dirExists('./backend')) {
    log.success('Backend directory exists');
    
    // Check backend package.json
    const backendPackage = readPackageJson('./backend');
    if (backendPackage) {
      log.success('Backend package.json found');
      
      // Check required dependencies
      const requiredDeps = [
        'express', 'sqlite3', 'cors', 'jsonwebtoken', 
        'bcryptjs', 'multer', 'nodemailer', 'dotenv'
      ];
      
      const missingDeps = requiredDeps.filter(dep => 
        !backendPackage.dependencies || !backendPackage.dependencies[dep]
      );
      
      if (missingDeps.length === 0) {
        log.success('All required backend dependencies present');
      } else {
        issues.push(`Missing backend dependencies: ${missingDeps.join(', ')}`);
      }
      
      // Check scripts
      if (backendPackage.scripts && backendPackage.scripts.start) {
        log.success('Backend start script configured');
      } else {
        issues.push('Backend start script not configured');
      }
    } else {
      issues.push('Backend package.json not found');
    }
    
    // Check main server file
    if (fileExists('./backend/server.js')) {
      log.success('Main server file (server.js) exists');
    } else {
      issues.push('Main server file (server.js) not found');
    }
    
    // Check Dockerfile
    if (fileExists('./backend/Dockerfile')) {
      log.success('Backend Dockerfile exists');
    } else {
      warnings.push('Backend Dockerfile not found (required for some deployment platforms)');
    }
    
    // Check uploads directory
    if (dirExists('./backend/uploads')) {
      log.success('Uploads directory exists');
    } else {
      warnings.push('Uploads directory not found (will be created automatically)');
    }
    
  } else {
    issues.push('Backend directory not found');
  }

  // Check frontend directory
  if (dirExists('./student-management-frontend')) {
    log.success('Frontend directory exists');
    
    // Check frontend package.json
    const frontendPackage = readPackageJson('./student-management-frontend');
    if (frontendPackage) {
      log.success('Frontend package.json found');
      
      // Check required dependencies
      const requiredDeps = ['react', 'react-dom', 'axios'];
      const requiredDevDeps = ['vite'];
      
      const missingDeps = requiredDeps.filter(dep => 
        !frontendPackage.dependencies || !frontendPackage.dependencies[dep]
      );
      
      const missingDevDeps = requiredDevDeps.filter(dep => 
        !frontendPackage.devDependencies || !frontendPackage.devDependencies[dep]
      );
      
      if (missingDeps.length === 0) {
        log.success('All required frontend dependencies present');
      } else {
        issues.push(`Missing frontend dependencies: ${missingDeps.join(', ')}`);
      }
      
      // Check build script
      if (frontendPackage.scripts && frontendPackage.scripts.build) {
        log.success('Frontend build script configured');
      } else {
        issues.push('Frontend build script not configured');
      }
    } else {
      issues.push('Frontend package.json not found');
    }
    
    // Check Vite config
    if (fileExists('./student-management-frontend/vite.config.js')) {
      log.success('Vite configuration exists');
    } else {
      warnings.push('Vite configuration not found');
    }
    
  } else {
    issues.push('Frontend directory not found');
  }

  log.header('Configuration Files Check');

  // Check environment example
  if (fileExists('./backend/.env.example')) {
    log.success('Environment example file exists');
  } else {
    warnings.push('Environment example file not found');
  }

  // Check documentation
  if (fileExists('./README.md')) {
    log.success('README.md exists');
  } else {
    warnings.push('README.md not found');
  }

  if (fileExists('./DEPLOYMENT.md')) {
    log.success('DEPLOYMENT.md exists');
  } else {
    warnings.push('DEPLOYMENT.md not found');
  }

  log.header('Dependency Installation Check');

  // Check if backend node_modules exists
  if (dirExists('./backend/node_modules')) {
    log.success('Backend dependencies installed');
  } else {
    warnings.push('Backend dependencies not installed (run: cd backend && npm install)');
  }

  // Check if frontend node_modules exists
  if (dirExists('./student-management-frontend/node_modules')) {
    log.success('Frontend dependencies installed');
  } else {
    warnings.push('Frontend dependencies not installed (run: cd student-management-frontend && npm install)');
  }

  log.header('Build Test');

  // Test frontend build
  try {
    if (dirExists('./student-management-frontend/node_modules')) {
      log.info('Testing frontend build...');
      execSync('cd student-management-frontend && npm run build', { stdio: 'ignore' });
      log.success('Frontend build test successful');
      
      // Check if dist directory was created
      if (dirExists('./student-management-frontend/dist')) {
        log.success('Frontend dist directory created');
      } else {
        warnings.push('Frontend dist directory not found after build');
      }
    }
  } catch (error) {
    warnings.push('Frontend build test failed');
  }

  log.header('Security Check');

  // Check for sensitive files
  const sensitiveFiles = ['.env', 'config.json', 'secrets.json'];
  sensitiveFiles.forEach(file => {
    if (fileExists(`./${file}`) || fileExists(`./backend/${file}`)) {
      warnings.push(`Sensitive file found: ${file} (ensure it's in .gitignore)`);
    }
  });

  // Check .gitignore
  if (fileExists('./.gitignore')) {
    log.success('.gitignore exists');
    
    const gitignoreContent = fs.readFileSync('./.gitignore', 'utf8');
    const requiredIgnores = ['.env', 'node_modules', 'dist', '*.db'];
    const missingIgnores = requiredIgnores.filter(ignore => 
      !gitignoreContent.includes(ignore)
    );
    
    if (missingIgnores.length === 0) {
      log.success('All sensitive patterns in .gitignore');
    } else {
      warnings.push(`Missing .gitignore patterns: ${missingIgnores.join(', ')}`);
    }
  } else {
    warnings.push('.gitignore not found');
  }

  // Final report
  log.header('Deployment Readiness Report');

  if (issues.length === 0) {
    log.success('🎉 No critical issues found!');
  } else {
    log.error(`${issues.length} critical issue(s) found:`);
    issues.forEach(issue => console.log(`   • ${issue}`));
  }

  if (warnings.length === 0) {
    log.success('No warnings');
  } else {
    log.warning(`${warnings.length} warning(s):`);
    warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  console.log('\n' + '='.repeat(60));
  
  if (issues.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ READY FOR DEPLOYMENT!${colors.reset}`);
    console.log('\nNext steps:');
    console.log('1. Push code to GitHub repository');
    console.log('2. Set up hosting platform (Render, Railway, etc.)');
    console.log('3. Configure environment variables');
    console.log('4. Deploy backend and frontend');
    console.log('5. Test deployed application');
  } else {
    console.log(`${colors.red}${colors.bold}❌ NOT READY FOR DEPLOYMENT${colors.reset}`);
    console.log('\nPlease fix the critical issues above before deploying.');
  }
  
  console.log('\n📚 For detailed deployment instructions, see DEPLOYMENT.md');
  console.log('🔧 For troubleshooting, see DEPLOYMENT_INDEX.md');
}

// Run the check
checkDeploymentReadiness().catch(error => {
  log.error(`Deployment check failed: ${error.message}`);
  process.exit(1);
});