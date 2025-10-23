<?php
session_start();
require_once 'db_connect.php';
require_once 'audit_log.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $employeeId = trim($_POST["employeeId"] ?? "");
    $pin = trim($_POST["pin"] ?? "");
    $userType = trim($_POST["userType"] ?? "");

    // Validate input
    if (empty($employeeId) || empty($pin) || empty($userType)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit;
    }

    // PIN validation
    if (!preg_match("/^[0-9]{4,6}$/", $pin)) {
        echo json_encode(["status" => "error", "message" => "Invalid PIN format"]);
        exit;
    }

    // Look up user based on employee_id or username and validate role
    $stmt = $conn->prepare("SELECT userID, username, role, pin_hash, employee_id FROM users WHERE (employee_id = ? OR username = ?) AND is_active = 1");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Database error"]);
        exit;
    }

    $stmt->bind_param("ss", $employeeId, $employeeId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Check user role matches requested type
        if (($userType === 'employee' && $user['role'] !== 'cashier') || 
            ($userType === 'admin' && $user['role'] !== 'admin')) {
            logAuthError($conn, $user['userID'], $employeeId, "Role mismatch");
            echo json_encode(["status" => "error", "message" => "Role access denied"]);
            exit;
        }

                // Verify PIN (check if PIN hash exists)
                if (empty($user['pin_hash']) || !password_verify($pin, $user['pin_hash'])) {
                    logAuthError($conn, $user['userID'], $employeeId, "Invalid PIN");
                    logLogin($conn, $user['userID'], $user['username'], false);
                    echo json_encode(["status" => "error", "message" => "Invalid PIN or Employee ID"]);
                    exit;
                }

        // Set session
        $_SESSION['userID'] = $user['userID'];
        $_SESSION['user_id'] = $user['userID'];  // For compatibility
        $_SESSION['role'] = $user['role'];
        $_SESSION['userType'] = $userType;
        $_SESSION['employee_id'] = $user['employee_id'];
        $_SESSION['username'] = $user['username'];
        
                // Log successful login
                logAuthSuccess($conn, $user['userID'], $employeeId, "PIN login", $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']);
                
                // Log audit activity
                logLogin($conn, $user['userID'], $user['username'], true);

                // Set last activity
                updateLastActivity($conn, $user['userID']);

        echo json_encode([
            "status" => "success",
            "message" => "Login successful", 
            "role" => $user['role'] === 'admin' ? 'admin' : 'cashier',
            "employee_id" => $user['employee_id'],
            "userType" => $userType
        ]);

    } else {
        logAuthError($conn, 0, $employeeId, "Unknown Employee ID");
        echo json_encode(["status" => "error", "message" => "Employee ID not found"]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

// Helper functions
function logAuthSuccess($conn, $userID, $username, $action, $ip, $userAgent) {
    $sql = "INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $details = "Login success: " . $action;
    $stmt->bind_param("issss", $userID, $action, $details, $ip, $userAgent);
    $stmt->execute();
    $stmt->close();
}

function logAuthError($conn, $userID, $username, $reason) {
    $sql = "INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $action = "failed_login";
    $details = "Login failed: " . $reason . " for " . $username;
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $stmt->bind_param("issss", $userID, $action, $details, $ip, $userAgent);
    $stmt->execute();
    $stmt->close();
}

function updateLastActivity($conn, $userID) {
    $sql = "UPDATE users SET last_login = NOW() WHERE userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>
