<?php
// Comprehensive Audit Logging Function
function log_audit_trail($userID, $action, $details = '', $ip_address = null, $user_agent = null) {
    global $conn;
    
    try {
        // Get IP address if not provided
        if ($ip_address === null) {
            $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }
        
        // Get user agent if not provided
        if ($user_agent === null) {
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        }
        
        // Prepare the insert statement
        $sql = "INSERT INTO audit_logs (userID, action, details, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        
        if ($stmt === false) {
            error_log("Audit log prepare failed: " . $conn->error);
            return false;
        }
        
        $stmt->bind_param("issss", $userID, $action, $details, $ip_address, $user_agent);
        $result = $stmt->execute();
        
        if (!$result) {
            error_log("Audit log insert failed: " . $stmt->error);
        }
        
        $stmt->close();
        return $result;
        
    } catch (Exception $e) {
        error_log("Audit log error: " . $e->getMessage());
        return false;
    }
}

// Helper function to log product changes
function log_product_change($userID, $action, $productID, $productName, $details = '') {
    $fullDetails = "Product: $productName (ID: $productID)";
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}

// Helper function to log transaction changes
function log_transaction_change($userID, $action, $transactionID, $amount = null, $details = '') {
    $fullDetails = "Transaction ID: $transactionID";
    if ($amount !== null) {
        $fullDetails .= " - Amount: ₱$amount";
    }
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}

// Helper function to log user changes
function log_user_change($userID, $action, $targetUserID, $targetUsername, $details = '') {
    $fullDetails = "Target User: $targetUsername (ID: $targetUserID)";
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}

// Helper function to log system changes
function log_system_change($userID, $action, $details = '') {
    return log_audit_trail($userID, $action, $details);
}

// Helper function to log login attempts
function log_login_attempt($userID, $username, $success, $details = '') {
    $action = $success ? 'login' : 'failed_login';
    $fullDetails = "Username: $username";
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}

// Helper function to log logout
function log_logout($userID, $username) {
    return log_audit_trail($userID, 'logout', "Username: $username");
}

// Helper function to log inventory changes
function log_inventory_change($userID, $action, $productID, $productName, $quantity, $details = '') {
    $fullDetails = "Product: $productName (ID: $productID) - Quantity: $quantity";
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}

// Helper function to log order changes
function log_order_change($userID, $action, $orderID, $amount = null, $details = '') {
    $fullDetails = "Order ID: $orderID";
    if ($amount !== null) {
        $fullDetails .= " - Amount: ₱$amount";
    }
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}

// Helper function to log settings changes
function log_settings_change($userID, $action, $settingName, $oldValue = null, $newValue = null, $details = '') {
    $fullDetails = "Setting: $settingName";
    if ($oldValue !== null && $newValue !== null) {
        $fullDetails .= " - Changed from '$oldValue' to '$newValue'";
    }
    if ($details) {
        $fullDetails .= " - $details";
    }
    
    return log_audit_trail($userID, $action, $fullDetails);
}
?>
