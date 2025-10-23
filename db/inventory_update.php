<?php
// db/inventory_update.php
require_once __DIR__ . '/db_connect.php';
header('Content-Type: application/json');

$inventoryID = intval($_POST['inventoryID'] ?? 0);
$action = $_POST['action'] ?? '';

if (!$inventoryID) {
    echo json_encode(['status' => 'error', 'message' => 'Missing inventory ID']);
    exit;
}

$conn->begin_transaction();

try {
    // Get current inventory data
    $getStmt = $conn->prepare("SELECT * FROM inventory WHERE inventoryID = ?");
    $getStmt->bind_param('i', $inventoryID);
    $getStmt->execute();
    $currentData = $getStmt->get_result()->fetch_assoc();

    if (!$currentData) {
        throw new Exception('Inventory entry not found');
    }

    $updateFields = [];
    $updateValues = [];
    $types = '';

    switch ($action) {
        case 'update_stock':
            $newStock = intval($_POST['Current Stock'] ?? 0);
            if ($newStock < 0) {
                throw new Exception('Stock cannot be negative');
            }

            $updateFields[] = '`Current Stock` = ?';
            $updateValues[] = $newStock;
            $types .= 'i';

            // No logging needed
            break;

        case 'update_cost_price':
            $newCostPrice = floatval($_POST['Cost Price'] ?? 0);
            if ($newCostPrice < 0) {
                throw new Exception('Cost price cannot be negative');
            }

            $updateFields[] = '`Cost Price` = ?';
            $updateValues[] = $newCostPrice;
            $types .= 'd';

            // Recalculate total value
            $totalValue = $newCostPrice * $currentData['Current Stock'];

            $updateFields[] = '`Total Value` = ?';
            $updateValues[] = $totalValue;
            $types .= 'd';
            break;

        case 'update_total_value':
            $newTotalValue = floatval($_POST['Total Value'] ?? 0);
            if ($newTotalValue < 0) {
                throw new Exception('Total value cannot be negative');
            }

            $updateFields[] = '`Total Value` = ?';
            $updateValues[] = $newTotalValue;
            $types .= 'd';
            break;

        case 'update_status':
            $newStatus = trim($_POST['Status'] ?? '');
            if (!$newStatus) {
                throw new Exception('Status cannot be empty');
            }

            $updateFields[] = '`Status` = ?';
            $updateValues[] = $newStatus;
            $types .= 's';
            break;

        case 'update_inventory':
            // Update all fields for full inventory item update
            $inventoryName = trim($_POST['InventoryName'] ?? '');
            $category = trim($_POST['Category'] ?? '');
            $size = trim($_POST['Size'] ?? '');
            $unit = trim($_POST['Unit'] ?? '');
            $currentStock = intval($_POST['Current_Stock'] ?? 0);
            $costPrice = floatval($_POST['Cost_Price'] ?? 0);
            $totalValue = floatval($_POST['Total_Value'] ?? 0);

            if (!$inventoryName || !$category || !$size || !$unit) {
                throw new Exception('All fields are required');
            }

            if ($currentStock < 0 || $costPrice < 0 || $totalValue < 0) {
                throw new Exception('Numeric values cannot be negative');
            }

            $updateFields[] = '`InventoryName` = ?';
            $updateValues[] = $inventoryName;
            $types .= 's';

            $updateFields[] = '`Category` = ?';
            $updateValues[] = $category;
            $types .= 's';

            $updateFields[] = '`Size` = ?';
            $updateValues[] = $size;
            $types .= 's';

            $updateFields[] = '`Unit` = ?';
            $updateValues[] = $unit;
            $types .= 's';

            $updateFields[] = '`Current_Stock` = ?';
            $updateValues[] = $currentStock;
            $types .= 'i';

            $updateFields[] = '`Cost_Price` = ?';
            $updateValues[] = $costPrice;
            $types .= 'd';

            $updateFields[] = '`Total_Value` = ?';
            $updateValues[] = $totalValue;
            $types .= 'd';
            break;

        default:
            throw new Exception('Invalid action');
    }
    
    if (empty($updateFields)) {
        throw new Exception('No fields to update');
    }
    
    // Add inventoryID to the values array
    $updateValues[] = $inventoryID;
    $types .= 'i';
    
    // Build and execute update query
    $updateSql = "UPDATE inventory SET " . implode(', ', $updateFields) . " WHERE inventoryID = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param($types, ...$updateValues);
    
    if (!$updateStmt->execute()) {
        throw new Exception($updateStmt->error);
    }
    
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Inventory updated successfully']);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
