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

    public function getAll(array $filters = []): array {
        if (!$this->isConnected()) return [];
        $this->ensureIndexes();
        $sql = "SELECT * FROM `clients` ORDER BY `id` DESC";
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

        return $stmt ? (int)$this->lastInsertId() : null;
    }

    public function update(int $id, array $data): bool {
        if (!$this->isConnected()) return false;

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
        if ($success && isset($data['receiving'])) {
            $isRec = (strtolower((string)$data['receiving']) === 'received') ? 1 : 0;
            $reportModel = new \App\Models\WeeklyReport();
            $reportModel->toggleClientReceived($id, $isRec);
        }

        return $success;
    }

    public function delete(int $id): bool {
        if (!$this->isConnected()) return false;
        $sql = "DELETE FROM `clients` WHERE `id` = :id";
        return $this->query($sql, [':id' => $id]) !== null;
    }
}
