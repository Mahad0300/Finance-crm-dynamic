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
INSERT INTO `agents` VALUES (1,'Hamza Khan','smart',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(2,'Usama Ali','smart',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(3,'Bilal Ahmed','smart',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(4,'Daniyal Tariq','smart',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(5,'Farhan Sheikh','smart',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(6,'Kashif Mehmood','smart',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(7,'Zia Uddin','super',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(8,'Kamran Akmal','super',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(9,'Rashid Minhas','super',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(10,'Tariq Jamil','super',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(11,'Asif Ali','super',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(12,'shahab','closer',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(13,'imran','closer',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(14,'fahad','closer',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(15,'salman','closer',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(16,'adnan','closer',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(17,'waqas','closer',1,'2026-09-01 21:14:52','2026-09-01 21:14:52');
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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'2026-06-01','RAYMOND CHANDLER',1,'Zabloon Shamaun',1,'Hamza Khan',7,'Zia Uddin',12,'shahab','Charged',24,320.00,350.00,'2026-06-01',45.00,900.00,'Received',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(2,'2026-06-01','BEATRICE HOLLOWAY',2,'Arthur Pendelton',2,'Usama Ali',8,'Kamran Akmal',13,'imran','Submit',36,210.00,450.00,'2026-06-02',50.00,1000.00,'Received',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(3,'2026-06-02','WARREN BUFFETT',3,'Marcus Aurelius',3,'Bilal Ahmed',9,'Rashid Minhas',14,'fahad','Charged',12,480.00,600.00,'2026-06-03',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(4,'2026-06-03','ELEANOR ROOSEVELT',4,'David Beckham',4,'Daniyal Tariq',10,'Tariq Jamil',15,'salman','Charged',24,290.00,280.00,'2026-06-04',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(5,'2026-06-08','GREGORY PECK',5,'Sarah Connor',5,'Farhan Sheikh',11,'Asif Ali',16,'adnan','Charged',48,180.00,320.00,'2026-06-08',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(6,'2026-06-08','MARGARET THATCHER',6,'Jonathan Vance',6,'Kashif Mehmood',7,'Zia Uddin',17,'waqas','Submit',24,350.00,490.00,'2026-06-09',50.00,1000.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(7,'2026-06-09','VICTOR HUGO',1,'Zabloon Shamaun',1,'Hamza Khan',8,'Kamran Akmal',12,'shahab','Charged',36,240.00,550.00,'2026-06-10',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(8,'2026-06-11','CLARA BARTON',2,'Arthur Pendelton',2,'Usama Ali',9,'Rashid Minhas',13,'imran','Kick Back',12,400.00,260.00,'2026-06-12',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(9,'2026-06-15','ARTHUR CONAN DOYLE',3,'Marcus Aurelius',3,'Bilal Ahmed',10,'Tariq Jamil',14,'fahad','Charged',24,310.00,390.00,'2026-06-15',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(10,'2026-06-15','FLORENCE NIGHTINGALE',4,'David Beckham',4,'Daniyal Tariq',11,'Asif Ali',15,'salman','Charged',60,150.00,420.00,'2026-06-16',50.00,1000.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(11,'2026-06-16','CHARLES DICKENS',5,'Sarah Connor',5,'Farhan Sheikh',7,'Zia Uddin',16,'adnan','Submit',36,220.00,750.00,'2026-06-17',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(12,'2026-06-18','EMILY BRONTE',6,'Jonathan Vance',6,'Kashif Mehmood',8,'Kamran Akmal',17,'waqas','Charged',12,510.00,300.00,'2026-06-19',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(13,'2026-06-22','LEO TOLSTOY',7,'Lucas Scott',1,'Hamza Khan',9,'Rashid Minhas',12,'shahab','Charged',24,340.00,360.00,'2026-06-22',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(14,'2026-06-23','JANE AUSTEN',1,'Zabloon Shamaun',2,'Usama Ali',10,'Tariq Jamil',13,'imran','Submit',36,260.00,480.00,'2026-06-24',50.00,1000.00,'Received',1,'2026-09-01 21:14:53','2026-09-02 15:32:59'),(15,'2026-06-24','FYODOR DOSTOEVSKY',2,'Arthur Pendelton',3,'Bilal Ahmed',11,'Asif Ali',14,'fahad','Charged',48,190.00,620.00,'2026-06-25',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-02 17:46:27'),(16,'2026-06-25','CHARLOTTE BRONTE',3,'Marcus Aurelius',4,'Daniyal Tariq',7,'Zia Uddin',15,'salman','Charged',12,470.00,270.00,'2026-06-26',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-02 17:46:31'),(17,'2026-06-29','MARK TWAIN',4,'David Beckham',5,'Farhan Sheikh',8,'Kamran Akmal',16,'adnan','Charged',24,330.00,310.00,'2026-06-29',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-02 17:46:34'),(18,'2026-06-30','VIRGINIA WOOLF',5,'Sarah Connor',6,'Kashif Mehmood',9,'Rashid Minhas',17,'waqas','Submit',36,250.00,460.00,'2026-07-01',50.00,1000.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(19,'2026-07-01','OSCAR WILDE',6,'Jonathan Vance',1,'Hamza Khan',10,'Tariq Jamil',12,'shahab','Charged',12,530.00,580.00,'2026-07-02',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(20,'2026-07-02','MARY SHELLEY',7,'Lucas Scott',2,'Usama Ali',11,'Asif Ali',13,'imran','Kick Back',24,280.00,290.00,'2026-07-03',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(21,'2026-07-06','ALEXANDER DUMAS',1,'Zabloon Shamaun',3,'Bilal Ahmed',7,'Zia Uddin',14,'fahad','Charged',24,360.00,340.00,'2026-07-06',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(22,'2026-07-07','GEORGE ORWELL',2,'Arthur Pendelton',4,'Daniyal Tariq',8,'Kamran Akmal',15,'salman','Submit',36,270.00,440.00,'2026-07-07',50.00,1000.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(23,'2026-07-08','AGATHA CHRISTIE',3,'Marcus Aurelius',5,'Farhan Sheikh',9,'Rashid Minhas',16,'adnan','Charged',12,490.00,520.00,'2026-07-08',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(24,'2026-07-09','ERNEST HEMINGWAY',4,'David Beckham',6,'Kashif Mehmood',10,'Tariq Jamil',17,'waqas','Charged',48,175.00,300.00,'2026-07-10',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(25,'2026-07-13','F. SCOTT FITZGERALD',5,'Sarah Connor',1,'Hamza Khan',11,'Asif Ali',12,'shahab','Charged',24,310.00,380.00,'2026-07-13',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(26,'2026-07-14','SYLVIA PLATH',6,'Jonathan Vance',2,'Usama Ali',7,'Zia Uddin',13,'imran','Submit',36,230.00,450.00,'2026-07-14',50.00,1000.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(27,'2026-07-15','HERMAN MELVILLE',7,'Lucas Scott',3,'Bilal Ahmed',8,'Kamran Akmal',14,'fahad','Charged',12,460.00,650.00,'2026-07-15',55.00,1100.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(28,'2026-07-16','MAYA ANGELOU',1,'Zabloon Shamaun',4,'Daniyal Tariq',9,'Rashid Minhas',15,'salman','Charged',24,300.00,270.00,'2026-07-17',45.00,900.00,'Received',1,'2026-09-01 21:14:53','2026-09-01 21:14:53'),(29,'2026-07-20','EDGAR ALLAN POE',2,'Arthur Pendelton',5,'Farhan Sheikh',10,'Tariq Jamil',16,'adnan','Charged',36,240.00,330.00,'2026-07-20',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(30,'2026-07-21','TONI MORRISON',3,'Marcus Aurelius',6,'Kashif Mehmood',11,'Asif Ali',17,'waqas','Submit',24,350.00,470.00,'2026-07-21',50.00,1000.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(31,'2026-07-22','JAMES JOYCE',4,'David Beckham',1,'Hamza Khan',7,'Zia Uddin',12,'shahab','Charged',12,500.00,700.00,'2026-07-23',55.00,1100.00,'Received',1,'2026-09-01 21:14:54','2026-09-02 15:32:58'),(32,'2026-07-23','HARPER LEE',5,'Sarah Connor',2,'Usama Ali',8,'Kamran Akmal',13,'imran','Charged',60,160.00,350.00,'2026-07-24',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-02 17:46:24'),(33,'2026-07-27','GABRIEL GARCIA MARQUEZ',6,'Jonathan Vance',3,'Bilal Ahmed',9,'Rashid Minhas',14,'fahad','Charged',24,325.00,370.00,'2026-07-27',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-02 17:46:32'),(34,'2026-07-28','ISABEL ALLENDE',7,'Lucas Scott',4,'Daniyal Tariq',10,'Tariq Jamil',15,'salman','Submit',36,220.00,430.00,'2026-07-28',50.00,1000.00,'Received',1,'2026-09-01 21:14:54','2026-09-02 15:33:01'),(35,'2026-07-29','JULES VERNE',1,'Zabloon Shamaun',5,'Farhan Sheikh',11,'Asif Ali',16,'adnan','Charged',12,440.00,560.00,'2026-07-29',55.00,1100.00,'Received',1,'2026-09-01 21:14:54','2026-09-02 17:46:33'),(36,'2026-07-30','LOUISA MAY ALCOTT',2,'Arthur Pendelton',6,'Kashif Mehmood',7,'Zia Uddin',17,'waqas','Charged',48,185.00,290.00,'2026-07-31',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(37,'2026-08-03','FRANZ KAFKA',3,'Marcus Aurelius',1,'Hamza Khan',8,'Kamran Akmal',12,'shahab','Charged',24,315.00,350.00,'2026-08-03',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(38,'2026-08-04','ALICE WALKER',4,'David Beckham',2,'Usama Ali',9,'Rashid Minhas',13,'imran','Submit',36,260.00,480.00,'2026-08-04',50.00,1000.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(39,'2026-08-05','HOMER ILIAD',5,'Sarah Connor',3,'Bilal Ahmed',10,'Tariq Jamil',14,'fahad','Charged',12,520.00,600.00,'2026-08-05',55.00,1100.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(40,'2026-08-06','SIMONE DE BEAUVOIR',6,'Jonathan Vance',4,'Daniyal Tariq',11,'Asif Ali',15,'salman','Charged',24,295.00,260.00,'2026-08-07',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(41,'2026-08-10','DANTE ALIGHIERI',7,'Lucas Scott',5,'Farhan Sheikh',7,'Zia Uddin',16,'adnan','Charged',36,235.00,390.00,'2026-08-10',45.00,900.00,'Received',1,'2026-09-01 21:14:54','2026-09-01 21:14:54'),(42,'2026-08-11','GEORGE ELIOT',1,'Zabloon Shamaun',6,'Kashif Mehmood',8,'Kamran Akmal',17,'waqas','Submit',24,345.00,450.00,'2026-08-11',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(43,'2026-08-12','JOHN MILTON',2,'Arthur Pendelton',1,'Hamza Khan',9,'Rashid Minhas',12,'shahab','Charged',12,475.00,530.00,'2026-08-12',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(44,'2026-08-13','ZORA NEALE HURSTON',3,'Marcus Aurelius',2,'Usama Ali',10,'Tariq Jamil',13,'imran','Kick Back',48,170.00,310.00,'2026-08-14',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(45,'2026-08-17','WILLIAM SHAKESPEARE',4,'David Beckham',3,'Bilal Ahmed',11,'Asif Ali',14,'fahad','Charged',24,380.00,340.00,'2026-08-17',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(46,'2026-08-18','CHIMAMANDA NGOZI',5,'Sarah Connor',4,'Daniyal Tariq',7,'Zia Uddin',15,'salman','Submit',36,250.00,420.00,'2026-08-18',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(47,'2026-08-19','GEOFFREY CHAUCER',6,'Jonathan Vance',5,'Farhan Sheikh',8,'Kamran Akmal',16,'adnan','Charged',12,490.00,680.00,'2026-08-19',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(48,'2026-08-20','EDITH WHARTON',7,'Lucas Scott',6,'Kashif Mehmood',9,'Rashid Minhas',17,'waqas','Charged',60,155.00,300.00,'2026-08-21',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(49,'2026-08-24','HERMAN HESSE',1,'Zabloon Shamaun',1,'Hamza Khan',10,'Tariq Jamil',12,'shahab','Charged',24,335.00,360.00,'2026-08-24',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-02 17:46:26'),(50,'2026-08-25','OCTAVIA BUTLER',2,'Arthur Pendelton',2,'Usama Ali',11,'Asif Ali',13,'imran','Submit',36,245.00,470.00,'2026-08-25',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-02 15:32:59'),(51,'2026-08-26','THOMAS MANN',3,'Marcus Aurelius',3,'Bilal Ahmed',7,'Zia Uddin',14,'fahad','Charged',12,510.00,550.00,'2026-08-26',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-02 17:46:32'),(52,'2026-08-27','URSULA LE GUIN',4,'David Beckham',4,'Daniyal Tariq',8,'Kamran Akmal',15,'salman','Charged',48,180.00,280.00,'2026-08-28',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-02 17:46:33'),(53,'2026-08-31','MARCEL PROUST',5,'Sarah Connor',5,'Farhan Sheikh',9,'Rashid Minhas',16,'adnan','Charged',24,350.00,380.00,'2026-08-31',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(54,'2026-09-01','DORIS LESSING',6,'Jonathan Vance',6,'Kashif Mehmood',10,'Tariq Jamil',17,'waqas','Submit',36,260.00,460.00,'2026-09-01',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(55,'2026-09-02','ALBERT CAMUS',7,'Lucas Scott',1,'Hamza Khan',11,'Asif Ali',12,'shahab','Charged',12,480.00,620.00,'2026-09-02',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(56,'2026-09-03','NADINE GORDIMER',1,'Zabloon Shamaun',2,'Usama Ali',7,'Zia Uddin',13,'imran','Charged',24,310.00,290.00,'2026-09-04',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(57,'2026-09-07','JEAN-PAUL SARTRE',2,'Arthur Pendelton',3,'Bilal Ahmed',8,'Kamran Akmal',14,'fahad','Charged',24,320.00,350.00,'2026-09-07',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(58,'2026-09-08','ALICE MUNRO',3,'Marcus Aurelius',4,'Daniyal Tariq',9,'Rashid Minhas',15,'salman','Submit',36,230.00,440.00,'2026-09-08',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(59,'2026-09-09','KAZUO ISHIGURO',4,'David Beckham',5,'Farhan Sheikh',10,'Tariq Jamil',16,'adnan','Charged',12,500.00,590.00,'2026-09-09',55.00,1100.00,'Pending',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(60,'2026-09-10','OLGA TOKARCZUK',5,'Sarah Connor',6,'Kashif Mehmood',11,'Asif Ali',17,'waqas','Charged',48,190.00,310.00,'2026-09-11',45.00,900.00,'Pending',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(61,'2026-09-01','LAVERNON EDWARDS',1,'Zabloon Shamaun',1,'Hamza Khan',7,'Zia Uddin',12,'shahab','Submit',24,359.49,359.49,'2026-09-15',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(62,'2026-09-01','SHAYAN KHAN',2,'Arthur Pendelton',2,'Usama Ali',8,'Kamran Akmal',13,'imran','Charged',36,180.50,280.00,'2026-09-15',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(63,'2026-09-01','TEST',6,'Jonathan Vance',6,'Kashif Mehmood',10,'Tariq Jamil',17,'waqas','Submit',13,120.00,510.00,'2026-09-15',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(64,'2026-09-01','AHMED BILAL',3,'Marcus Aurelius',3,'Bilal Ahmed',9,'Rashid Minhas',14,'fahad','Submit',12,420.00,420.00,'2026-09-16',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(65,'2026-09-01','ZOHAIB TARIQ',1,'Zabloon Shamaun',4,'Daniyal Tariq',7,'Zia Uddin',12,'shahab','Charged',24,550.00,550.00,'2026-09-16',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(66,'2026-09-02','MICHAEL CORLEONE',4,'David Beckham',1,'Hamza Khan',10,'Tariq Jamil',15,'salman','Submit',48,85.00,250.00,'2026-09-17',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(67,'2026-09-02','SARAH JANE',2,'Arthur Pendelton',5,'Farhan Sheikh',8,'Kamran Akmal',13,'imran','Charged',24,310.00,310.00,'2026-09-17',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(68,'2026-09-03','ROBERT LEWANDOWSKI',3,'Marcus Aurelius',2,'Usama Ali',9,'Rashid Minhas',14,'fahad','Submit',36,220.00,320.00,'2026-09-18',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(69,'2026-09-03','EMILY WATSON',1,'Zabloon Shamaun',3,'Bilal Ahmed',7,'Zia Uddin',12,'shahab','Charged',12,480.00,480.00,'2026-09-18',50.00,1000.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(70,'2026-09-04','DAVID MILLER',4,'David Beckham',4,'Daniyal Tariq',10,'Tariq Jamil',15,'salman','Kick Back',24,150.00,350.00,'2026-09-18',45.00,900.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55'),(71,'2026-09-04','JESSICA ALBA',5,'Sarah Connor',1,'Hamza Khan',8,'Kamran Akmal',13,'imran','Charged',60,600.00,600.00,'2026-09-18',55.00,1100.00,'Received',1,'2026-09-01 21:14:55','2026-09-01 21:14:55');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `connectors`
--

LOCK TABLES `connectors` WRITE;
/*!40000 ALTER TABLE `connectors` DISABLE KEYS */;
INSERT INTO `connectors` VALUES (1,'Zabloon Shamaun',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(2,'Arthur Pendelton',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(3,'Marcus Aurelius',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(4,'David Beckham',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(5,'Sarah Connor',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(6,'Jonathan Vance',1,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(7,'Lucas Scott',1,'2026-09-01 21:14:52','2026-09-01 21:14:52');
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
  `role` enum('admin','client_user','report_user') NOT NULL DEFAULT 'client_user',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','Admin Lead','admin@financeportal.com','$2y$10$XD/xFa5mDi9vnHV2n.TdZe8ShEs9yX0T0O0AgKY0W6RjwZ9GYZQNa','admin','active','2026-09-02 20:01:38','2026-09-01 21:14:52','2026-09-02 15:01:38'),(2,'client_user','Client Officer','clients@financeportal.com','$2y$10$07tbEgBjm5n1y5sUMINDveQByKAwbzqlr0QlTTCdv.SuxFonru/di','client_user','active',NULL,'2026-09-01 21:14:52','2026-09-01 21:14:52'),(3,'report_user','Finance Analyst','reports@financeportal.com','$2y$10$07tbEgBjm5n1y5sUMINDveQByKAwbzqlr0QlTTCdv.SuxFonru/di','report_user','active',NULL,'2026-09-01 21:14:52','2026-09-01 21:14:52');
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
  `client_name` varchar(150) NOT NULL,
  `plan` int(10) unsigned NOT NULL DEFAULT 12,
  `payment_type` enum('Approval Payment','Residual Payment') NOT NULL,
  `approval_payment` decimal(10,2) DEFAULT NULL,
  `residual_payment` decimal(10,2) DEFAULT NULL,
  `is_received` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_record_client` (`client_id`),
  KEY `idx_record_report_id` (`report_id`),
  KEY `idx_record_type` (`payment_type`),
  KEY `idx_record_pay_date` (`initial_payment_date`),
  CONSTRAINT `fk_record_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_record_weekly_report` FOREIGN KEY (`report_id`) REFERENCES `weekly_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_report_records`
--

LOCK TABLES `weekly_report_records` WRITE;
/*!40000 ALTER TABLE `weekly_report_records` DISABLE KEYS */;
INSERT INTO `weekly_report_records` VALUES (1,1,1,'2026-06-01','RAYMOND CHANDLER',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(2,1,3,'2026-06-03','WARREN BUFFETT',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(3,1,4,'2026-06-04','ELEANOR ROOSEVELT',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(4,2,5,'2026-06-08','GREGORY PECK',48,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(5,2,7,'2026-06-10','VICTOR HUGO',36,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(6,3,9,'2026-06-15','ARTHUR CONAN DOYLE',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(7,3,10,'2026-06-16','FLORENCE NIGHTINGALE',60,'Approval Payment',1000.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(8,3,12,'2026-06-19','EMILY BRONTE',12,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(9,4,13,'2026-06-22','LEO TOLSTOY',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(10,4,15,'2026-06-25','FYODOR DOSTOEVSKY',48,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(11,4,16,'2026-06-26','CHARLOTTE BRONTE',12,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(12,5,17,'2026-06-29','MARK TWAIN',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(13,5,1,'2026-07-01','RAYMOND CHANDLER',24,'',NULL,45.00,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(14,5,19,'2026-07-02','OSCAR WILDE',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(15,5,3,'2026-07-03','WARREN BUFFETT',12,'',NULL,55.00,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(16,5,4,'2026-07-04','ELEANOR ROOSEVELT',24,'',NULL,45.00,1,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(17,6,21,'2026-07-06','ALEXANDER DUMAS',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(18,6,23,'2026-07-08','AGATHA CHRISTIE',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(19,6,5,'2026-07-08','GREGORY PECK',48,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(20,6,24,'2026-07-10','ERNEST HEMINGWAY',48,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(21,6,7,'2026-07-10','VICTOR HUGO',36,'',NULL,55.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(22,7,25,'2026-07-13','F. SCOTT FITZGERALD',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(23,7,9,'2026-07-15','ARTHUR CONAN DOYLE',24,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(24,7,27,'2026-07-15','HERMAN MELVILLE',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(25,7,10,'2026-07-16','FLORENCE NIGHTINGALE',60,'',NULL,50.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(26,7,28,'2026-07-17','MAYA ANGELOU',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(27,7,12,'2026-07-19','EMILY BRONTE',12,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(28,8,29,'2026-07-20','EDGAR ALLAN POE',36,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(29,8,13,'2026-07-22','LEO TOLSTOY',24,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(30,8,31,'2026-07-23','JAMES JOYCE',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(31,8,32,'2026-07-24','HARPER LEE',60,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(32,8,15,'2026-07-25','FYODOR DOSTOEVSKY',48,'',NULL,55.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(33,8,16,'2026-07-26','CHARLOTTE BRONTE',12,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(34,9,33,'2026-07-27','GABRIEL GARCIA MARQUEZ',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(35,9,35,'2026-07-29','JULES VERNE',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(36,9,17,'2026-07-29','MARK TWAIN',24,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(37,9,36,'2026-07-31','LOUISA MAY ALCOTT',48,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(38,9,1,'2026-08-01','RAYMOND CHANDLER',24,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(39,9,19,'2026-08-02','OSCAR WILDE',12,'',NULL,55.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(40,10,37,'2026-08-03','FRANZ KAFKA',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(41,10,3,'2026-08-03','WARREN BUFFETT',12,'',NULL,55.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(42,10,4,'2026-08-04','ELEANOR ROOSEVELT',24,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(43,10,39,'2026-08-05','HOMER ILIAD',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(44,10,21,'2026-08-06','ALEXANDER DUMAS',24,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(45,10,40,'2026-08-07','SIMONE DE BEAUVOIR',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(46,10,23,'2026-08-08','AGATHA CHRISTIE',12,'',NULL,55.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(47,10,5,'2026-08-08','GREGORY PECK',48,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(48,11,41,'2026-08-10','DANTE ALIGHIERI',36,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(49,11,24,'2026-08-10','ERNEST HEMINGWAY',48,'',NULL,45.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(50,11,7,'2026-08-10','VICTOR HUGO',36,'',NULL,55.00,1,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(51,11,43,'2026-08-12','JOHN MILTON',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(52,11,25,'2026-08-13','F. SCOTT FITZGERALD',24,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(53,11,9,'2026-08-15','ARTHUR CONAN DOYLE',24,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(54,11,27,'2026-08-15','HERMAN MELVILLE',12,'',NULL,55.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(55,11,10,'2026-08-16','FLORENCE NIGHTINGALE',60,'',NULL,50.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(56,12,28,'2026-08-17','MAYA ANGELOU',24,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(57,12,45,'2026-08-17','WILLIAM SHAKESPEARE',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(58,12,12,'2026-08-19','EMILY BRONTE',12,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(59,12,47,'2026-08-19','GEOFFREY CHAUCER',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(60,12,29,'2026-08-20','EDGAR ALLAN POE',36,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(61,12,48,'2026-08-21','EDITH WHARTON',60,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(62,12,13,'2026-08-22','LEO TOLSTOY',24,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(63,12,31,'2026-08-23','JAMES JOYCE',12,'',NULL,55.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(64,13,32,'2026-08-24','HARPER LEE',60,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(65,13,49,'2026-08-24','HERMAN HESSE',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(66,13,15,'2026-08-25','FYODOR DOSTOEVSKY',48,'',NULL,55.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(67,13,16,'2026-08-26','CHARLOTTE BRONTE',12,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(68,13,51,'2026-08-26','THOMAS MANN',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(69,13,33,'2026-08-27','GABRIEL GARCIA MARQUEZ',24,'',NULL,45.00,1,'2026-09-02 17:55:46','2026-09-02 17:55:46'),(70,13,52,'2026-08-28','URSULA LE GUIN',48,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(71,13,35,'2026-08-29','JULES VERNE',12,'',NULL,55.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(72,13,17,'2026-08-29','MARK TWAIN',24,'',NULL,45.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(73,14,36,'2026-08-31','LOUISA MAY ALCOTT',48,'',NULL,45.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(74,14,53,'2026-08-31','MARCEL PROUST',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(75,14,1,'2026-09-01','RAYMOND CHANDLER',24,'',NULL,45.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(76,14,55,'2026-09-02','ALBERT CAMUS',12,'Approval Payment',1100.00,NULL,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(77,14,19,'2026-09-02','OSCAR WILDE',12,'',NULL,55.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(78,14,37,'2026-09-03','FRANZ KAFKA',24,'',NULL,45.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(79,14,3,'2026-09-03','WARREN BUFFETT',12,'',NULL,55.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(80,14,4,'2026-09-04','ELEANOR ROOSEVELT',24,'',NULL,45.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(81,14,56,'2026-09-04','NADINE GORDIMER',24,'Approval Payment',900.00,NULL,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(82,14,39,'2026-09-05','HOMER ILIAD',12,'',NULL,55.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47'),(83,14,21,'2026-09-06','ALEXANDER DUMAS',24,'',NULL,45.00,1,'2026-09-02 17:55:47','2026-09-02 17:55:47');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weekly_reports`
--

LOCK TABLES `weekly_reports` WRITE;
/*!40000 ALTER TABLE `weekly_reports` DISABLE KEYS */;
INSERT INTO `weekly_reports` VALUES (1,'Jun 01 - Jun 07, 2026','2026-06-01','2026-06-07',2900.00,2900.00,0.00,'active',NULL,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(2,'Jun 08 - Jun 14, 2026','2026-06-08','2026-06-14',2000.00,2000.00,0.00,'active',NULL,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(3,'Jun 15 - Jun 21, 2026','2026-06-15','2026-06-21',2800.00,2800.00,0.00,'active',NULL,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(4,'Jun 22 - Jun 28, 2026','2026-06-22','2026-06-28',2900.00,2900.00,0.00,'active',NULL,'2026-09-02 17:55:44','2026-09-02 17:55:44'),(5,'Jun 29 - Jul 05, 2026','2026-06-29','2026-07-05',2145.00,2145.00,0.00,'active',NULL,'2026-09-02 17:55:44','2026-09-02 17:55:45'),(6,'Jul 06 - Jul 12, 2026','2026-07-06','2026-07-12',3000.00,3000.00,0.00,'active',NULL,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(7,'Jul 13 - Jul 19, 2026','2026-07-13','2026-07-19',3040.00,3040.00,0.00,'active',NULL,'2026-09-02 17:55:45','2026-09-02 17:55:45'),(8,'Jul 20 - Jul 26, 2026','2026-07-20','2026-07-26',3045.00,3045.00,0.00,'active',NULL,'2026-09-02 17:55:45','2026-09-02 18:25:17'),(9,'Jul 27 - Aug 02, 2026','2026-07-27','2026-08-02',3045.00,2700.00,345.00,'active',NULL,'2026-09-02 17:55:45','2026-09-02 18:26:05'),(10,'Aug 03 - Aug 09, 2026','2026-08-03','2026-08-09',3490.00,2990.00,500.00,'active',NULL,'2026-09-02 17:55:45','2026-09-02 18:38:01'),(11,'Aug 10 - Aug 16, 2026','2026-08-10','2026-08-16',2795.00,NULL,NULL,'active',NULL,'2026-09-02 17:55:45','2026-09-02 19:33:36'),(12,'Aug 17 - Aug 23, 2026','2026-08-17','2026-08-23',5930.00,NULL,NULL,'active',NULL,'2026-09-02 17:55:46','2026-09-02 19:33:36'),(13,'Aug 24 - Aug 30, 2026','2026-08-24','2026-08-30',9120.00,NULL,NULL,'active',NULL,'2026-09-02 17:55:46','2026-09-02 19:33:36'),(14,'Aug 31 - Sep 06, 2026','2026-08-31','2026-09-06',3805.00,NULL,NULL,'active',NULL,'2026-09-02 17:55:47','2026-09-02 18:12:32');
/*!40000 ALTER TABLE `weekly_reports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-03  0:34:31
