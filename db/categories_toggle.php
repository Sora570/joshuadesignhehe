<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

$cat = intval($_POST['categoryID'] ?? 0);
$isActive = isset($_POST['isActive']) ? intval($_POST['isActive']) : 0;
if (!$cat) { echo json_encode(['status'=>'error','message'=>'Missing']); exit; }
$stmt = $conn->prepare("UPDATE categories SET isActive=? WHERE categoryID=?");
$stmt->bind_param("ii", $isActive, $cat);
$ok = $stmt->execute();
echo json_encode($ok ? ['status'=>'success'] : ['status'=>'error','message'=>$stmt->error]);
