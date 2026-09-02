<?php
namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) {
            if (PHP_SAPI === 'cli') {
                try {
                    self::$connection->query('SELECT 1');
                    return self::$connection;
                } catch (PDOException $e) {
                    self::$connection = null;
                }
            } else {
                return self::$connection;
            }
        }

        if (defined('DB_NAME') && DB_NAME === '') {
            throw new \RuntimeException('Database is not configured yet. Set DB_DATABASE in .env');
        }

        $host = defined('DB_HOST') ? DB_HOST : '127.0.0.1';
        $port = defined('DB_PORT') ? DB_PORT : '3306';
        $name = defined('DB_NAME') ? DB_NAME : 'finance_crm';
        $user = defined('DB_USER') ? DB_USER : 'root';
        $pass = defined('DB_PASS') ? DB_PASS : '';
        $tz   = defined('DB_TIMEZONE') ? DB_TIMEZONE : '+05:00';

        try {
            self::$connection = new PDO(
                sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name),
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_PERSISTENT         => (PHP_SAPI !== 'cli'),
                ]
            );
            self::$connection->exec("SET time_zone = '{$tz}'");
        } catch (PDOException $e) {
            if (defined('APP_DEBUG') && APP_DEBUG) {
                throw new \RuntimeException('Database connection failed: ' . $e->getMessage() . ' (Host: ' . $host . ', Port: ' . $port . ', User: ' . $user . ', Database: ' . $name . ')', 0, $e);
            }
            throw new \RuntimeException('Database connection failed. Check server configuration.', 0, $e);
        }

        return self::$connection;
    }

    public static function getConnection(): ?PDO
    {
        try {
            return self::connection();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
