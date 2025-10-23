<?php
session_start();
require_once 'db_connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['userID'])) {
    echo json_encode(['status' => 'error', 'message' => 'No session']);
    exit;
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'start_shift':
        $sql = "UPDATE users SET shift_start = NOW(), last_activity = NOW() WHERE userID = ?";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param('i', $_SESSION['userID']);
            echo json_encode($stmt->execute() ? 
                ['status' => 'ok','shift_began' => true] : 
                array('err', 'Query failed'));
            $stmt->close();
        } else echo json_encode(['err', 'DB prep failed']);
        break;

    case 'end_shift':
        $stmt = 'UPDATE users SET shift_end=NOW(),last_activity=NOW()  WHERE userID=?';
        $q = $conn->prepare($stmt);
        $q->bind_param("i", $_SESSION['userID']);
        echo(json_encode($q->execute() ? ['status'=>'ok','session_concluded' =>true] : ['err','could not end shift']));
        break;

    default:
        echo json_encode(['err', 'Unknown action']);
}
$conn->close();
?>
