-- ============================================================================
-- FINANCIAL ADVISOR & CLIENT MANAGEMENT CRM - COMPLETE DATABASE SCHEMA
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (XAMPP / phpMyAdmin)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `finance_crm` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `finance_crm`;

-- Disable Foreign Key checks temporarily for clean setup
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. TABLE: `users` (System Users / Authentication)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'manager', 'agent') DEFAULT 'agent',
    `avatar` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `last_login_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABLE: `agents` (Smart Agents, Super Agents, Closers Registry)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `agents`;
CREATE TABLE `agents` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `role_type` ENUM('smart', 'super', 'closer') NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_agent_role` (`name`, `role_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABLE: `connectors` (Leads Connectors Registry)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `connectors`;
CREATE TABLE `connectors` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `contact_phone` VARCHAR(30) DEFAULT NULL,
    `contact_email` VARCHAR(120) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TABLE: `approval_rules` (Configurable Slabs for Approval & 5% Residual)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `approval_rules`;
CREATE TABLE `approval_rules` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `min_payment` DECIMAL(10, 2) NOT NULL,
    `max_payment` DECIMAL(10, 2) NOT NULL,
    `approval_amount` DECIMAL(10, 2) NOT NULL,
    `residual_percentage` DECIMAL(5, 2) DEFAULT 5.00,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABLE: `clients` (Main Client Directory & Financial Records)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `application_date` DATE NOT NULL,
    `client_name` VARCHAR(150) NOT NULL,
    `connector` VARCHAR(100) DEFAULT NULL,
    `smart_agent` VARCHAR(100) DEFAULT NULL,
    `super_agent` VARCHAR(100) DEFAULT NULL,
    `closer` VARCHAR(100) DEFAULT NULL,
    `status` ENUM('Submit', 'Charged', 'Kick Back') NOT NULL DEFAULT 'Submit',
    `plan_months` SMALLINT UNSIGNED NOT NULL DEFAULT 12,
    `monthly_payment` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `initial_payment` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `initial_payment_date` DATE DEFAULT NULL,
    `approval_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `residual_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `receiving_status` ENUM('Pending', 'Received') NOT NULL DEFAULT 'Pending',
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_client_name` (`client_name`),
    INDEX `idx_app_date` (`application_date`),
    INDEX `idx_initial_pay_date` (`initial_payment_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_receiving` (`receiving_status`),
    INDEX `idx_agents` (`smart_agent`, `super_agent`, `closer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TABLE: `client_ledger` (Installment & Residual Schedule Ledger)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `client_ledger`;
CREATE TABLE `client_ledger` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `client_id` BIGINT UNSIGNED NOT NULL,
    `installment_number` SMALLINT UNSIGNED NOT NULL,
    `due_date` DATE NOT NULL,
    `monthly_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `residual_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('Pending', 'Received') NOT NULL DEFAULT 'Pending',
    `paid_date` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_ledger_client` FOREIGN KEY (`client_id`) 
        REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_client_due` (`client_id`, `due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================================
-- SEED DATA INSERTIONS (Initial System Defaults & Sample Client Records)
-- ============================================================================

-- 1. Insert System Users
INSERT INTO `users` (`full_name`, `email`, `password_hash`, `role`) VALUES
('Admin Lead', 'admin@financecrm.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 2. Insert Default Configurable Approval Slabs
INSERT INTO `approval_rules` (`min_payment`, `max_payment`, `approval_amount`, `residual_percentage`, `description`) VALUES
(0.00, 99.99, 500.00, 5.00, 'Up to $99.99 → $500 Approval ($25 Residual)'),
(100.00, 249.99, 700.00, 5.00, '$100 to $249.99 → $700 Approval ($35 Residual)'),
(250.00, 400.00, 900.00, 5.00, '$250 to $400 → $900 Approval ($45 Residual)'),
(400.01, 500.00, 1000.00, 5.00, '$400.01 to $500 → $1,000 Approval ($50 Residual)'),
(500.01, 100000.00, 1100.00, 5.00, '$500.01+ → $1,100 Approval ($55 Residual)');

-- 3. Insert Default Agents
INSERT INTO `agents` (`name`, `role_type`) VALUES
('Hamza Khan', 'smart'),
('Ahad', 'smart'),
('Ali', 'smart'),
('Usman', 'smart'),
('Zia Uddin', 'super'),
('KK', 'super'),
('Ali', 'super'),
('Usman', 'super'),
('shahab', 'closer'),
('Yasir', 'closer'),
('Ahmed', 'closer'),
('Ali', 'closer');

-- 4. Insert Default Connectors
INSERT INTO `connectors` (`name`) VALUES
('Zabloon Shamaun'),
('David Wilson'),
('Sarah Connor'),
('Michael Scott'),
('Jessica Taylor'),
('Alex Turner'),
('Rachel Green'),
('Thomas Shelby'),
('Donna Paulsen'),
('Harvey Specter'),
('Mike Ross'),
('Louis Litt');

-- 5. Insert 12 Standard CRM Client Records
INSERT INTO `clients` (
    `id`, `application_date`, `client_name`, `connector`, `smart_agent`, `super_agent`, `closer`, 
    `status`, `plan_months`, `monthly_payment`, `initial_payment`, `initial_payment_date`, 
    `approval_amount`, `residual_amount`, `receiving_status`
) VALUES
(1, '2026-08-13', 'LAVERNON EDWARDS', 'Zabloon Shamaun', 'Hamza Khan', 'Zia Uddin', 'shahab', 'Submit', 24, 359.49, 359.49, '2026-08-31', 900.00, 45.00, 'Pending'),
(2, '2026-08-14', 'MARLENE DICKERSON', 'David Wilson', 'Ahad', 'KK', 'Yasir', 'Charged', 36, 420.00, 420.00, '2026-08-31', 1000.00, 50.00, 'Received'),
(3, '2026-08-15', 'WOLNEY JACKSON', 'Sarah Connor', 'Ali', 'Usman', 'Ahmed', 'Submit', 12, 180.50, 180.50, '2026-08-31', 700.00, 35.00, 'Received'),
(4, '2026-08-16', 'ROBERT CHEN', 'Michael Scott', 'Hamza Khan', 'KK', 'shahab', 'Charged', 48, 550.00, 550.00, '2026-08-31', 1100.00, 55.00, 'Received'),
(5, '2026-08-17', 'EMILY DAVIS', 'Jessica Taylor', 'Usman', 'Zia Uddin', 'Yasir', 'Submit', 18, 275.00, 275.00, '2026-08-31', 900.00, 45.00, 'Pending'),
(6, '2026-08-18', 'DANIEL MARTINEZ', 'Alex Turner', 'Ahad', 'Usman', 'Ahmed', 'Charged', 60, 650.00, 650.00, '2026-08-31', 1100.00, 55.00, 'Received'),
(7, '2026-08-19', 'SOPHIA RODRIGUEZ', 'Rachel Green', 'Ali', 'KK', 'shahab', 'Charged', 12, 95.00, 95.00, '2026-08-31', 500.00, 25.00, 'Pending'),
(8, '2026-08-20', 'JAMES ANDERSON', 'Thomas Shelby', 'Hamza Khan', 'Zia Uddin', 'Yasir', 'Charged', 24, 320.00, 320.00, '2026-08-31', 900.00, 45.00, 'Received'),
(9, '2026-08-21', 'OLIVIA THOMAS', 'Donna Paulsen', 'Usman', 'Ali', 'Ahmed', 'Kick Back', 36, 210.00, 210.00, '2026-08-31', 700.00, 35.00, 'Pending'),
(10, '2026-08-22', 'WILLIAM WHITE', 'Harvey Specter', 'Ahad', 'Zia Uddin', 'shahab', 'Charged', 12, 480.00, 480.00, '2026-08-31', 1000.00, 50.00, 'Received'),
(11, '2026-08-23', 'AVA HERNANDEZ', 'Mike Ross', 'Ali', 'KK', 'Yasir', 'Submit', 24, 150.00, 150.00, '2026-08-31', 700.00, 35.00, 'Pending'),
(12, '2026-08-24', 'ETHAN MOORE', 'Louis Litt', 'Hamza Khan', 'Usman', 'Ahmed', 'Charged', 48, 1200.00, 1200.00, '2026-08-31', 1100.00, 55.00, 'Received');

-- 6. Insert Sample 4-Month Ledger Schedules for Client 1 (LAVERNON EDWARDS)
INSERT INTO `client_ledger` (`client_id`, `installment_number`, `due_date`, `monthly_amount`, `residual_amount`, `status`) VALUES
(1, 1, '2026-08-31', 359.49, 45.00, 'Pending'),
(1, 2, '2026-09-30', 359.49, 45.00, 'Pending'),
(1, 3, '2026-10-31', 359.49, 45.00, 'Pending'),
(1, 4, '2026-11-30', 359.49, 45.00, 'Pending');


-- ============================================================================
-- SQL VIEWS FOR HIGH-PERFORMANCE ANALYTICS
-- ============================================================================

-- View 1: Dashboard Top Hero Metrics
CREATE OR REPLACE VIEW `v_dashboard_metrics` AS
SELECT 
    COUNT(*) AS total_clients,
    SUM(CASE WHEN `status` = 'Submit' THEN `approval_amount` ELSE 0 END) AS total_submit_amount,
    COUNT(CASE WHEN `status` = 'Submit' THEN 1 END) AS submit_count,
    SUM(`approval_amount`) AS total_approval_amount,
    SUM(`monthly_payment`) AS total_monthly_turnover,
    SUM(`residual_amount`) AS total_residual_projected,
    SUM(CASE WHEN `receiving_status` = 'Received' THEN `approval_amount` ELSE 0 END) AS total_received_amount,
    COUNT(CASE WHEN `receiving_status` = 'Received' THEN 1 END) AS received_count,
    SUM(CASE WHEN `receiving_status` = 'Pending' THEN `approval_amount` ELSE 0 END) AS total_pending_amount,
    COUNT(CASE WHEN `receiving_status` = 'Pending' THEN 1 END) AS pending_count
FROM `clients`;

-- View 2: Connectors Leaderboard
CREATE OR REPLACE VIEW `v_connector_leaderboard` AS
SELECT 
    `connector` AS `connector_name`,
    COUNT(*) AS `total_leads`,
    SUM(`approval_amount`) AS `total_volume`
FROM `clients`
WHERE `connector` IS NOT NULL AND `connector` != ''
GROUP BY `connector`
ORDER BY `total_leads` DESC, `total_volume` DESC;

-- View 3: Smart Agents Performance Ranking
CREATE OR REPLACE VIEW `v_smart_agent_ranking` AS
SELECT 
    `smart_agent` AS `agent_name`,
    COUNT(*) AS `total_assigned`,
    COUNT(CASE WHEN `status` = 'Submit' THEN 1 END) AS `submit_count`,
    SUM(CASE WHEN `status` = 'Submit' THEN `approval_amount` ELSE 0 END) AS `submit_volume`
FROM `clients`
WHERE `smart_agent` IS NOT NULL AND `smart_agent` != ''
GROUP BY `smart_agent`
ORDER BY `submit_volume` DESC, `submit_count` DESC;

-- View 4: Super Agents Performance Ranking
CREATE OR REPLACE VIEW `v_super_agent_ranking` AS
SELECT 
    `super_agent` AS `agent_name`,
    COUNT(*) AS `total_assigned`,
    COUNT(CASE WHEN `status` = 'Submit' THEN 1 END) AS `submit_count`,
    SUM(CASE WHEN `status` = 'Submit' THEN `approval_amount` ELSE 0 END) AS `submit_volume`
FROM `clients`
WHERE `super_agent` IS NOT NULL AND `super_agent` != ''
GROUP BY `super_agent`
ORDER BY `submit_volume` DESC, `submit_count` DESC;

-- View 5: Closers Performance Ranking
CREATE OR REPLACE VIEW `v_closer_ranking` AS
SELECT 
    `closer` AS `agent_name`,
    COUNT(*) AS `total_assigned`,
    COUNT(CASE WHEN `status` = 'Submit' THEN 1 END) AS `submit_count`,
    SUM(CASE WHEN `status` = 'Submit' THEN `approval_amount` ELSE 0 END) AS `submit_volume`
FROM `clients`
WHERE `closer` IS NOT NULL AND `closer` != ''
GROUP BY `closer`
ORDER BY `submit_volume` DESC, `submit_count` DESC;

-- View 6: Daily Scheduled Initial Payments Report
CREATE OR REPLACE VIEW `v_initial_payments_report` AS
SELECT 
    `id` AS `client_id`,
    `initial_payment_date`,
    `client_name`,
    `connector`,
    `smart_agent`,
    `super_agent`,
    `closer`,
    `plan_months`,
    `approval_amount`,
    `initial_payment`,
    `receiving_status`
FROM `clients`
ORDER BY `initial_payment_date` DESC, `id` DESC;
