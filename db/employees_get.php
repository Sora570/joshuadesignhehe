<?php
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/db_connect.php';

try {
    // Check admin access
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin' || !isset($_SESSION['userID'])) {
        throw new Exception("Access denied. Admin permissions required.");
    }
    
    $query = "
        SELECT 
            u.userID,
            u.username,
            u.role,
            u.created_at as createdAt,
            COALESCE(u.employee_id, 'N/A') as employee_id,
            COALESCE(u.shift_start, NULL) as shift_start,
            COALESCE(u.shift_end, NULL) as shift_end,
            COALESCE(
                (SELECT MAX(al.created_at) 
                 FROM audit_logs al 
                 WHERE al.userID = u.userID 
                 AND LOWER(al.action) = 'login'), 
                u.last_login
            ) as lastLogin,
            CASE 
                WHEN COALESCE(u.shift_start, '') != '' AND COALESCE(u.shift_end, '') = '' THEN 'Online'
                WHEN COALESCE(u.shift_start, '') != '' AND COALESCE(u.shift_end, '') != '' AND u.shift_end > u.shift_start THEN 'Offline'
                ELSE 'Not Started'
            END as status
        FROM users u 
        WHERE u.role IN ('cashier', 'admin')
        ORDER BY u.created_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    if ($stmt === false) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $employees = [];
    
    while ($row = $result->fetch_assoc()) {
        $employees[] = [
            'userID' => intval($row['userID']),
            'username' => $row['username'],
            'role' => $row['role'],
            'createdAt' => $row['createdAt'],
            'lastLogin' => $row['lastLogin'],
            'status' => $row['status'],
            'employee_id' => $row['employee_id'],
            'shift_start' => $row['shift_start'],
            'shift_end' => $row['shift_end']
        ];
    }
    
    $stmt->close();
    echo json_encode($employees);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
