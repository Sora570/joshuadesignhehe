<?php
session_start();
require_once 'db_connect.php';

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
            echo json_encode(["status" => "error", "message" => "Role access denied"]);
            exit;
        }

        // Verify PIN (check if PIN hash exists)
        if (empty($user['pin_hash']) || !password_verify($pin, $user['pin_hash'])) {
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
        require_once __DIR__ . '/audit_log_function.php';
        log_login_attempt($user['userID'], $user['username'], true);

        echo json_encode([
            "status" => "success",
            "message" => "Login successful", 
            "role" => $user['role'] === 'admin' ? 'admin' : 'cashier',
            "employee_id" => $user['employee_id'],
            "userType" => $userType
        ]);

    } else {
        echo json_encode(["status" => "error", "message" => "Invalid Employee ID or PIN"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

$conn->close();
?>
