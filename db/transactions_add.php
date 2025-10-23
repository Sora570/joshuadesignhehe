<?php
require_once __DIR__ . '/db_connect.php';

$cashierID = $_POST['cashierID'];
$orderSummary = $_POST['orderSummary'];
$totalAmount = $_POST['totalAmount'];
$paymentMethod = $_POST['paymentMethod'];
$status = $_POST['status'] ?? 'Completed';

$stmt = $conn->prepare(
  "INSERT INTO transactions (cashierID, orderSummary, totalAmount, paymentMethod, status)
   VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("isdss", $cashierID, $orderSummary, $totalAmount, $paymentMethod, $status);
echo $stmt->execute() ? 'success' : 'error: '.$stmt->error;
?>