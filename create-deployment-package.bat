@echo off
echo Creating deployment package...

REM Create deployment folder
mkdir deployment
cd deployment

REM Copy backend files
xcopy ..\backend\* . /E /I /Y
REM Exclude node_modules and uploads
rmdir /S /Q node_modules 2>nul
rmdir /S /Q uploads 2>nul

REM Copy production env file
copy .env.production .env

REM Create start script
echo node server.js > start.js

echo Deployment package created in 'deployment' folder
echo Upload this folder to Hostinger
pause