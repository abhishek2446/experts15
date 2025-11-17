# 🚨 DIRECT API FIX - No More 404 Errors

## Problem
API still returning "Page Not Found" HTML. The .htaccess routing isn't working.

## IMMEDIATE SOLUTION

### Step 1: Create API Directory Structure
```
public_html/
├── index.html
├── assets/
├── .htaccess
└── api/
    └── index.php (our mock API)
```

### Step 2: Upload Files in Correct Order
1. **Create** `api` folder in `public_html/`
2. **Upload** `api-mock.php` as `index.php` inside `api/` folder
3. **Upload** updated `.htaccess` to `public_html/`

### Step 3: Test Direct API Access
- Visit: `https://experts15.in/api/` (should show API info)
- Visit: `https://experts15.in/api/health` (should show health status)

### Step 4: Updated .htaccess (Critical)
```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API routes - Must be first
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ /api/index.php?route=$1 [QSA,L]

# Handle React routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
```

## Alternative: Direct PHP Files
If .htaccess still doesn't work, create individual PHP files:

### public_html/api/health.php
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://experts15.in');
echo json_encode(['status' => 'OK', 'timestamp' => date('c')]);
?>
```

### public_html/api/tests.php
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://experts15.in');
echo json_encode([
    ['_id' => 'test-1', 'title' => 'JEE Mains Mock Test 1', 'isPaid' => false],
    ['_id' => 'test-2', 'title' => 'JEE Advanced Practice', 'isPaid' => true, 'price' => 299]
]);
?>
```

Then update frontend API calls to use `.php` extension.

## Test Commands
```bash
# Test API directly
curl https://experts15.in/api/health
curl https://experts15.in/api/tests
```

This will definitely fix the 404 error!