<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $result = $conn->query("SELECT username, role FROM users ORDER BY role, username");
    
    if (!$result) {
        throw new Exception("Database query failed: " . $conn->error);
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'count' => count($users)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
