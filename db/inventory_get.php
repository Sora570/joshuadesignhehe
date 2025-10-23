<?php
// db/inventory_get.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db_connect.php';

$sql = "SELECT
            i.inventoryID,
            i.`InventoryName`,
            i.`Category`,
            i.`Size`,
            i.`Unit`,
            i.`Current_Stock` AS `Current Stock`,
            i.`Cost_Price` AS `Cost Price`,
            i.`Total_Value` AS `Total Value`,
            i.`Status`
        FROM inventory i
        ORDER BY i.`Category`, i.`InventoryName`";

$res = $conn->query($sql);
$out = [];

if ($res) {
    while ($row = $res->fetch_assoc()) {
        $out[] = $row;
    }
}

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
?>
