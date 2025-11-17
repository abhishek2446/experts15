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

// Log the request
error_log("API Request: $method /$route");

switch ($route) {
    case '':
    case 'health':
        echo json_encode([
            'status' => 'OK', 
            'timestamp' => date('c'),
            'message' => 'Experts15 API is running'
        ]);
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
                'price' => 0,
                'questionCount' => 75,
                'difficulty' => 'Mixed'
            ],
            [
                '_id' => 'test-2',
                'title' => 'JEE Advanced Practice Test',
                'description' => 'Advanced level questions for JEE Advanced preparation',
                'examType' => 'advanced',
                'durationMins' => 180,
                'totalMarks' => 300,
                'isPaid' => true,
                'price' => 299,
                'questionCount' => 54,
                'difficulty' => 'Hard'
            ],
            [
                '_id' => 'test-3',
                'title' => 'Free Demo Test',
                'description' => 'Try our platform with this free sample test',
                'examType' => 'mains',
                'durationMins' => 60,
                'totalMarks' => 100,
                'isPaid' => false,
                'price' => 0,
                'questionCount' => 25,
                'difficulty' => 'Easy'
            ]
        ]);
        break;
        
    case 'auth/login':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Mock successful login
            echo json_encode([
                'success' => true,
                'token' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_' . time(),
                'user' => [
                    'id' => 'user_' . time(),
                    'name' => 'Test User',
                    'email' => $input['email'] ?? 'test@experts15.in',
                    'role' => 'student',
                    'isEmailVerified' => true
                ],
                'message' => 'Login successful'
            ]);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case 'auth/signup':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            echo json_encode([
                'success' => true,
                'message' => 'OTP sent to your email',
                'userId' => 'user_' . time()
            ]);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found', 
            'route' => $route,
            'method' => $method,
            'available_endpoints' => [
                'GET /api/health',
                'GET /api/tests',
                'POST /api/auth/login',
                'POST /api/auth/signup'
            ]
        ]);
}
?>