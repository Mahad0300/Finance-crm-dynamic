<?php
namespace App\Core;

use PDO;
use PDOStatement;

abstract class Model
{
    private static ?PDO $cachedDb = null;

    public static function db(): PDO
    {
        return Database::connection();
    }

    protected function getDb(): PDO
    {
        if (self::$cachedDb === null) {
            self::$cachedDb = static::db();
        }
        return self::$cachedDb;
    }

    protected function isConnected(): bool
    {
        try {
            return $this->getDb() instanceof PDO;
        } catch (\Throwable $e) {
            return false;
        }
    }

    protected function query(string $sql, array $params = []): ?PDOStatement
    {
        try {
            $db = $this->getDb();
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (\PDOException $e) {
            if (defined('APP_DEBUG') && APP_DEBUG) {
                throw $e;
            }
            error_log("Database Query Error: " . $e->getMessage());
            return null;
        }
    }

    protected function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    }

    protected function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->query($sql, $params);
        $result = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
        return $result ?: null;
    }

    protected function lastInsertId(): string|int
    {
        return $this->getDb()->lastInsertId();
    }
}
