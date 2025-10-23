<?php
header('Content-Type: text/plain');
session_start();

require_once __DIR__ . '/db_connect.php';

try {
    // Check admin access
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Access denied. Admin permissions required.");
    }
    
    // Basic Information
    $firstName = trim($_POST['firstName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    
    // Login Information
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';
    $pin = $_POST['pin'] ?? '';
    $employeeId = trim($_POST['employeeId'] ?? '');
    
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($address) || 
        empty($username) || empty($password) || empty($role) || empty($pin) || empty($employeeId)) {
        throw new Exception("All fields are required");
    }
    
    // Validate role
    if (!in_array($role, ['admin', 'cashier'])) {
        throw new Exception("Invalid role specified");
    }
    
    // Check if username already exists
    $checkStmt = $conn->prepare("SELECT userID FROM users WHERE username = ?");
    $checkStmt->bind_param('s', $username);
    $checkStmt->execute();
    
    if ($checkStmt->get_result()->num_rows > 0) {
        throw new Exception("Username already exists");
    }
    $checkStmt->close();
    
    // Hash password and PIN
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $hashedPin = password_hash($pin, PASSWORD_DEFAULT);
    
    // Check if employee ID already exists
    $checkEmployeeId = $conn->prepare("SELECT userID FROM users WHERE employee_id = ?");
    $checkEmployeeId->bind_param('s', $employeeId);
    $checkEmployeeId->execute();
    
    if ($checkEmployeeId->get_result()->num_rows > 0) {
        throw new Exception("Employee ID already exists");
    }
    $checkEmployeeId->close();
    
    // Insert new employee with all information
    $stmt = $conn->prepare("INSERT INTO users (username, passwordHash, role, employee_id, pin_hash, first_name, last_name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param('ssssssssss', $username, $hashedPassword, $role, $employeeId, $hashedPin, $firstName, $lastName, $email, $phone, $address);
    
    if ($stmt->execute()) {
        $newUserID = $conn->insert_id;
        
        // Log the action
        $auditStmt = $conn->prepare("INSERT INTO audit_logs (userID, action, details, created_at) VALUES (?, ?, ?, NOW())");
        $auditAction = "employee_added";
        $auditDetails = "Admin added new employee: " . $username;
        $auditStmt->bind_param('iss', $_SESSION['userID'], $auditAction, $auditDetails);
        $auditStmt->execute();
        
        echo "success";
    } else {
        throw new Exception("Failed to create employee account");
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo $e->getMessage();
}
?>
