<?php
header('Content-Type: text/plain');
session_start();

require_once __DIR__ . '/db_connect.php';

try {
    // Check access
    if (!isset($_SESSION['userID']) || $_SESSION['role'] !== 'cashier') {
        throw new Exception('Cashier access required');
    }
    
    $data = json_decode($_POST['data'] ?? '{}', true);
    
    if (empty($data)) {
        throw new Exception('No closeout data received');
    }
    
    // Create closeout summary table if it doesn't exist
    $createTableSQL = "
    CREATE TABLE IF NOT EXISTS closeout_summaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cashier_id INT NOT NULL,
        cashier_name VARCHAR(100) NOT NULL,
        close_date DATE NOT NULL,
        high_sale_amount DECIMAL(10,2) DEFAULT 0,
        cash_counted DECIMAL(10,2) NOT NULL,
        over_short DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cashier_id) REFERENCES users(userID)
    )";
    
    $conn->query($createTableSQL);
    
    // Insert closeout summary
    $insertSQL = "
        INSERT INTO closeout_summaries 
        (cashier_id, cashier_name, close_date, high_sale_amount, cash_counted, over_short, notes, created_at) 
        VALUES (?, ?, CURDATE(), ?, ?, ?, ?, NOW())
    ";
    
    $stmt = $conn->prepare($insertSQL);
    $stmt->bind_param('issddds',
        $_SESSION['userID'],
        $_SESSION['username'],
        $data['cashCounted'], // Using as expected cash based on equations  
        $data['cashCounted'], // Cash counted  
        $data['overShort'],   // Over/Short calculation 
        $data['notes'] ?? ''
    );
    
    if ($stmt->execute()) {
        // Log audit trail
        $auditStmt = $conn->prepare("INSERT INTO audit_logs (userID, action, details, created_at) VALUES (?, 'closeout', ?, NOW())");
        $auditAction = 'Cashier end-of-shift closeout completed. Cash counted: ' . $data['cashCounted'] . ', Over/Short: ' . ($data['overShort'] >= 0 ? '+' : '') . $data['overShort'];
        $auditStmt->bind_param('is', $_SESSION['userID'], $auditAction);
        $auditStmt->execute();
        
        echo 'success';
    } else {
        throw new Exception('Failed to save closeout');
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo $e->getMessage();
}
?>
