<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "kape_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$userEmail = $_POST['userEmail'] ?? "Guest";
$actionType = $_POST['actionType'];
$details = $_POST['details'];

$stmt = $conn->prepare("INSERT INTO transaction_log (userEmail, actionType, details) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $userEmail, $actionType, $details);

if ($stmt->execute()) {
    
} else {
    echo "error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>