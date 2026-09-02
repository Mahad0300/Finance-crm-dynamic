<?php
namespace App\Core;

class View
{
    public static function e(?string $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }

    public static function asset(string $path): string
    {
        $realPath = (defined('ROOT_DIR') ? ROOT_DIR : dirname(dirname(__DIR__))) . '/public/' . ltrim($path, '/');
        $version = '';
        if (is_file($realPath)) {
            $version = '?v=' . filemtime($realPath);
        }
        $baseUrl = defined('BASE_URL') ? BASE_URL : '';
        return $baseUrl . '/' . ltrim($path, '/') . $version;
    }

    public static function avatar(?string $path): string
    {
        if (empty($path)) {
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            return $baseUrl . '/images/default-avatar.svg';
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, 'public/')) {
            $path = substr($path, 7);
        }

        $baseUrl = defined('BASE_URL') ? BASE_URL : '';
        return $baseUrl . '/' . ltrim($path, '/');
    }

    public static function adminAsset(string $path): string
    {
        return self::asset($path);
    }

    public static function url(string $route = ''): string
    {
        $baseUrl = defined('BASE_URL') ? BASE_URL : '';
        if ($route === '' || $route === '/' || $route === 'home') {
            return $baseUrl . '/';
        }

        return $baseUrl . '/' . ltrim($route, '/');
    }

    public static function appUrl(string $route = ''): string
    {
        return self::url($route);
    }

    public static function adminUrl(string $route = ''): string
    {
        return self::url($route);
    }

    public static function dashboardUrl(string $route = ''): string
    {
        return self::url($route);
    }

    public static function dashboardAsset(string $path): string
    {
        return self::adminAsset($path);
    }

    public static function render(string $path, array $data = []): void
    {
        extract($data, EXTR_SKIP);
        $viewDir = defined('VIEW_DIR') ? VIEW_DIR : dirname(dirname(__DIR__)) . '/views';
        $file = $viewDir . '/' . ltrim($path, '/');

        if (!str_ends_with($file, '.php')) {
            $file .= '.php';
        }

        if (is_file($file)) {
            include $file;
        }
    }

    public static function capture(string $path, array $data = []): string
    {
        ob_start();
        self::render($path, $data);

        return (string) ob_get_clean();
    }

    public static function renderAdmin(string $path, array $data = []): void
    {
        extract($data, EXTR_SKIP);
        $viewDir = defined('VIEW_DIR') ? VIEW_DIR : dirname(dirname(__DIR__)) . '/views';
        $file = $viewDir . '/admin/' . ltrim($path, '/');

        if (!str_ends_with($file, '.php')) {
            $file .= '.php';
        }

        if (is_file($file)) {
            include $file;
        }
    }

    public static function renderDashboard(string $path, array $data = []): void
    {
        self::renderAdmin($path, $data);
    }

    public static function exists(string $path): bool
    {
        $viewDir = defined('VIEW_DIR') ? VIEW_DIR : dirname(dirname(__DIR__)) . '/views';
        $file = $viewDir . '/' . ltrim($path, '/');
        if (!str_ends_with($file, '.php')) {
            $file .= '.php';
        }
        return is_file($file);
    }

    public static function adminExists(string $path): bool
    {
        $viewDir = defined('VIEW_DIR') ? VIEW_DIR : dirname(dirname(__DIR__)) . '/views';
        $file = $viewDir . '/admin/' . ltrim($path, '/');
        if (!str_ends_with($file, '.php')) {
            $file .= '.php';
        }
        return is_file($file);
    }

    public static function dashboardExists(string $path): bool
    {
        return self::adminExists($path);
    }
}
