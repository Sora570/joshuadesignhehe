<?php
require_once __DIR__ . '/db_connect.php';

$id = intval($_POST['sizeID'] ?? 0);
$active = intval($_POST['isActive'] ?? 1);

$stmt = $conn->prepare("UPDATE sizes SET isActive=? WHERE sizeID=?");
$stmt->bind_param("ii", $active, $id);
echo $stmt->execute() ? "success" : "error";