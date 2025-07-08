# 🚀 Deployment Guide - Render

This guide will help you deploy your Student Management System to Render.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Your code pushed to a GitHub repository

## 🔧 Deployment Steps

### Step 1: Prepare Environment Variables

Create these environment variables in Render:

#### Backend Service Environment Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=https://your-frontend-name.onrender.com
```

#### Frontend Service Environment Variables:
```
VITE_API_URL=https://your-backend-name.onrender.com
```

### Step 2: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `student-management-backend`
   - **Environment**: `Docker`
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Start Command**: (leave empty)

5. Add Environment Variables (see above)

6. Add Disk Storage:
   - **Name**: `uploads`
   - **Mount Path**: `/app/uploads`
   - **Size**: 1GB

### Step 3: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `student-management-frontend`
   - **Build Command**: `cd student-management-frontend && npm install && npm run build`
   - **Publish Directory**: `student-management-frontend/dist`

4. Add Environment Variables (see above)

### Step 4: Update URLs

After both services are deployed:

1. Update backend `FRONTEND_URL` with your actual frontend URL
2. Update frontend `VITE_API_URL` with your actual backend URL
3. Redeploy both services

## 🔐 Email Configuration

To enable email notifications:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password as `EMAIL_PASS`

## 🗄️ Database

The app uses SQLite which stores data in a file. For production:

- Data persists using Render's disk storage
- For high-traffic apps, consider upgrading to PostgreSQL
- Backup the SQLite file regularly

## 🌐 Custom Domain (Optional)

1. In Render Dashboard → Your Service → Settings
2. Add your custom domain
3. Configure DNS records as shown

## 📊 Monitoring

Render provides:
- Automatic deployments on git push
- Build and runtime logs
- Health checks
- SSL certificates (automatic)

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**: Check build logs for missing dependencies
2. **API Errors**: Verify environment variables are set correctly
3. **CORS Issues**: Ensure `FRONTEND_URL` matches your frontend domain
4. **File Upload Issues**: Verify disk storage is mounted correctly

### Debug Commands:

```bash
# Check backend health
curl https://your-backend.onrender.com/api/health

# Check environment variables
echo $VITE_API_URL
```

## 💰 Cost Estimation

**Free Tier Limits:**
- 750 hours/month compute time
- Services sleep after 15 minutes of inactivity
- 1GB disk storage

**Paid Plans:**
- $7/month per service for always-on
- Additional storage: $1/GB/month

## 🚀 Production Optimizations

1. **Enable Redis** for session storage
2. **Use PostgreSQL** for better performance
3. **Add CDN** for static assets
4. **Enable monitoring** and alerts
5. **Set up automated backups**

## 📱 Mobile App Deployment

Your API is now ready for mobile app integration:
- Use the deployed backend URL in your mobile app
- All endpoints are documented in README.md
- Authentication works with JWT tokens

---

**Your app will be live at:**
- Frontend: `https://your-frontend-name.onrender.com`
- Backend API: `https://your-backend-name.onrender.com`

🎉 **Congratulations! Your Student Management System is now live!**
