# Render deployment (no Docker, no YAML)

## Goal
Deploy the backend as a single Node service; serve the built frontend as static hosting (or from the backend if you prefer later).

## Repo layout
- backend: Node + Express + sqlite3
- student-management-frontend: Vite React app

## Backend service settings on Render
- Environment: Node
- Build Command:
```
cd backend && npm install
```
- Start Command:
```
cd backend && npm start
```
- Environment Variables (add in Render > Environment)
  - PORT: 10000
  - NODE_ENV: production
  - JWT_SECRET: <generate-strong-secret>
  - EMAIL_USER: <your-gmail-address-or-smtp-user>
  - EMAIL_PASS: <your-app-password-or-smtp-pass>
  - FRONTEND_URL: https://<your-frontend-host>

Note: Our server listens on PORT env (defaults 10000). Render will expose the port automatically.

## Frontend (static site) on Render
- Type: Static Site
- Build Command:
```
cd student-management-frontend && npm install && npm run build
```
- Publish Directory:
```
student-management-frontend/dist
```
- Environment Variables:
  - VITE_API_URL: https://<your-backend-service>.onrender.com

## Common fix for ENOENT package.json at root
Render runs build at repo root by default. Since package.json is not at root, set the build command to change directory:
- Backend service build: `cd backend && npm install`
- Backend service start: `cd backend && npm start`
- Static site build: `cd student-management-frontend && npm install && npm run build`
- Static site publish dir: `student-management-frontend/dist`

## Optional: Single service (serve frontend via backend)
If you prefer one service only, after building locally copy `student-management-frontend/dist` into `backend/public` and add in server.js:
```
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```
Then on Render use the Backend settings above.