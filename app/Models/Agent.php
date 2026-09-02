<?php
namespace App\Models;

use App\Core\Model;

class Agent extends Model {

    public function getAgentsByRole(string $roleType): array {
        if (!$this->isConnected()) return [];
        $sql = "SELECT `id`, `name`, `role_type`, `is_active` FROM `agents` WHERE `role_type` = :role_type AND `is_active` = 1 ORDER BY `name` ASC";
        return $this->fetchAll($sql, [':role_type' => $roleType]);
    }

    public function addAgent(string $name, string $roleType): bool {
        if (!$this->isConnected()) return false;
        $sql = "INSERT INTO `agents` (`name`, `role_type`) VALUES (:name, :role_type) ON DUPLICATE KEY UPDATE `is_active` = 1";
        return $this->query($sql, [':name' => trim($name), ':role_type' => $roleType]) !== null;
    }

    public function getConnectors(): array {
        if (!$this->isConnected()) return [];
        $sql = "SELECT `id`, `name`, `is_active` FROM `connectors` WHERE `is_active` = 1 ORDER BY `name` ASC";
        return $this->fetchAll($sql);
    }

    public function addConnector(string $name): bool {
        if (!$this->isConnected()) return false;
        $sql = "INSERT INTO `connectors` (`name`) VALUES (:name) ON DUPLICATE KEY UPDATE `is_active` = 1";
        return $this->query($sql, [':name' => trim($name)]) !== null;
    }
}
