<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://experts15.in');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$route = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');

// Forward to Node.js server running on port 3000
$nodeUrl = 'http://127.0.0.1:3000/' . $route;

// Log the request for debugging
error_log('API Proxy: ' . $method . ' ' . $nodeUrl);

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