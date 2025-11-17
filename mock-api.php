<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$mockTests = [
    [
        '_id' => 'test-1',
        'title' => 'JEE Mains Mock Test 1',
        'description' => 'Comprehensive test covering Physics, Chemistry, and Mathematics',
        'examType' => 'main',
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
    ],
    [
        '_id' => 'test-3',
        'title' => 'Free Demo Test',
        'description' => 'Try our platform with this free sample test',
        'examType' => 'main',
        'durationMins' => 60,
        'totalMarks' => 100,
        'isPaid' => false,
        'price' => 0
    ]
];

echo json_encode($mockTests);
?>