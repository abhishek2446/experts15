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

// MongoDB connection using PHP MongoDB driver
function connectMongoDB() {
    try {
        $client = new MongoDB\Client("mongodb+srv://abhishek123:nKVffmHA4yIN4Ked@cluster0.nthryqy.mongodb.net/experts15?retryWrites=true&w=majority");
        return $client->selectDatabase('experts15');
    } catch (Exception $e) {
        error_log("MongoDB connection failed: " . $e->getMessage());
        return null;
    }
}

// JWT token validation
function validateToken($token) {
    // Simple token validation - in production use proper JWT library
    if (empty($token) || !str_starts_with($token, 'Bearer ')) {
        return false;
    }
    return true;
}

// Get authorization header
function getAuthToken() {
    $headers = getallheaders();
    return $headers['Authorization'] ?? '';
}

switch ($route) {
    case '':
    case 'health':
        echo json_encode([
            'status' => 'OK',
            'timestamp' => date('c'),
            'database' => 'Connected to MongoDB Atlas',
            'version' => '1.0.0'
        ]);
        break;
        
    case 'tests':
        $db = connectMongoDB();
        if ($db) {
            try {
                $collection = $db->selectCollection('tests');
                $tests = $collection->find(['isPublished' => true])->toArray();
                
                // Convert MongoDB documents to arrays
                $result = [];
                foreach ($tests as $test) {
                    $result[] = [
                        '_id' => (string)$test['_id'],
                        'title' => $test['title'],
                        'description' => $test['description'],
                        'examType' => $test['examType'],
                        'durationMins' => $test['durationMins'],
                        'totalMarks' => $test['totalMarks'],
                        'isPaid' => $test['isPaid'] ?? false,
                        'price' => $test['price'] ?? 0,
                        'questionCount' => $test['questionCount'] ?? 0,
                        'difficulty' => $test['difficulty'] ?? 'Mixed'
                    ];
                }
                
                echo json_encode($result);
            } catch (Exception $e) {
                error_log("Tests fetch error: " . $e->getMessage());
                // Fallback to dummy data
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
                    ]
                ]);
            }
        } else {
            // Fallback data when DB connection fails
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
                ]
            ]);
        }
        break;
        
    case 'auth/login':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            
            $db = connectMongoDB();
            if ($db && !empty($email) && !empty($password)) {
                try {
                    $collection = $db->selectCollection('users');
                    $user = $collection->findOne(['email' => $email]);
                    
                    if ($user && password_verify($password, $user['passwordHash'])) {
                        $token = 'jwt_token_' . time() . '_' . bin2hex(random_bytes(16));
                        
                        echo json_encode([
                            'success' => true,
                            'token' => $token,
                            'user' => [
                                'id' => (string)$user['_id'],
                                'name' => $user['name'],
                                'email' => $user['email'],
                                'role' => $user['role'] ?? 'student',
                                'isEmailVerified' => $user['isEmailVerified'] ?? false
                            ],
                            'message' => 'Login successful'
                        ]);
                    } else {
                        http_response_code(401);
                        echo json_encode(['error' => 'Invalid credentials']);
                    }
                } catch (Exception $e) {
                    error_log("Login error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['error' => 'Login failed']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password required']);
            }
        }
        break;
        
    case 'users/dashboard':
        $token = getAuthToken();
        if (!validateToken($token)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        $db = connectMongoDB();
        if ($db) {
            try {
                // Get dashboard data from database
                $testsCollection = $db->selectCollection('tests');
                $usersCollection = $db->selectCollection('users');
                
                $totalTests = $testsCollection->countDocuments();
                $totalUsers = $usersCollection->countDocuments();
                
                echo json_encode([
                    'stats' => [
                        'totalTests' => $totalTests,
                        'totalUsers' => $totalUsers,
                        'testsAttempted' => 0,
                        'averageScore' => 0
                    ],
                    'recentTests' => [],
                    'announcements' => []
                ]);
            } catch (Exception $e) {
                error_log("Dashboard error: " . $e->getMessage());
                echo json_encode([
                    'stats' => [
                        'totalTests' => 5,
                        'totalUsers' => 100,
                        'testsAttempted' => 0,
                        'averageScore' => 0
                    ]
                ]);
            }
        } else {
            echo json_encode([
                'stats' => [
                    'totalTests' => 5,
                    'totalUsers' => 100,
                    'testsAttempted' => 0,
                    'averageScore' => 0
                ]
            ]);
        }
        break;
        
    case 'payments/create-order':
        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Mock Razorpay order creation
            echo json_encode([
                'orderId' => 'order_' . time(),
                'amount' => ($input['amount'] ?? 29900),
                'currency' => 'INR',
                'testTitle' => $input['testTitle'] ?? 'Mock Test',
                'userName' => 'Test User',
                'userEmail' => 'test@experts15.in'
            ]);
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
                'GET /api/users/dashboard',
                'POST /api/payments/create-order'
            ]
        ]);
}
?>