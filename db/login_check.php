<?php
require_once __DIR__ . '/db_connect.php';
session_start();

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit;
}

$stmt = $conn->prepare("SELECT userID, username, passwordHash, role FROM users WHERE username=? LIMIT 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if ($user && password_verify($password, $user['passwordHash'])) {
    // ✅ set session for index.php to detect
    $_SESSION['userID'] = $user['userID'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    
    // Log successful login
    try {
        $auditStmt = $conn->prepare("INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, 'login', ?, ?, ?, NOW())");
        $loginDetails = "User logged in from role: " . $user['role'];
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        $auditStmt->bind_param('isss', $user['userID'], $loginDetails, $ipAddress, $userAgent);
        $auditStmt->execute();
        $auditStmt->close();
    } catch (Exception $e) {
        // Don't fail login if audit logging fails
        error_log("Audit logging error: " . $e->getMessage());
    }

    echo json_encode([
        "status" => "success",
        "user"   => $user['username'],
        "role"   => $user['role']
    ]);
} else {
    // Log failed login attempt
    try {
        $auditStmt = $conn->prepare("INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, 'failed_login', ?, ?, ?, NOW())");
        $failedDetails = "Failed login attempt for username: " . $username;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $nullUserId = 0; // No associated user for failed attempts
        
        $auditStmt->bind_param('isss', $nullUserId, $failedDetails, $ipAddress, $userAgent);
        $auditStmt->execute();
        $auditStmt->close();
    } catch (Exception $e) {
        error_log("Audit logging error: " . $e->getMessage());
    }
    
    echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
}