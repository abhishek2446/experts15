# 🚨 URGENT: API Routing Fix for Hostinger

## Problem
API calls returning "Page Not Found" HTML instead of JSON responses.

## Root Cause
- Node.js not running or not accessible
- .htaccess routing not working
- PHP proxy not functioning

## Immediate Fix

### 1. Check Node.js Status
```bash
# SSH into Hostinger
cd public_html/api
ps aux | grep node
# If no process, start it:
npm start
```

### 2. Alternative: Pure PHP API
Create `public_html/api/index.php`:
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://experts15.in');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Mock API responses for immediate fix
switch ($route) {
    case 'health':
        echo json_encode(['status' => 'OK', 'timestamp' => date('c')]);
        break;
        
    case 'tests':
        echo json_encode([
            [
                '_id' => 'test-1',
                'title' => 'JEE Mains Mock Test 1',
                'description' => 'Comprehensive test covering Physics, Chemistry, and Mathematics',
                'examType' => 'mains',
                'durationMins' => 180,
                'totalMarks' => 300,
                'isPaid' => false,
                'price' => 0
            ],
            [
                '_id' => 'test-2',
                'title' => 'JEE Advanced Practice Test',
                'description' => 'Advanced level questions for JEE Advanced preparation',
                'examType' => 'advanced',
                'durationMins' => 180,
                'totalMarks' => 300,
                'isPaid' => true,
                'price' => 299
            ]
        ]);
        break;
        
    case 'auth/login':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            // Mock login response
            echo json_encode([
                'success' => true,
                'token' => 'mock_jwt_token_' . time(),
                'user' => [
                    'id' => '1',
                    'name' => 'Test User',
                    'email' => $input['email'] ?? 'test@example.com',
                    'role' => 'student'
                ]
            ]);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'route' => $route]);
}
?>
```

### 3. Update .htaccess
```apache
RewriteEngine On

# API routes - Direct to PHP
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ /api/index.php?route=$1 [QSA,L]

# React routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

## Quick Test
1. Upload the PHP API file
2. Visit: `https://experts15.in/api/health`
3. Should return: `{"status":"OK"}`
4. Test login from frontend

This will fix the API immediately!