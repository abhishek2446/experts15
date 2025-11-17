# 🚨 EMERGENCY DEPLOYMENT - Fix API Immediately

## Problem
API returning "Page Not Found" HTML instead of JSON.

## IMMEDIATE SOLUTION

### Step 1: Upload Mock API (NOW)
1. **Hostinger File Manager** → `public_html/api/`
2. **Upload** `api-mock.php` as `index.php`
3. **Replace** existing `index.php`

### Step 2: Test API
- Visit: `https://experts15.in/api/health`
- Should return: `{"status":"OK"}`

### Step 3: Test Website
- Visit: `https://experts15.in`
- Login should work
- Tests should display

## What This Fixes
- ✅ API returns proper JSON
- ✅ Login functionality works
- ✅ Tests display correctly
- ✅ No more HTML error pages

## Mock Endpoints Included
- `GET /api/health` - Health check
- `GET /api/tests` - Test list
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User signup

## Deploy Steps
```bash
# 1. Upload api-mock.php as index.php to public_html/api/
# 2. Test: https://experts15.in/api/health
# 3. Test: https://experts15.in (login should work)
```

## Result
Your website will work immediately with mock data while you fix the Node.js backend.

**UPLOAD THE MOCK API FILE NOW TO FIX THE ERROR!**