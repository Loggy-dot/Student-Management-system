@echo off
setlocal
echo === Install frontend dependencies ===
npm install --prefix student-management-frontend

echo === Build frontend ===
npm --prefix student-management-frontend run build

echo === Build complete. Output in student-management-frontend\dist ===