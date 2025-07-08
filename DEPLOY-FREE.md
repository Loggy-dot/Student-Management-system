# 🆓 FREE Deployment Guide for Render

Deploy your Student Management System for FREE on Render!

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend Service (FREE)

1. **Go to [Render.com](https://render.com)**
2. **Sign up/Login with GitHub**
3. **Click "New +" → "Web Service"**
4. **Select your repository**: `student-management-system`

#### Backend Configuration:
- **Name**: `student-management-backend`
- **Environment**: `Docker`
- **Root Directory**: `backend`
- **Build Command**: (leave empty)
- **Start Command**: (leave empty)

#### Environment Variables (click "Advanced"):
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here-make-it-long-and-random
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=https://student-management-frontend.onrender.com
```

5. **Click "Create Web Service"**
6. **Wait 5-10 minutes for deployment**

### Step 2: Deploy Frontend Service (FREE)

1. **Click "New +" → "Static Site"**
2. **Select the same repository**

#### Frontend Configuration:
- **Name**: `student-management-frontend`
- **Build Command**: `cd student-management-frontend && npm install && npm run build`
- **Publish Directory**: `student-management-frontend/dist`

#### Environment Variables:
```
VITE_API_URL=https://student-management-backend.onrender.com
```

3. **Click "Create Static Site"**
4. **Wait 5-10 minutes for deployment**

### Step 3: Update URLs

After both services are deployed:

1. **Copy your actual URLs** (they'll be shown in Render dashboard)
2. **Update Backend Environment Variables**:
   - Go to Backend Service → Settings → Environment
   - Update `FRONTEND_URL` with your actual frontend URL
3. **Update Frontend Environment Variables**:
   - Go to Frontend Service → Settings → Environment  
   - Update `VITE_API_URL` with your actual backend URL
4. **Redeploy both services** (click "Manual Deploy")

## 🎉 Your App is Live!

Your URLs will be:
- **Frontend**: `https://student-management-frontend.onrender.com`
- **Backend API**: `https://student-management-backend.onrender.com`

## 🔐 Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Teacher**: username: `teacher`, password: `teacher123`

## 💡 Free Tier Notes

- ✅ **750 hours/month** compute time
- ✅ **Services sleep after 15 minutes** of inactivity
- ✅ **Wake up automatically** when visited (takes 30 seconds)
- ✅ **Perfect for demos and portfolios**

## 📧 Email Setup (Optional)

To enable email notifications:

1. **Enable 2FA on Gmail**
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use this password as `EMAIL_PASS`**

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**: Check logs in Render dashboard
2. **API Not Working**: Verify environment variables
3. **CORS Errors**: Make sure `FRONTEND_URL` is correct
4. **Service Won't Start**: Check Dockerfile and port settings

### Debug Steps:

1. **Check Service Logs** in Render dashboard
2. **Verify Environment Variables** are set correctly
3. **Test API Health**: Visit `https://your-backend.onrender.com/api/health`

## 🎊 Success!

Your Student Management System is now live on the internet for FREE!

Share your frontend URL with friends and family to show off your amazing work! 🚀
