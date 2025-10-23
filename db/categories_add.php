<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';
require_once __DIR__ . '/audit_log.php';

$cat = trim($_POST['categoryName'] ?? '');
if (!$cat) {
    echo json_encode(['status'=>'error','message'=>'Category name required']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO categories (categoryName, isActive) VALUES (?, 1)");
$stmt->bind_param("s", $cat);

if ($stmt->execute()) {
    $categoryID = $conn->insert_id;
    
    // Log audit activity
    if (isset($_SESSION['userID'])) {
        logCategoryActivity($conn, $_SESSION['userID'], 'add', $cat, "Category ID: $categoryID");
    }
    
    echo json_encode(['status'=>'success','categoryID'=>$categoryID]);
} else {
    echo json_encode(['status'=>'error','message'=>$stmt->error]);
}
