-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: finance_crm
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(10) unsigned DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_logs_user` (`user_id`),
  KEY `idx_logs_action` (`action`),
  KEY `idx_logs_created` (`created_at`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role_type` enum('smart','super','closer') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_agent_role` (`name`,`role_type`),
  KEY `idx_agent_role_type` (`role_type`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,'Hamza Khan','smart',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(2,'Usama Ali','smart',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(3,'Bilal Ahmed','smart',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(4,'Daniyal Tariq','smart',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(5,'Farhan Sheikh','smart',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(6,'Kashif Mehmood','smart',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(7,'Zia Uddin','super',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(8,'Kamran Akmal','super',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(9,'Rashid Minhas','super',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(10,'Tariq Jamil','super',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(11,'Asif Ali','super',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(12,'shahab','closer',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(13,'imran','closer',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(14,'fahad','closer',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(15,'salman','closer',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(16,'adnan','closer',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(17,'waqas','closer',1,'2026-09-03 22:59:54','2026-09-03 22:59:54');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clients` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `connector_id` int(10) unsigned DEFAULT NULL,
  `connector_name` varchar(100) DEFAULT NULL,
  `smart_agent_id` int(10) unsigned DEFAULT NULL,
  `smart_agent_name` varchar(100) DEFAULT NULL,
  `super_agent_id` int(10) unsigned DEFAULT NULL,
  `super_agent_name` varchar(100) DEFAULT NULL,
  `closer_id` int(10) unsigned DEFAULT NULL,
  `closer_name` varchar(100) DEFAULT NULL,
  `status` enum('Submit','Charged','Kick Back') NOT NULL DEFAULT 'Submit',
  `plan` int(10) unsigned NOT NULL DEFAULT 12,
  `monthly` decimal(10,2) DEFAULT NULL,
  `initial_payment` decimal(10,2) DEFAULT NULL,
  `initial_payment_date` date DEFAULT NULL,
  `residual` decimal(10,2) DEFAULT NULL,
  `approval_amount` decimal(10,2) DEFAULT NULL,
  `receiving` enum('Pending','Received') NOT NULL DEFAULT 'Pending',
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_client_connector` (`connector_id`),
  KEY `fk_client_smart_agent` (`smart_agent_id`),
  KEY `fk_client_super_agent` (`super_agent_id`),
  KEY `fk_client_closer` (`closer_id`),
  KEY `fk_client_created_by` (`created_by`),
  KEY `idx_clients_date` (`date`),
  KEY `idx_clients_status` (`status`),
  KEY `idx_clients_receiving` (`receiving`),
  KEY `idx_clients_name` (`client_name`),
  KEY `idx_clients_plan` (`plan`),
  CONSTRAINT `fk_client_closer` FOREIGN KEY (`closer_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_client_connector` FOREIGN KEY (`connector_id`) REFERENCES `connectors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_client_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_client_smart_agent` FOREIGN KEY (`smart_agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_client_super_agent` FOREIGN KEY (`super_agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (37,'2026-08-03','FRANZ KAFKA',3,'Marcus Aurelius',1,'Hamza Khan',8,'Kamran Akmal',12,'shahab','Charged',24,315.00,350.00,'2026-08-03',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:28'),(38,'2026-08-04','ALICE WALKER',4,'David Beckham',2,'Usama Ali',9,'Rashid Minhas',13,'imran','Submit',36,260.00,480.00,'2026-08-04',50.00,1000.00,'Pending',1,'2026-07-31 19:00:00','2026-09-03 22:59:54'),(39,'2026-08-05','HOMER ILIAD',5,'Sarah Connor',3,'Bilal Ahmed',10,'Tariq Jamil',14,'fahad','Charged',12,520.00,600.00,'2026-08-05',55.00,1100.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:29'),(40,'2026-08-06','SIMONE DE BEAUVOIR',6,'Jonathan Vance',4,'Daniyal Tariq',11,'Asif Ali',15,'salman','Charged',24,295.00,260.00,'2026-08-07',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:30'),(41,'2026-08-10','DANTE ALIGHIERI',7,'Lucas Scott',5,'Farhan Sheikh',7,'Zia Uddin',16,'adnan','Charged',36,235.00,390.00,'2026-08-10',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:26'),(42,'2026-08-11','GEORGE ELIOT',1,'Zabloon Shamaun',6,'Kashif Mehmood',8,'Kamran Akmal',17,'waqas','Submit',24,345.00,450.00,'2026-08-11',50.00,1000.00,'Pending',1,'2026-07-31 19:00:00','2026-09-03 22:59:54'),(43,'2026-08-12','JOHN MILTON',2,'Arthur Pendelton',1,'Hamza Khan',9,'Rashid Minhas',12,'shahab','Charged',12,475.00,530.00,'2026-08-12',55.00,1100.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:27'),(44,'2026-08-13','ZORA NEALE HURSTON',3,'Marcus Aurelius',2,'Usama Ali',10,'Tariq Jamil',13,'imran','Kick Back',48,170.00,310.00,'2026-08-14',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-03 22:59:54'),(45,'2026-08-17','WILLIAM SHAKESPEARE',4,'David Beckham',3,'Bilal Ahmed',11,'Asif Ali',14,'fahad','Charged',24,380.00,340.00,'2026-08-17',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:24'),(46,'2026-08-18','CHIMAMANDA NGOZI',5,'Sarah Connor',4,'Daniyal Tariq',7,'Zia Uddin',15,'salman','Submit',36,250.00,420.00,'2026-08-18',50.00,1000.00,'Pending',1,'2026-07-31 19:00:00','2026-09-03 22:59:54'),(47,'2026-08-19','GEOFFREY CHAUCER',6,'Jonathan Vance',5,'Farhan Sheikh',8,'Kamran Akmal',16,'adnan','Charged',12,490.00,680.00,'2026-08-19',55.00,1100.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:24'),(48,'2026-08-20','EDITH WHARTON',7,'Lucas Scott',6,'Kashif Mehmood',9,'Rashid Minhas',17,'waqas','Charged',60,155.00,300.00,'2026-08-21',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:25'),(49,'2026-08-24','HERMAN HESSE',1,'Zabloon Shamaun',1,'Hamza Khan',10,'Tariq Jamil',12,'shahab','Charged',24,335.00,360.00,'2026-08-24',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:22'),(50,'2026-08-25','OCTAVIA BUTLER',2,'Arthur Pendelton',2,'Usama Ali',11,'Asif Ali',13,'imran','Submit',36,245.00,470.00,'2026-08-25',50.00,1000.00,'Pending',1,'2026-07-31 19:00:00','2026-09-03 22:59:54'),(51,'2026-08-26','THOMAS MANN',3,'Marcus Aurelius',3,'Bilal Ahmed',7,'Zia Uddin',14,'fahad','Charged',12,510.00,550.00,'2026-08-26',55.00,1100.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:21'),(52,'2026-08-27','URSULA LE GUIN',4,'David Beckham',4,'Daniyal Tariq',8,'Kamran Akmal',15,'salman','Charged',48,180.00,280.00,'2026-08-28',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 18:16:20'),(53,'2026-08-31','MARCEL PROUST',5,'Sarah Connor',5,'Farhan Sheikh',9,'Rashid Minhas',16,'adnan','Charged',24,350.00,380.00,'2026-08-31',45.00,900.00,'Pending',1,'2026-07-31 19:00:00','2026-09-04 17:49:02'),(54,'2026-07-29','LEO TOLSTOY',2,'Arthur Pendelton',2,'Usama Ali',8,'Kamran Akmal',13,'imran','Charged',24,250.00,300.00,'2026-07-29',50.00,1000.00,'Received',1,'2026-09-04 00:21:11','2026-09-04 18:37:12'),(57,'2026-07-27','MARK TWAIN',4,'David Beckham',4,'Daniyal Tariq',10,'Tariq Jamil',15,'salman','Charged',36,240.00,280.00,'2026-07-27',45.00,900.00,'Pending',1,'2026-07-31 14:00:00','2026-09-04 18:16:31');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `connectors`
--

DROP TABLE IF EXISTS `connectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `connectors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_connector_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connectors`
--

LOCK TABLES `connectors` WRITE;
/*!40000 ALTER TABLE `connectors` DISABLE KEYS */;
INSERT INTO `connectors` VALUES (1,'Zabloon Shamaun',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(2,'Arthur Pendelton',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(3,'Marcus Aurelius',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(4,'David Beckham',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(5,'Sarah Connor',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(6,'Jonathan Vance',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(7,'Lucas Scott',1,'2026-09-03 22:59:54','2026-09-03 22:59:54'),(8,'Test Connector',1,'2026-09-03 22:59:54','2026-09-03 22:59:54');
/*!40000 ALTER TABLE `connectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','client_user','report_user','commission_user') NOT NULL DEFAULT 'client_user',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','Admin Lead','admin@financeportal.com','$2y$10$XD/xFa5mDi9vnHV2n.TdZe8ShEs9yX0T0O0AgKY0W6RjwZ9GYZQNa','admin','active','2026-09-04 20:02:38','2026-07-31 19:00:00','2026-09-04 15:02:38'),(2,'client','Client Officer','clients@financeportal.com','$2y$10$XD/xFa5mDi9vnHV2n.TdZe8ShEs9yX0T0O0AgKY0W6RjwZ9GYZQNa','client_user','active','2026-09-04 23:55:59','2026-07-31 19:00:00','2026-09-04 18:55:59'),(3,'report','Finance Analyst','reports@financeportal.com','$2y$10$XD/xFa5mDi9vnHV2n.TdZe8ShEs9yX0T0O0AgKY0W6RjwZ9GYZQNa','report_user','active','2026-09-04 23:55:53','2026-07-31 19:00:00','2026-09-04 18:55:53'),(4,'commission','Commission Officer','commission@financeportal.com','$2y$10$XD/xFa5mDi9vnHV2n.TdZe8ShEs9yX0T0O0AgKY0W6RjwZ9GYZQNa','commission_user','active',NULL,'2026-09-04 19:17:29','2026-09-04 19:17:29');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_report_records`
--

DROP TABLE IF EXISTS `weekly_report_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weekly_report_records` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `report_id` int(10) unsigned NOT NULL,
  `client_id` int(10) unsigned DEFAULT NULL,
  `initial_payment_date` date NOT NULL,
  `receiving_payment_date` date NOT NULL,
  `payment_type` enum('Approval Payment','Residual Payment') NOT NULL,
  `is_received` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_report_client_payment` (`report_id`,`client_id`,`payment_type`),
  KEY `fk_record_client` (`client_id`),
  KEY `idx_record_report_id` (`report_id`),
  KEY `idx_record_type` (`payment_type`),
  KEY `idx_record_pay_date` (`initial_payment_date`),
  KEY `idx_record_recv_date` (`receiving_payment_date`),
  CONSTRAINT `fk_record_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_record_weekly_report` FOREIGN KEY (`report_id`) REFERENCES `weekly_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_report_records`
--

LOCK TABLES `weekly_report_records` WRITE;
/*!40000 ALTER TABLE `weekly_report_records` DISABLE KEYS */;
INSERT INTO `weekly_report_records` VALUES (74,42,49,'2026-08-24','2026-08-24','Approval Payment',0,'2026-09-04 15:10:20','2026-09-04 18:16:22'),(75,42,51,'2026-08-26','2026-08-26','Approval Payment',0,'2026-09-04 15:10:20','2026-09-04 18:16:21'),(76,42,57,'2026-07-27','2026-08-27','Residual Payment',0,'2026-09-04 15:10:20','2026-09-04 17:23:13'),(77,42,52,'2026-08-28','2026-08-28','Approval Payment',0,'2026-09-04 15:10:20','2026-09-04 18:16:20'),(78,42,54,'2026-07-29','2026-08-29','Residual Payment',1,'2026-09-04 15:10:20','2026-09-04 18:37:31'),(79,41,45,'2026-08-17','2026-08-17','Approval Payment',0,'2026-09-04 15:10:34','2026-09-04 18:16:24'),(80,41,47,'2026-08-19','2026-08-19','Approval Payment',0,'2026-09-04 15:10:34','2026-09-04 18:16:24'),(81,41,48,'2026-08-21','2026-08-21','Approval Payment',0,'2026-09-04 15:10:34','2026-09-04 18:16:25'),(82,40,41,'2026-08-10','2026-08-10','Approval Payment',0,'2026-09-04 15:10:35','2026-09-04 18:16:26'),(83,40,43,'2026-08-12','2026-08-12','Approval Payment',0,'2026-09-04 15:10:35','2026-09-04 18:16:27'),(84,39,37,'2026-08-03','2026-08-03','Approval Payment',0,'2026-09-04 15:10:36','2026-09-04 18:16:28'),(85,39,39,'2026-08-05','2026-08-05','Approval Payment',0,'2026-09-04 15:10:36','2026-09-04 18:16:29'),(86,39,40,'2026-08-07','2026-08-07','Approval Payment',0,'2026-09-04 15:10:36','2026-09-04 18:16:29'),(87,38,57,'2026-07-27','2026-07-27','Approval Payment',0,'2026-09-04 15:10:37','2026-09-04 18:16:31'),(88,38,54,'2026-07-29','2026-07-29','Approval Payment',1,'2026-09-04 15:10:37','2026-09-04 18:37:12');
/*!40000 ALTER TABLE `weekly_report_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weekly_reports`
--

DROP TABLE IF EXISTS `weekly_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weekly_reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_receiving_target` decimal(12,2) DEFAULT NULL,
  `total_received_entered` decimal(12,2) DEFAULT NULL,
  `total_remaining_balance` decimal(12,2) DEFAULT NULL,
  `status` enum('active','closed','completed') DEFAULT 'active',
  `updated_by` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_week_date_range` (`start_date`,`end_date`),
  KEY `fk_weekly_report_user` (`updated_by`),
  KEY `idx_weekly_dates` (`start_date`,`end_date`),
  CONSTRAINT `fk_weekly_report_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_reports`
--

LOCK TABLES `weekly_reports` WRITE;
/*!40000 ALTER TABLE `weekly_reports` DISABLE KEYS */;
INSERT INTO `weekly_reports` VALUES (38,'Week 1: Jul 27 - Aug 02, 2026','2026-07-27','2026-08-02',1900.00,1000.00,900.00,'active',NULL,'2026-09-04 00:22:45','2026-09-04 18:37:12'),(39,'Week 1: Aug 03 - Aug 09, 2026','2026-08-03','2026-08-09',2900.00,0.00,2900.00,'active',NULL,'2026-09-04 00:22:45','2026-09-04 18:16:29'),(40,'Week 2: Aug 10 - Aug 16, 2026','2026-08-10','2026-08-16',2000.00,0.00,2000.00,'active',NULL,'2026-09-04 00:22:45','2026-09-04 18:16:27'),(41,'Week 3: Aug 17 - Aug 23, 2026','2026-08-17','2026-08-23',2900.00,0.00,2900.00,'active',NULL,'2026-09-04 00:22:45','2026-09-04 18:16:25'),(42,'Week 4: Aug 24 - Aug 30, 2026','2026-08-24','2026-08-30',2995.00,50.00,2945.00,'active',NULL,'2026-09-04 00:22:45','2026-09-04 18:37:31');
/*!40000 ALTER TABLE `weekly_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'finance_crm'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-05  0:17:40
