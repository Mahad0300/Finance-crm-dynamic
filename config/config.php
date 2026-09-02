<?php
/**
 * Finance Portal - Master Configuration
 * Matches Custom MVC Architecture Standard
 */

date_default_timezone_set('Asia/Karachi');

define('ROOT_DIR', dirname(__DIR__));
define('APP_DIR', ROOT_DIR . '/app');
define('VIEW_DIR', ROOT_DIR . '/views');
define('VIEWS_PATH', VIEW_DIR);
define('STORAGE_DIR', ROOT_DIR . '/storage');

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptName = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/finance-portal/public'));
$basePath = str_replace('/public', '', $scriptName);
$dynamicBaseUrl = rtrim($protocol . '://' . $host . $basePath, '/');

$envBaseUrl = $_ENV['BASE_URL'] ?? '';
if (!empty($envBaseUrl) && isset($_SERVER['HTTP_HOST'])) {
    $parsedEnv = parse_url($envBaseUrl);
    if (!empty($parsedEnv['host']) && strtolower($parsedEnv['host']) === 'localhost' && strtolower($_SERVER['HTTP_HOST']) !== 'localhost') {
        $envBaseUrl = str_replace('://' . $parsedEnv['host'], '://' . $_SERVER['HTTP_HOST'], $envBaseUrl);
    }
}

define('BASE_URL', !empty($envBaseUrl) ? rtrim($envBaseUrl, '/') : $dynamicBaseUrl);
define('APP_NAME', $_ENV['APP_NAME'] ?? 'Finance Portal');

$appEnv = strtolower($_ENV['APP_ENV'] ?? 'local');
$appDebug = filter_var($_ENV['APP_DEBUG'] ?? 'false', FILTER_VALIDATE_BOOLEAN);
if (($appEnv === 'production' || $appEnv === 'prod') && $appDebug) {
    $appDebug = false;
}
define('APP_DEBUG', $appDebug);
define('APP_ENV', $appEnv);

define('DB_HOST', $_ENV['DB_HOST'] ?? '127.0.0.1');
define('DB_PORT', $_ENV['DB_PORT'] ?? '3306');
define('DB_USER', $_ENV['DB_USERNAME'] ?? $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASSWORD'] ?? $_ENV['DB_PASS'] ?? '');
define('DB_NAME', $_ENV['DB_DATABASE'] ?? $_ENV['DB_NAME'] ?? 'finance_crm');
define('DB_TIMEZONE', $_ENV['DB_TIMEZONE'] ?? '+05:00');

// Global Helper Functions
if (!function_exists('e')) {
    function e(?string $value): string {
        return \App\Core\View::e($value);
    }
}

if (!function_exists('asset')) {
    function asset(string $path): string {
        return \App\Core\View::asset($path);
    }
}

if (!function_exists('url')) {
    function url(string $route = ''): string {
        return \App\Core\View::url($route);
    }
}
