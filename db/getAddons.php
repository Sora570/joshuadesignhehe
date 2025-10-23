<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db_connect.php';

/*
  Returns rows like:
  {
    addonPriceID, addonID, addonName, amount, price
  }
*/
$sql = "SELECT ap.addonPriceID, a.addonID, a.addonName, ap.amount, ap.price
        FROM addon_prices ap
        JOIN addons a ON a.addonID = ap.addonID
        ORDER BY a.addonName, ap.amount";
$res = $conn->query($sql);

$out = [];
while ($r = $res->fetch_assoc()) { $out[] = $r; }
echo json_encode($out);