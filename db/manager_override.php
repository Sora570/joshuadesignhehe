<?php
session_start();
require_once 'db_connect.php';

header("Content-Type: application/json");

// Check if user has admin credentials in session
if (!isset($_SESSION['userType']) || $_SESSION['userType'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Admin authorization required"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $overridePIN = trim($_POST["overridePIN"] ?? "");
    $action = trim($_POST["action"] ?? "");
    $amount = floatval($_POST["amount"] ?? 0);
    $targetUserId = intval($_POST["targetUserId"] ?? 0); // For audit

    if (empty($overridePIN) || empty($action)) {
        echo json_encode(["status" => "error", "message" => "Missing PIN or action"]);
        exit;
    }

    // Get current user 
    $currentUserId = $_SESSION['userID'];
    
    // Check for admin override PIN (defined by admin in system)
    $stmt = $conn->prepare("SELECT value FROM system_settings WHERE setting_name = 'admin_override_pin'");
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $masterOverrideHash = $row['value'];
        
        // Verify the override PIN
        if (password_verify($overridePIN, $masterOverrideHash)) {
            
            // Log the override action
            $sql = "INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
            $detail = "Admin override request: " . $action . (", Amount: " . $amount);
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            
            $stmt = $conn->prepare($sql);
            if ($targetUserId > 0) $stmt->bind_param("isssss", $targetUserId, $action, $detail, $ip, $userAgent);
            else $stmt->bind_param("isssss", $currentUserId, $action, $detail, $ip, $userAgent);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Override authorized", 
                    "action" => $action
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Override failed to log"]);
            }
            
        } else {
            echo json_encode([
                "status" => "error", 
                "message" => "Invalid override PIN. Access denied."
            ]);
            // Log failed override attempt  
            logFailedOverride($conn, $currentUserId, $action);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Override PIN not set in system"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid HTTP method"]);
}

function logFailedOverride($conn, $userID, $action) {
    $sql = "INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $failedAction = "override_failed";
    $details = "Overridden operation: " . $action . " was attempted but denied";
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $stmt->bind_param("isssss", $userID, $failedAction, $details, $ip, $userAgent);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>
