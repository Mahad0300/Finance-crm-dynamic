<?php
namespace App\Core;

class Session
{
    private const USER_KEY = 'finance_user';

    public static function init(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            if (!headers_sent()) {
                $sessionPath = defined('ROOT_DIR') ? ROOT_DIR . '/storage/sessions' : dirname(__DIR__, 2) . '/storage/sessions';
                if (!is_dir($sessionPath)) {
                    @mkdir($sessionPath, 0777, true);
                }
                if (is_dir($sessionPath) && is_writable($sessionPath)) {
                    @session_save_path($sessionPath);
                }

                @ini_set('session.use_only_cookies', '1');
                @ini_set('session.use_strict_mode', '1');
                @ini_set('session.cookie_httponly', '1');
                @ini_set('session.cookie_samesite', 'Lax');

                if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
                    @ini_set('session.cookie_secure', '1');
                }

                @session_name('finance_portal_session');
            }
            @session_start();
        }
    }

    public static function ensureActiveSession(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            @session_start();
        }
    }

    public static function set(string $key, mixed $value): void
    {
        self::ensureActiveSession();
        $_SESSION[$key] = $value;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        self::ensureActiveSession();
        return $_SESSION[$key] ?? $default;
    }

    public static function remove(string $key): void
    {
        self::ensureActiveSession();
        unset($_SESSION[$key]);
    }

    public static function destroy(): void
    {
        self::ensureActiveSession();
        session_unset();
        session_destroy();
    }

    public static function setFlash(string $type, string $message): void
    {
        self::ensureActiveSession();
        $_SESSION['flash'] = ['type' => $type, 'message' => $message];
    }

    public static function getFlash(): ?array
    {
        self::ensureActiveSession();
        if (!isset($_SESSION['flash'])) {
            return null;
        }

        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);

        return $flash;
    }

    public static function isLoggedIn(): bool
    {
        self::ensureActiveSession();
        return !empty($_SESSION[self::USER_KEY]) || !empty($_SESSION['user']);
    }

    public static function user(): ?array
    {
        self::ensureActiveSession();
        return $_SESSION[self::USER_KEY] ?? $_SESSION['user'] ?? null;
    }

    public static function login(array $userData): void
    {
        self::ensureActiveSession();
        session_regenerate_id(true);
        $userRecord = array_merge($userData, [
            'logged_in_at' => time(),
        ]);
        $_SESSION[self::USER_KEY] = $userRecord;
        $_SESSION['user'] = $userRecord; // legacy alias for compatibility
    }

    public static function logout(): void
    {
        self::ensureActiveSession();
        unset($_SESSION[self::USER_KEY]);
        unset($_SESSION['user']);
    }

    public static function csrfToken(): string
    {
        self::ensureActiveSession();
        if (empty($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['_csrf_token'];
    }

    public static function csrfField(): string
    {
        return '<input type="hidden" name="_csrf_token" value="' . self::csrfToken() . '">';
    }

    public static function verifyCsrf(?string $token = null, bool $singleUse = false): bool
    {
        self::ensureActiveSession();
        if ($token === null) {
            $token = $_POST['_csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        }

        if ($token === '' || !hash_equals(self::csrfToken(), $token)) {
            return false;
        }

        if ($singleUse) {
            unset($_SESSION['_csrf_token']);
        }

        return true;
    }

    public static function close(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }
    }
}
