<?php
require_once __DIR__ . '/db_connect.php';
$name = $_POST['addonName'] ?? '';
$priceSmall = $_POST['priceSmall'] ?? '';
$priceLarge = $_POST['priceLarge'] ?? '';
if ($name && $priceSmall && $priceLarge) {
    $stmt = $conn->prepare("INSERT INTO addons (addonName, priceSmall, priceLarge) VALUES (?, ?, ?)");
    $stmt->bind_param("sdd", $name, $priceSmall, $priceLarge);
    echo $stmt->execute() ? "success" : ("error: " . $stmt->error);
} else {
    echo "error: invalid input";
}