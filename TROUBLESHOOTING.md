# Troubleshooting Guide - Student Database Management System

## Blank Page Issue

If you're seeing a blank page in your browser, follow these steps:

### 1. Check if both servers are running

**Backend Server (Port 5000):**
```bash
cd backend
npm start
```

**Frontend Server (Port 5173):**
```bash
cd student-management-frontend
npm run dev
```

Or use the provided batch file:
```bash
start-servers.bat
```

### 2. Check browser console for errors

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for any red error messages
4. Common errors and solutions:

#### "Network Error" or "Failed to fetch"
- **Cause**: Backend server is not running
- **Solution**: Start the backend server on port 5000

#### "Module not found" errors
- **Cause**: Missing dependencies
- **Solution**: Run `npm install` in both frontend and backend directories

#### "Cannot resolve module" errors
- **Cause**: Missing or corrupted node_modules
- **Solution**: Delete node_modules and package-lock.json, then run `npm install`

### 3. Verify URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

### 4. Check network requests

1. In Developer Tools, go to Network tab
2. Refresh the page
3. Look for failed requests (red status codes)
4. Check if API calls to localhost:5000 are failing

### 5. Clear browser cache

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache completely

### 6. Check for JavaScript errors

Common issues:
- Syntax errors in components
- Missing imports
- Incorrect file paths
- Version conflicts between dependencies

### 7. Test with demo data

The application should work even without the backend running, showing demo data. If it doesn't, there might be a JavaScript error preventing the app from loading.

### 8. Restart development servers

Sometimes a simple restart fixes the issue:
1. Stop both servers (Ctrl+C)
2. Start backend first: `cd backend && npm start`
3. Start frontend: `cd student-management-frontend && npm run dev`

### 9. Check port conflicts

Make sure no other applications are using ports 5000 or 5173:
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### 10. Verify file structure

Ensure all required files exist:
- `backend/server.js`
- `student-management-frontend/src/main.jsx`
- `student-management-frontend/src/App.jsx`
- `student-management-frontend/index.html`

## Still having issues?

1. Check the browser's Developer Tools Console for specific error messages
2. Verify that both package.json files have all required dependencies
3. Try running the application in a different browser
4. Check if your antivirus or firewall is blocking the local servers