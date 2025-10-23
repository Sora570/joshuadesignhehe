<?php
require_once __DIR__ . '/db_connect.php';

$id = intval($_POST['addonID'] ?? 0);
$active = intval($_POST['isActive'] ?? 1);

$stmt = $conn->prepare("UPDATE addons SET isActive=? WHERE addonID=?");
$stmt->bind_param("ii", $active, $id);
echo $stmt->execute() ? "success" : "error";