<?php
namespace App\Models;

use App\Core\Model;

class Client extends Model {

    private static bool $indexesChecked = false;

    public function ensureIndexes(): void {
        if (self::$indexesChecked) return;
        self::$indexesChecked = true;
        try {
            $db = $this->getDb();
            $stmt = $db->query("SHOW INDEX FROM `clients` WHERE Key_name = 'idx_clients_status_date'");
            if ($stmt && empty($stmt->fetchAll())) {
                $db->exec("ALTER TABLE `clients` ADD INDEX `idx_clients_status_date` (`status`, `initial_payment_date`)");
            }
        } catch (\Throwable $e) {
            // Already exists or permission denied
        }
    }

    public function syncDueApprovalStatuses(?string $targetDate = null): void {
        if (!$this->isConnected()) return;
        try {
            $today = $targetDate ?: date('Y-m-d');
            // Deals whose initial payment date has arrived become Approval
            $this->query(
                "UPDATE `clients` 
                 SET `status` = 'Approval' 
                 WHERE `status` = 'Submit' 
                   AND `initial_payment_date` IS NOT NULL 
                   AND `initial_payment_date` != '' 
                   AND `initial_payment_date` != '0000-00-00' 
                   AND `initial_payment_date` <= :today",
                [':today' => $today]
            );
            // Deals whose initial payment date is still in the future and NOT yet received remain/revert to Submit
            $this->query(
                "UPDATE `clients` 
                 SET `status` = 'Submit' 
                 WHERE `status` = 'Approval' 
                   AND `receiving` != 'Received'
                   AND `initial_payment_date` IS NOT NULL 
                   AND `initial_payment_date` > :today",
                [':today' => $today]
            );
        } catch (\Throwable $e) {
            // Silently continue
        }
    }

    public function syncResidualValues(): void {
        if (!$this->isConnected()) return;
        try {
            $this->query("UPDATE `clients` SET `residual` = ROUND(`initial_payment` * 0.05, 2) WHERE `initial_payment` IS NOT NULL AND `initial_payment` > 0 AND (`residual` IS NULL OR `residual` != ROUND(`initial_payment` * 0.05, 2))");
        } catch (\Throwable $e) {
            // Silently continue
        }
    }

    public function getAll(array $filters = []): array {
        if (!$this->isConnected()) return [];
        $this->ensureIndexes();
        $this->syncDueApprovalStatuses();
        $this->syncResidualValues();
        $sql = "SELECT * FROM `clients` ORDER BY `date` DESC, `id` DESC";
        return $this->fetchAll($sql);
    }

    public function getCount(): int {
        if (!$this->isConnected()) return 0;
        $row = $this->fetchOne("SELECT COUNT(*) as `cnt` FROM `clients`");
        return (int)($row['cnt'] ?? 0);
    }

    public function getById(int $id): ?array {
        if (!$this->isConnected()) return null;
        $sql = "SELECT * FROM `clients` WHERE `id` = :id LIMIT 1";
        return $this->fetchOne($sql, [':id' => $id]);
    }

    /**
     * Look up or auto-register agent ID by name and role
     */
    public function resolveAgentId(?string $name, string $roleType): ?int {
        if (empty($name)) return null;
        $name = trim($name);
        $agent = $this->fetchOne(
            "SELECT `id` FROM `agents` WHERE LOWER(`name`) = LOWER(:name) AND `role_type` = :role LIMIT 1",
            [':name' => $name, ':role' => $roleType]
        );
        if ($agent && isset($agent['id'])) {
            return (int)$agent['id'];
        }

        $this->query(
            "INSERT INTO `agents` (`name`, `role_type`, `is_active`) VALUES (:name, :role, 1) ON DUPLICATE KEY UPDATE `is_active` = 1",
            [':name' => $name, ':role' => $roleType]
        );
        $newAgent = $this->fetchOne(
            "SELECT `id` FROM `agents` WHERE LOWER(`name`) = LOWER(:name) AND `role_type` = :role LIMIT 1",
            [':name' => $name, ':role' => $roleType]
        );
        return $newAgent ? (int)$newAgent['id'] : null;
    }

    /**
     * Look up or auto-register connector ID by name
     */
    public function resolveConnectorId(?string $name): ?int {
        if (empty($name)) return null;
        $name = trim($name);
        $conn = $this->fetchOne(
            "SELECT `id` FROM `connectors` WHERE LOWER(`name`) = LOWER(:name) LIMIT 1",
            [':name' => $name]
        );
        if ($conn && isset($conn['id'])) {
            return (int)$conn['id'];
        }

        $this->query(
            "INSERT INTO `connectors` (`name`, `is_active`) VALUES (:name, 1) ON DUPLICATE KEY UPDATE `is_active` = 1",
            [':name' => $name]
        );
        $newConn = $this->fetchOne(
            "SELECT `id` FROM `connectors` WHERE LOWER(`name`) = LOWER(:name) LIMIT 1",
            [':name' => $name]
        );
        return $newConn ? (int)$newConn['id'] : null;
    }

    public function create(array $data): ?int {
        if (!$this->isConnected()) return null;

        $connectorName = !empty($data['connector_name']) ? trim($data['connector_name']) : null;
        $smartAgentName = !empty($data['smart_agent_name']) ? trim($data['smart_agent_name']) : null;
        $superAgentName = !empty($data['super_agent_name']) ? trim($data['super_agent_name']) : null;
        $closerName = !empty($data['closer_name']) ? trim($data['closer_name']) : null;

        $connectorId = !empty($data['connector_id']) ? (int)$data['connector_id'] : $this->resolveConnectorId($connectorName);
        $smartAgentId = !empty($data['smart_agent_id']) ? (int)$data['smart_agent_id'] : $this->resolveAgentId($smartAgentName, 'smart');
        $superAgentId = !empty($data['super_agent_id']) ? (int)$data['super_agent_id'] : $this->resolveAgentId($superAgentName, 'super');
        $closerId = !empty($data['closer_id']) ? (int)$data['closer_id'] : $this->resolveAgentId($closerName, 'closer');

        $sql = "INSERT INTO `clients` (
            `date`, `client_name`, 
            `connector_id`, `connector_name`, 
            `smart_agent_id`, `smart_agent_name`, 
            `super_agent_id`, `super_agent_name`, 
            `closer_id`, `closer_name`,
            `status`, `plan`, `monthly`, `initial_payment`, `initial_payment_date`, `residual`, `approval_amount`, `receiving`, `created_by`
        ) VALUES (
            :date, :client_name, 
            :connector_id, :connector_name, 
            :smart_agent_id, :smart_agent_name, 
            :super_agent_id, :super_agent_name, 
            :closer_id, :closer_name,
            :status, :plan, :monthly, :initial_payment, :initial_payment_date, :residual, :approval_amount, :receiving, :created_by
        )";
        
        $stmt = $this->query($sql, [
            ':date'                 => $data['date'] ?? date('Y-m-d'),
            ':client_name'          => $data['client_name'] ?? '',
            ':connector_id'         => $connectorId,
            ':connector_name'       => $connectorName,
            ':smart_agent_id'       => $smartAgentId,
            ':smart_agent_name'     => $smartAgentName,
            ':super_agent_id'       => $superAgentId,
            ':super_agent_name'     => $superAgentName,
            ':closer_id'            => $closerId,
            ':closer_name'          => $closerName,
            ':status'               => !empty($data['status']) ? $data['status'] : 'Submit',
            ':plan'                 => (isset($data['plan']) && $data['plan'] !== null && $data['plan'] !== '') ? (int)$data['plan'] : 12,
            ':monthly'              => $data['monthly'] ?? null,
            ':initial_payment'      => $data['initial_payment'] ?? null,
            ':initial_payment_date' => $data['initial_payment_date'] ?? null,
            ':residual'             => $data['residual'] ?? null,
            ':approval_amount'      => $data['approval_amount'] ?? null,
            ':receiving'            => !empty($data['receiving']) ? $data['receiving'] : 'Pending',
            ':created_by'           => $data['created_by'] ?? null,
        ]);

        $insertId = $stmt ? (int)$this->lastInsertId() : null;
        if ($insertId && !empty($data['initial_payment_date'])) {
            (new \App\Models\WeeklyReport())->syncWeeklyReportForDate($data['initial_payment_date']);
        }
        return $insertId;
    }

    public function update(int $id, array $data): bool {
        if (!$this->isConnected()) return false;

        $existing = $this->getById($id);
        if (!$existing) return false;

        $connectorName = !empty($data['connector_name']) ? trim($data['connector_name']) : null;
        $smartAgentName = !empty($data['smart_agent_name']) ? trim($data['smart_agent_name']) : null;
        $superAgentName = !empty($data['super_agent_name']) ? trim($data['super_agent_name']) : null;
        $closerName = !empty($data['closer_name']) ? trim($data['closer_name']) : null;

        $connectorId = !empty($data['connector_id']) ? (int)$data['connector_id'] : $this->resolveConnectorId($connectorName);
        $smartAgentId = !empty($data['smart_agent_id']) ? (int)$data['smart_agent_id'] : $this->resolveAgentId($smartAgentName, 'smart');
        $superAgentId = !empty($data['super_agent_id']) ? (int)$data['super_agent_id'] : $this->resolveAgentId($superAgentName, 'super');
        $closerId = !empty($data['closer_id']) ? (int)$data['closer_id'] : $this->resolveAgentId($closerName, 'closer');

        $sql = "UPDATE `clients` SET 
            `date` = :date,
            `client_name` = :client_name,
            `connector_id` = :connector_id,
            `connector_name` = :connector_name,
            `smart_agent_id` = :smart_agent_id,
            `smart_agent_name` = :smart_agent_name,
            `super_agent_id` = :super_agent_id,
            `super_agent_name` = :super_agent_name,
            `closer_id` = :closer_id,
            `closer_name` = :closer_name,
            `status` = :status,
            `plan` = :plan,
            `monthly` = :monthly,
            `initial_payment` = :initial_payment,
            `initial_payment_date` = :initial_payment_date,
            `residual` = :residual,
            `approval_amount` = :approval_amount,
            `receiving` = :receiving
        WHERE `id` = :id";

        $stmt = $this->query($sql, [
            ':id'                   => $id,
            ':date'                 => $data['date'] ?? date('Y-m-d'),
            ':client_name'          => $data['client_name'] ?? '',
            ':connector_id'         => $connectorId,
            ':connector_name'       => $connectorName,
            ':smart_agent_id'       => $smartAgentId,
            ':smart_agent_name'     => $smartAgentName,
            ':super_agent_id'       => $superAgentId,
            ':super_agent_name'     => $superAgentName,
            ':closer_id'            => $closerId,
            ':closer_name'          => $closerName,
            ':status'               => !empty($data['status']) ? $data['status'] : 'Submit',
            ':plan'                 => (isset($data['plan']) && $data['plan'] !== null && $data['plan'] !== '') ? (int)$data['plan'] : 12,
            ':monthly'              => $data['monthly'] ?? null,
            ':initial_payment'      => $data['initial_payment'] ?? null,
            ':initial_payment_date' => $data['initial_payment_date'] ?? null,
            ':residual'             => $data['residual'] ?? null,
            ':approval_amount'      => $data['approval_amount'] ?? null,
            ':receiving'            => !empty($data['receiving']) ? $data['receiving'] : 'Pending',
        ]);

        $success = ($stmt !== null);
        if ($success) {
            $reportModel = new \App\Models\WeeklyReport();
            if (isset($data['receiving']) && in_array($data['status'] ?? '', ['Approval', 'Charged'])) {
                $isRec = (strtolower((string)$data['receiving']) === 'received') ? 1 : 0;
                $existingRec = (strtolower((string)($existing['receiving'] ?? '')) === 'received') ? 1 : 0;
                if ($isRec !== $existingRec) {
                    $reportModel->toggleClientReceived($id, $isRec);
                }
            }
            if (!empty($existing['initial_payment_date'])) {
                $reportModel->syncWeeklyReportForDate($existing['initial_payment_date']);
            }
            if (!empty($data['initial_payment_date']) && $data['initial_payment_date'] !== ($existing['initial_payment_date'] ?? '')) {
                $reportModel->syncWeeklyReportForDate($data['initial_payment_date']);
            }
        }

        return $success;
    }

    public function delete(int $id): bool {
        if (!$this->isConnected()) return false;
        $existing = $this->getById($id);
        $sql = "DELETE FROM `clients` WHERE `id` = :id";
        $stmt = $this->query($sql, [':id' => $id]);
        $success = ($stmt !== null);
        if ($success && $existing) {
            $this->query("DELETE FROM `weekly_report_records` WHERE `client_id` = :client_id", [':client_id' => $id]);
            if (!empty($existing['initial_payment_date'])) {
                (new \App\Models\WeeklyReport())->syncWeeklyReportForDate($existing['initial_payment_date']);
            }
        }
        return $success;
    }
}
