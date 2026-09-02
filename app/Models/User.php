<?php
namespace App\Models;

use App\Core\Model;

class User extends Model {
    public function findByUsernameOrEmail(string $identifier): ?array {
        if (!$this->isConnected()) return null;
        $sql = "SELECT * FROM `users` WHERE (`username` = :id1 OR `email` = :id2) AND `status` = 'active' LIMIT 1";
        return $this->fetchOne($sql, [':id1' => $identifier, ':id2' => $identifier]);
    }

    public function findById(int $id): ?array {
        if (!$this->isConnected()) return null;
        $sql = "SELECT `id`, `username`, `full_name`, `email`, `role`, `status` FROM `users` WHERE `id` = :id LIMIT 1";
        return $this->fetchOne($sql, [':id' => $id]);
    }

    public function updateLastLogin(int $id): void {
        if (!$this->isConnected()) return;
        $sql = "UPDATE `users` SET `last_login_at` = NOW() WHERE `id` = :id";
        $this->query($sql, [':id' => $id]);
    }
}
