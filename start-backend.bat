@echo off
setlocal
echo === Install backend dependencies ===
npm install --prefix backend

echo === Start backend server ===
set PORT=10000
set NODE_ENV=production
npm --prefix backend run start