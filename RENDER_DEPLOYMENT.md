# Simple Render Deployment Guide

This guide will help you deploy your Student Management System to Render using a simple approach without Docker or complex configuration.

## Prerequisites

- GitHub account
- Render account (free tier available)
- Your code pushed to a GitHub repository

## Deployment Steps

### Step 1: Prepare Your Repository

Your repository already has the necessary files in the root directory:
- `package.json` - With proper scripts (start, postinstall, build)
- `server.js` - The unified server file that serves both backend and frontend
- `.env.example` - Template for environment variables

### Step 2: Deploy to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Click **New** and select **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `students-management-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or select a paid plan if needed)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-key-here
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

6. Click **Create Web Service**

### Step 3: Add Persistent Disk

1. After your service is created, go to the **Disks** tab
2. Click **Add Disk**
3. Configure:
   - **Name**: `uploads`
   - **Mount Path**: `/opt/render/project/src/backend/uploads`
   - **Size**: 1GB

### Step 4: Verify Deployment

1. Wait for the deployment to complete (this may take a few minutes)
2. Check the logs to make sure there are no errors
3. Visit the health check endpoint: `https://your-service-name.onrender.com/health`
4. If the health check is successful, visit the main URL to access your application

## Troubleshooting Common Issues

### Build Fails
- **Issue**: `npm install` fails
- **Solution**: Check if all dependencies are correctly listed in package.json

### Application Crashes
- **Issue**: Server crashes after starting
- **Solution**: Check logs for errors, ensure environment variables are set correctly

### Database Issues
- **Issue**: Cannot write to database
- **Solution**: Verify disk is mounted correctly at `/opt/render/project/src/backend/uploads`

### Frontend Not Loading
- **Issue**: API works but frontend shows blank page
- **Solution**: Check if frontend was built correctly during deployment

## Quick Fixes

### If Build Fails:
```
# Try manually triggering a build with specific Node version
NODE_VERSION=16 npm install && npm run build
```

### If Database Isn't Working:
```
# Check if uploads directory exists and is writable
mkdir -p /opt/render/project/src/backend/uploads
chmod 777 /opt/render/project/src/backend/uploads
```

### If Frontend Isn't Loading:
```
# Verify the frontend build exists
ls -la /opt/render/project/src/student-management-frontend/dist
```

## Updating Your Application

To update your application:
1. Push changes to your GitHub repository
2. Render will automatically deploy the changes

## Important Notes

- The free tier of Render will spin down after periods of inactivity
- The first request after inactivity may take up to 50 seconds to respond
- SQLite database is stored on the disk, so your data will persist
- For production use, consider upgrading to a paid plan for better performance

## Email Configuration

To enable email notifications:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password as `EMAIL_PASS` environment variable

---

Your application will be available at: `https://your-service-name.onrender.com`

## Testing Your Deployment

After deployment, test these endpoints:

1. Health Check: `https://your-service-name.onrender.com/health`
2. API Health: `https://your-service-name.onrender.com/api/health`
3. Frontend: `https://your-service-name.onrender.com`

If all endpoints work, your deployment is successful!