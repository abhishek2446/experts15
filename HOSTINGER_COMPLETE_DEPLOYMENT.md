# 🚀 Complete Hostinger Deployment Guide - experts15.in

## 📋 Pre-Deployment Checklist

### 1. Build Project
```bash
cd frontend
npm run build

cd ../backend
npm install --production
```

### 2. Prepare Files
- ✅ Frontend build: `frontend/dist/`
- ✅ Backend files: `backend/`
- ✅ Configuration: `.htaccess`, `api-proxy.php`
- ✅ Environment: `.env.production`

## 🌐 Step 1: Domain Setup

### Login to Hostinger
1. Go to hostinger.com
2. Login to hPanel
3. Select your hosting plan

### Domain Configuration
1. **Add Domain**: experts15.in
2. **DNS Settings**: Point to Hostinger nameservers
3. **SSL Certificate**: Enable (automatic)

## 📁 Step 2: File Upload Structure

```
public_html/
├── index.html (from frontend/dist)
├── assets/ (from frontend/dist/assets)
├── favicon.svg
├── .htaccess
└── api/
    ├── index.php (PHP proxy)
    ├── server.js (Node.js backend)
    ├── package.json
    ├── .env
    └── [all backend folders]
```

## 🔧 Step 3: Upload Files

### Frontend Upload
1. **File Manager** → `public_html/`
2. **Delete** default files
3. **Upload** all from `frontend/dist/`:
   - `index.html`
   - `assets/` folder
   - `favicon.svg`

### Backend Upload
1. **Create** `api/` folder in `public_html/`
2. **Upload** all from `backend/`:
   - `server.js`
   - `package.json`
   - All folders (config, controllers, etc.)

### Configuration Upload
1. **Upload** `.htaccess` to `public_html/`
2. **Upload** `api-proxy.php` as `index.php` to `public_html/api/`
3. **Upload** `.env.production` as `.env` to `public_html/api/`

## ⚙️ Step 4: Configuration Files

### .htaccess (public_html/.htaccess)
```apache
RewriteEngine On

# API routes
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ /api/index.php?route=$1 [QSA,L]

# React routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
```

### PHP Proxy (public_html/api/index.php)
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://experts15.in');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');

$nodeUrl = 'http://localhost:3000/' . $route;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $nodeUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($input)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
```

### Environment File (public_html/api/.env)
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/experts15
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=experts15.in@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=https://experts15.in
RAZORPAY_KEY_ID=rzp_live_your-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
OTP_TTL_MINUTES=10
```

## 🚀 Step 5: Start Services

### Install Dependencies
```bash
cd public_html/api
npm install --production
```

### Start Node.js
```bash
npm start
```

### Enable Node.js (if needed)
1. **hPanel** → **Advanced** → **Node.js**
2. **Create Application**
3. **Set Entry Point**: `server.js`
4. **Set Directory**: `public_html/api`

## ✅ Step 6: Testing

### Test Website
1. Visit: `https://experts15.in`
2. Check: Homepage loads
3. Test: Navigation works

### Test API
1. Visit: `https://experts15.in/api/health`
2. Should return: `{"status": "OK"}`

### Test Features
1. **Signup/Login**: User registration
2. **Tests**: Mock test display
3. **Payments**: Razorpay integration

## 🔧 Step 7: Final Configuration

### SSL Certificate
- **Auto-enabled** by Hostinger
- **Force HTTPS**: Enable in hPanel

### Email Setup
1. **Gmail**: Enable 2FA
2. **App Password**: Generate for EMAIL_PASS
3. **Test**: OTP functionality

### Payment Gateway
1. **Razorpay**: Switch to live keys
2. **Webhook**: Set to `https://experts15.in/api/payments/webhook`

## 🎯 Go Live!

Your Experts15 platform is now live at:
- **Website**: https://experts15.in
- **Admin Panel**: https://experts15.in/admin
- **API**: https://experts15.in/api

## 📞 Support
- **Hostinger**: 24/7 live chat
- **Domain**: Check DNS propagation (24-48 hours)
- **SSL**: Automatic activation

## ✅ Deployment Complete!
Your JEE Mock Test platform is now live and ready for students!