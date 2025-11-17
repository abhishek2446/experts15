# ✅ UPLOAD CHECKLIST - Fix API 404 Error

## 🚨 CRITICAL: Upload in This Exact Order

### Step 1: Create Directory Structure
```
public_html/
├── (delete all existing files first)
├── index.html (from frontend/dist)
├── assets/ (from frontend/dist/assets)
├── favicon.svg
├── .htaccess (updated version)
└── api/
    └── index.php (from api-mock.php)
```

### Step 2: Upload Files
1. **Delete** all files in `public_html/` (except keep any existing `api/` folder)
2. **Upload** `frontend/dist/*` to `public_html/`
3. **Upload** updated `.htaccess` to `public_html/`
4. **Create** `api/` folder in `public_html/`
5. **Upload** `api-mock.php` as `index.php` to `public_html/api/`

### Step 3: Test Immediately
- Visit: `https://experts15.in/api/health`
- Should return: `{"status":"OK"}`
- Visit: `https://experts15.in`
- Should load website without errors

### Step 4: Verify API Endpoints
- `https://experts15.in/api/` - API info
- `https://experts15.in/api/health` - Health check
- `https://experts15.in/api/tests` - Test data

## 🎯 Expected Results
- ✅ No more "Page Not Found" errors
- ✅ API returns JSON responses
- ✅ Website loads and functions
- ✅ Login/signup works with mock data

## 📋 Files to Upload
- [ ] `frontend/dist/*` → `public_html/`
- [ ] `.htaccess` → `public_html/`
- [ ] `api-mock.php` → `public_html/api/index.php`

**Upload these files NOW to fix the API error!**