-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 18, 2025 at 04:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kape_db2`
--

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

CREATE TABLE `addons` (
  `addonID` int(11) NOT NULL,
  `addonName` varchar(100) NOT NULL,
  `priceSmall` decimal(10,2) DEFAULT 10.00,
  `priceLarge` decimal(10,2) DEFAULT 15.00,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addons`
--

INSERT INTO `addons` (`addonID`, `addonName`, `priceSmall`, `priceLarge`, `isActive`) VALUES
(1, 'Milk', 10.00, 15.00, 1),
(2, 'Espresso Shot', 10.00, 15.00, 1),
(3, 'Syrup', 10.00, 15.00, 1),
(4, 'Strawberry Puree', 10.00, 15.00, 1),
(5, 'Condense', 10.00, 15.00, 1),
(6, 'Salted Cream', 10.00, 15.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `logID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`logID`, `userID`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-27 14:15:33'),
(2, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-27 16:13:20'),
(3, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-27 17:04:19'),
(4, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-27 17:04:39'),
(5, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 04:55:08'),
(6, 1, 'employee_added', 'Admin added new employee: johndoe', NULL, NULL, '2025-09-28 14:48:11'),
(7, 1, 'employee_added', 'Admin added new employee: jane_doe', NULL, NULL, '2025-09-28 14:50:13'),
(8, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 14:50:31'),
(9, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 14:50:58'),
(10, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 14:52:13'),
(11, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 14:59:20'),
(12, 4, 'logout', 'Logout for user: jane_doe', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 14:59:31'),
(13, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 15:06:56'),
(14, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-28 15:07:02'),
(15, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:43:03'),
(16, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:43:31'),
(17, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:43:36'),
(18, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:43:42'),
(19, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:43:44'),
(20, 4, 'login', 'Username: jane_doe', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:43:53'),
(21, 4, 'logout', 'Logout for user: jane_doe', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:44:29'),
(22, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:44:43'),
(23, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:45:47'),
(24, 4, 'login', 'Username: jane_doe', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:45:54'),
(25, 4, 'logout', 'Logout for user: jane_doe', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:46:26'),
(26, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:49:50'),
(27, 1, 'employee_added', 'Admin added new employee: norben_dacillo', NULL, NULL, '2025-09-29 00:52:35'),
(28, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:52:44'),
(29, 5, 'login', 'Username: norben_dacillo', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:52:51'),
(30, 5, 'logout', 'Logout for user: norben_dacillo', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:55:57'),
(31, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-09-29 00:57:01'),
(32, 1, 'logout', 'Logout for user: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-10-17 15:12:32'),
(33, 4, 'login', 'Username: jane_doe', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-10-17 15:12:38'),
(34, 1, 'login', 'Username: admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', '2025-10-17 15:22:36');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `categoryID` int(11) NOT NULL,
  `categoryName` varchar(100) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`categoryID`, `categoryName`, `isActive`) VALUES
(1, 'Coffee Based', 1),
(2, 'Non-Coffee', 1),
(3, 'Cheese Cake Series', 1),
(4, 'Berry Series', 1),
(5, 'Ube Series', 1),
(6, 'Latte', 1),
(7, 'Tea Series', 1),
(8, 'apple', 1);

-- --------------------------------------------------------

--
-- Table structure for table `closeout_summaries`
--

CREATE TABLE `closeout_summaries` (
  `id` int(11) NOT NULL,
  `cashier_id` int(11) NOT NULL,
  `cashier_name` varchar(100) NOT NULL,
  `close_date` date NOT NULL,
  `high_sale_amount` decimal(10,2) DEFAULT 0.00,
  `cash_counted` decimal(10,2) NOT NULL,
  `over_short` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `inventoryID` int(11) NOT NULL,
  `InventoryName` varchar(150) NOT NULL,
  `Category` varchar(100) NOT NULL,
  `Size` varchar(50) NOT NULL,
  `Unit` varchar(50) NOT NULL,
  `Current_Stock` int(11) NOT NULL DEFAULT 0,
  `Cost_Price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Total_Value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Status` varchar(20) NOT NULL DEFAULT 'In Stock'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `orderID` int(11) NOT NULL,
  `userID` int(11) DEFAULT NULL,
  `paymentMethod` varchar(20) DEFAULT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `totalAmount` decimal(10,2) DEFAULT 0.00,
  `createdAt` datetime DEFAULT current_timestamp(),
  `cash_received` decimal(10,2) DEFAULT 0.00,
  `payment_method` enum('cash','gcash','other') DEFAULT 'cash',
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `productID` int(11) NOT NULL,
  `productName` varchar(150) NOT NULL,
  `categoryID` int(11) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `unit_type` varchar(50) DEFAULT 'piece',
  `unit_value` decimal(10,2) DEFAULT 1.00,
  `base_price` decimal(10,2) DEFAULT 0.00,
  `cost_price` decimal(10,2) DEFAULT 0.00,
  `is_trackable` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`productID`, `productName`, `categoryID`, `isActive`, `createdAt`, `unit_type`, `unit_value`, `base_price`, `cost_price`, `is_trackable`) VALUES
(1, 'Caramel Macchiato', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(2, 'Cinnamon Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(3, 'Coconut Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(4, 'Sea Salt Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(5, 'Spanish Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(6, 'Hazelnut Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(7, 'Mocha Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(8, 'Dirty Matcha', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(9, 'Dulca de Leche Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(10, 'Salted Caramel Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(11, 'White Mocha Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(12, 'Cafe Latte', 1, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(13, 'Matcha', 2, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(14, 'Cookies & Cream', 2, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(15, 'Milo Overload', 2, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(16, 'Red Velvet', 2, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(17, 'Coconut Matcha', 2, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(18, 'Berry Cheesecake', 3, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(19, 'Matcha Cheesecake', 3, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(20, 'Oreo Cheesecake', 3, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(21, 'Ube Cheesecake', 3, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(22, 'Red Velvet Cheesecake', 3, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(23, 'Strawberry Milk', 4, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(24, 'Berry Matcha', 4, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(25, 'Berry Oreo', 4, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(26, 'Berry Choco', 4, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(27, 'Creamy Ube', 5, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(28, 'Ube Latte', 5, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(29, 'Ube Matcha', 5, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(30, 'Ube Macapuno', 5, 1, '2025-09-08 16:06:13', 'piece', 1.00, 0.00, 0.00, 1),
(37, 'Berry Cafe', 4, 1, '2025-09-19 14:45:59', 'piece', 1.00, 0.00, 0.00, 1),
(38, 'Berry Latte', 4, 1, '2025-09-19 14:52:03', 'piece', 1.00, 0.00, 0.00, 1),
(42, 'Berry Juice', 4, 1, '2025-09-24 14:23:19', 'piece', 1.00, 0.00, 0.00, 1),
(43, 'blueberry', 4, 1, '2025-09-24 15:07:23', 'piece', 1.00, 0.00, 0.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_addons`
--

CREATE TABLE `product_addons` (
  `addon_id` int(11) NOT NULL,
  `addon_name` varchar(100) NOT NULL,
  `addon_type` enum('topping','syrup','milk','sweetener','size','other') DEFAULT 'other',
  `price` decimal(10,2) DEFAULT 0.00,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_addons`
--

INSERT INTO `product_addons` (`addon_id`, `addon_name`, `addon_type`, `price`, `is_available`, `created_at`) VALUES
(1, 'Extra Shot', 'other', 15.00, 1, '2025-09-27 13:00:08'),
(2, 'Oat Milk', 'milk', 10.00, 1, '2025-09-27 13:00:08'),
(3, 'Almond Milk', 'milk', 10.00, 1, '2025-09-27 13:00:08'),
(4, 'Vanilla Syrup', 'syrup', 5.00, 1, '2025-09-27 13:00:08'),
(5, 'Caramel Syrup', 'syrup', 5.00, 1, '2025-09-27 13:00:08'),
(6, 'Extra Sugar', 'sweetener', 0.00, 1, '2025-09-27 13:00:08'),
(7, 'No Sugar', 'sweetener', 0.00, 1, '2025-09-27 13:00:08'),
(8, 'Whipped Cream', 'topping', 8.00, 1, '2025-09-27 13:00:08'),
(9, 'Chocolate Chips', 'topping', 12.00, 1, '2025-09-27 13:00:08'),
(10, 'Extra Shot', 'other', 15.00, 1, '2025-09-28 05:06:36'),
(11, 'Oat Milk', 'milk', 10.00, 1, '2025-09-28 05:06:36'),
(12, 'Almond Milk', 'milk', 10.00, 1, '2025-09-28 05:06:36'),
(13, 'Vanilla Syrup', 'syrup', 5.00, 1, '2025-09-28 05:06:36'),
(14, 'Caramel Syrup', 'syrup', 5.00, 1, '2025-09-28 05:06:36'),
(15, 'Extra Sugar', 'sweetener', 0.00, 1, '2025-09-28 05:06:36'),
(16, 'No Sugar', 'sweetener', 0.00, 1, '2025-09-28 05:06:36'),
(17, 'Whipped Cream', 'topping', 8.00, 1, '2025-09-28 05:06:36'),
(18, 'Chocolate Chips', 'topping', 12.00, 1, '2025-09-28 05:06:36'),
(19, 'Extra Shot', 'other', 15.00, 1, '2025-10-16 17:22:39'),
(20, 'Oat Milk', 'milk', 10.00, 1, '2025-10-16 17:22:39'),
(21, 'Almond Milk', 'milk', 10.00, 1, '2025-10-16 17:22:39'),
(22, 'Vanilla Syrup', 'syrup', 5.00, 1, '2025-10-16 17:22:39'),
(23, 'Caramel Syrup', 'syrup', 5.00, 1, '2025-10-16 17:22:39'),
(24, 'Extra Sugar', 'sweetener', 0.00, 1, '2025-10-16 17:22:39'),
(25, 'No Sugar', 'sweetener', 0.00, 1, '2025-10-16 17:22:39'),
(26, 'Whipped Cream', 'topping', 8.00, 1, '2025-10-16 17:22:39'),
(27, 'Chocolate Chips', 'topping', 12.00, 1, '2025-10-16 17:22:39');

-- --------------------------------------------------------

--
-- Table structure for table `product_prices`
--

CREATE TABLE `product_prices` (
  `productID` int(11) NOT NULL,
  `sizeID` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_prices`
--

INSERT INTO `product_prices` (`productID`, `sizeID`, `unit_id`, `price`) VALUES
(1, 1, 1, 0.00),
(1, 1, 2, 55.00),
(1, 2, 1, 0.00),
(1, 2, 2, 85.00),
(1, 3, 1, 0.00),
(2, 1, 1, 0.00),
(2, 2, 1, 0.00),
(2, 3, 1, 0.00),
(3, 1, 1, 0.00),
(3, 2, 1, 0.00),
(3, 3, 1, 0.00),
(4, 1, 1, 0.00),
(4, 2, 1, 0.00),
(4, 3, 1, 0.00),
(5, 1, 1, 0.00),
(5, 2, 1, 0.00),
(5, 3, 1, 0.00),
(6, 1, 1, 0.00),
(6, 2, 1, 0.00),
(6, 3, 1, 0.00),
(7, 1, 1, 0.00),
(7, 2, 1, 0.00),
(7, 3, 1, 0.00),
(8, 1, 1, 0.00),
(8, 2, 1, 0.00),
(8, 3, 1, 0.00),
(9, 1, 1, 0.00),
(9, 2, 1, 0.00),
(9, 3, 1, 0.00),
(10, 1, 1, 0.00),
(10, 2, 1, 0.00),
(10, 3, 1, 0.00),
(11, 1, 1, 0.00),
(11, 2, 1, 0.00),
(11, 3, 1, 0.00),
(12, 1, 1, 0.00),
(12, 2, 1, 0.00),
(12, 3, 1, 0.00),
(13, 1, 1, 0.00),
(13, 2, 1, 0.00),
(13, 3, 1, 0.00),
(14, 1, 1, 0.00),
(14, 2, 1, 0.00),
(14, 3, 1, 0.00),
(15, 1, 1, 0.00),
(15, 2, 1, 0.00),
(15, 3, 1, 0.00),
(16, 1, 1, 0.00),
(16, 2, 1, 0.00),
(16, 3, 1, 0.00),
(17, 1, 1, 0.00),
(17, 2, 1, 0.00),
(17, 3, 1, 0.00),
(18, 1, 1, 0.00),
(18, 2, 1, 0.00),
(18, 3, 1, 0.00),
(19, 1, 1, 0.00),
(19, 2, 1, 0.00),
(19, 3, 1, 0.00),
(20, 1, 1, 0.00),
(20, 2, 1, 0.00),
(20, 3, 1, 0.00),
(21, 1, 1, 0.00),
(21, 2, 1, 0.00),
(21, 3, 1, 0.00),
(22, 1, 1, 0.00),
(22, 2, 1, 0.00),
(22, 3, 1, 0.00),
(23, 1, 1, 0.00),
(23, 2, 1, 0.00),
(23, 3, 1, 0.00),
(24, 1, 1, 0.00),
(24, 2, 1, 0.00),
(24, 3, 1, 0.00),
(25, 1, 1, 0.00),
(25, 2, 1, 0.00),
(25, 3, 1, 0.00),
(26, 1, 1, 0.00),
(26, 2, 1, 0.00),
(26, 3, 1, 0.00),
(27, 1, 1, 0.00),
(27, 2, 1, 0.00),
(27, 3, 1, 0.00),
(28, 1, 1, 0.00),
(28, 2, 1, 0.00),
(28, 3, 1, 0.00),
(29, 1, 1, 0.00),
(29, 2, 1, 0.00),
(29, 3, 1, 0.00),
(30, 1, 1, 0.00),
(30, 2, 1, 0.00),
(30, 3, 1, 0.00),
(37, 1, 1, 0.00),
(37, 2, 1, 0.00),
(37, 3, 1, 0.00),
(38, 1, 1, 0.00),
(38, 2, 1, 0.00),
(38, 3, 1, 0.00),
(42, 1, 1, 0.00),
(42, 2, 1, 0.00),
(42, 3, 1, 0.00),
(43, 1, 1, 0.00),
(43, 2, 1, 0.00),
(43, 3, 1, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `product_units`
--

CREATE TABLE `product_units` (
  `unit_id` int(11) NOT NULL,
  `unit_name` varchar(50) NOT NULL,
  `unit_symbol` varchar(10) NOT NULL,
  `conversion_factor` decimal(10,4) DEFAULT 1.0000,
  `is_base_unit` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_units`
--

INSERT INTO `product_units` (`unit_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_base_unit`, `created_at`) VALUES
(1, 'Piece', 'pc', 1.0000, 1, '2025-09-27 12:59:48'),
(2, 'Ounce', 'oz', 1.0000, 1, '2025-09-27 12:59:48'),
(3, 'Pound', 'lb', 16.0000, 0, '2025-09-27 12:59:48'),
(4, 'Kilogram', 'kg', 35.2740, 0, '2025-09-27 12:59:48'),
(5, 'Gram', 'g', 0.0353, 0, '2025-09-27 12:59:48'),
(6, 'Liter', 'L', 33.8140, 0, '2025-09-27 12:59:48'),
(7, 'Milliliter', 'mL', 0.0338, 0, '2025-09-27 12:59:48'),
(8, 'Cup', 'cup', 8.0000, 0, '2025-09-27 12:59:48'),
(9, 'Tablespoon', 'tbsp', 0.5000, 0, '2025-09-27 12:59:48'),
(10, 'Teaspoon', 'tsp', 0.1667, 0, '2025-09-27 12:59:48');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `sizeID` int(11) NOT NULL,
  `sizeName` varchar(50) NOT NULL,
  `defaultPrice` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`sizeID`, `sizeName`, `defaultPrice`, `isActive`) VALUES
(1, '16', 55.00, 1),
(2, '22', 85.00, 1),
(3, '12', 0.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_name` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_name`, `value`, `description`, `updated_at`) VALUES
(1, 'manager_override_pin', '$2y$10$h8H7EiaA1YI0ZYj8x62EGe1dQRJOlEkrKAyJKWQ/M.l1j.BnNdZHO', 'Manager override authorization PIN (default is hashed but you should change it)', '2025-09-27 12:59:47'),
(2, 'max_discount_without_override', '20', 'Automatic override is required for discounts above this percentage', '2025-09-27 12:59:47'),
(3, 'company_name', 'Kape Timplado', 'Business name', '2025-09-27 12:59:47'),
(4, 'system_version', '2.0', 'Running system version', '2025-09-27 12:59:47'),
(5, 'analytics_refresh_minutes', '5', 'Dashboard auto-refresh interval in minutes', '2025-09-27 12:59:47'),
(6, 'default_transaction_limit', '100', 'Default number of transactions to load in admin transactions view', '2025-09-27 12:59:47');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transactionID` int(11) NOT NULL,
  `cashierID` int(11) NOT NULL,
  `orderSummary` text NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `paymentMethod` enum('Cash','GCash') DEFAULT 'Cash',
  `status` enum('Completed','Refunded','Voided') DEFAULT 'Completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_log`
--

CREATE TABLE `transaction_log` (
  `logID` int(11) NOT NULL,
  `userEmail` varchar(100) DEFAULT 'Guest',
  `actionType` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction_log`
--

INSERT INTO `transaction_log` (`logID`, `userEmail`, `actionType`, `details`, `createdAt`) VALUES
(1, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=31', '2025-09-19 09:37:17'),
(2, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=35', '2025-09-19 09:38:01'),
(3, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=34', '2025-09-19 09:38:04'),
(4, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=33', '2025-09-19 09:38:06'),
(5, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=32', '2025-09-19 13:30:28'),
(6, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=36', '2025-09-19 13:38:20'),
(7, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=39', '2025-09-19 16:09:34'),
(8, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=40', '2025-09-24 14:22:32'),
(9, 'Guest', 'DELETE_PRODUCT', 'Deleted product ID=41', '2025-09-24 14:23:07');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('admin','cashier') DEFAULT 'admin',
  `isActive` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `pin_hash` varchar(255) DEFAULT NULL,
  `employee_id` varchar(20) DEFAULT NULL,
  `shift_start` timestamp NULL DEFAULT NULL,
  `shift_end` timestamp NULL DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `username`, `passwordHash`, `role`, `isActive`, `created_at`, `last_login`, `is_active`, `pin_hash`, `employee_id`, `shift_start`, `shift_end`, `last_activity`, `first_name`, `last_name`, `email`, `phone`, `address`) VALUES
(1, 'admin', '$2y$10$kFK7AkmYA3BkcGstrunmLupuS.VTgq/mS84IxoKmTTzkTxyr8DEWG', 'admin', 1, '2025-09-27 12:59:47', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'cashier', '$2y$10$j0hbcs6M821qzLv61a2KkuPNor.otE4De./x7wunKF0p80oJOHio2', 'cashier', 1, '2025-09-27 12:59:47', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'johndoe', '$2y$10$l1k2ngq4EEg5WYXoY4T9aOIeCv8IZ5mMWn5BpXKd2tFckozq.9orK', 'cashier', 1, '2025-09-28 14:48:11', NULL, 1, '$2y$10$uklkUu/1x.ztM1haBiIWKOfEftkmIjKFsgcvGFVnB2S.VJToShTLO', 'EMP001', NULL, NULL, NULL, 'John', 'Doe', 'john.doe@example.com', '123-456-7890', '123 Test Street'),
(4, 'jane_doe', '$2y$10$srBMYyuXJGTpDG7RIp3XROgq/yDrErdHQCalhefDXiIBiGFjnFw/C', 'cashier', 1, '2025-09-28 14:50:13', NULL, 1, '$2y$10$bn/sILeOiIfPuYuPrB8UWOIF0hG9056/kOSGFrhub8wn84kKss9BO', 'EMP002', NULL, NULL, NULL, 'Jane', 'Doe', 'test@gmail.com', '12345678901', 'hello st.'),
(5, 'norben_dacillo', '$2y$10$RGenhEU9ihjmarjG1NUIpu7ESeEgNky47JiLgyNzbxnMNfFQiQPF2', 'cashier', 1, '2025-09-29 00:52:35', NULL, 1, '$2y$10$rHse1vYNuqWk4Uys.u1Cce4ekB/TFQvcghCueQhDDg3gKYzD/8gLK', 'EMP003', NULL, NULL, NULL, 'Norben', 'Dacillo', 'deshilyonorben@gmail.com', '999999999', 'Navotas');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addons`
--
ALTER TABLE `addons`
  ADD PRIMARY KEY (`addonID`),
  ADD UNIQUE KEY `addonName` (`addonName`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`logID`),
  ADD KEY `idx_user` (`userID`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_date` (`created_at`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryID`),
  ADD UNIQUE KEY `categoryName` (`categoryName`);

--
-- Indexes for table `closeout_summaries`
--
ALTER TABLE `closeout_summaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cashier` (`cashier_id`),
  ADD KEY `idx_date` (`close_date`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventoryID`),
  ADD KEY `idx_category` (`Category`),
  ADD KEY `idx_size` (`Size`),
  ADD KEY `idx_status` (`Status`),
  ADD KEY `idx_stock` (`Current_Stock`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`productID`),
  ADD KEY `categoryID` (`categoryID`);

--
-- Indexes for table `product_addons`
--
ALTER TABLE `product_addons`
  ADD PRIMARY KEY (`addon_id`);

--
-- Indexes for table `product_prices`
--
ALTER TABLE `product_prices`
  ADD PRIMARY KEY (`productID`,`sizeID`,`unit_id`),
  ADD KEY `sizeID` (`sizeID`),
  ADD KEY `fk_product_prices_unit_id` (`unit_id`);

--
-- Indexes for table `product_units`
--
ALTER TABLE `product_units`
  ADD PRIMARY KEY (`unit_id`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`sizeID`),
  ADD UNIQUE KEY `sizeName` (`sizeName`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transactionID`),
  ADD KEY `cashierID` (`cashierID`);

--
-- Indexes for table `transaction_log`
--
ALTER TABLE `transaction_log`
  ADD PRIMARY KEY (`logID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `employee_id` (`employee_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addons`
--
ALTER TABLE `addons`
  MODIFY `addonID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `categoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `closeout_summaries`
--
ALTER TABLE `closeout_summaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `orderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `productID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `product_addons`
--
ALTER TABLE `product_addons`
  MODIFY `addon_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `product_units`
--
ALTER TABLE `product_units`
  MODIFY `unit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `sizeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transactionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_log`
--
ALTER TABLE `transaction_log`
  MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_users` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `closeout_summaries`
--
ALTER TABLE `closeout_summaries`
  ADD CONSTRAINT `fk_closeout_users` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `categories` (`categoryID`) ON DELETE CASCADE;

--
-- Constraints for table `product_prices`
--
ALTER TABLE `product_prices`
  ADD CONSTRAINT `fk_product_prices_unit_id` FOREIGN KEY (`unit_id`) REFERENCES `product_units` (`unit_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_prices_ibfk_1` FOREIGN KEY (`productID`) REFERENCES `products` (`productID`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_prices_ibfk_2` FOREIGN KEY (`sizeID`) REFERENCES `sizes` (`sizeID`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`cashierID`) REFERENCES `users` (`userID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
