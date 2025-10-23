<?php
// logs_get.php → fetch logs for Settings tab
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

$sql = "SELECT logID, userEmail, actionType, details, timestamp AS createdAt
        FROM transaction_log
        ORDER BY timestamp DESC
        LIMIT 200";

$res = $conn->query($sql);

$out = [];
while ($r = $res->fetch_assoc()) {
    $out[] = $r;
}

echo json_encode($out);