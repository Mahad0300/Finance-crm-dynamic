<?php
/**
 * Finance Portal - Front Controller Entry Point
 * Routes all incoming HTTP requests via PSR-4 Autoloading and Router
 */

if (is_file(dirname(__DIR__) . '/vendor/autoload.php')) {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
}

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    $baseDir = dirname(__DIR__) . '/app/';

    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }

    $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
    $file = $baseDir . $relative . '.php';

    if (is_file($file)) {
        require $file;
    }
});

use App\Core\DotEnv;
use App\Core\ErrorHandler;
use App\Core\Router;
use App\Core\Session;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminAuthMiddleware;
use App\Middleware\ClientAuthMiddleware;
use App\Middleware\ReportAuthMiddleware;
use App\Middleware\CommissionAuthMiddleware;
use App\Middleware\GuestMiddleware;
use App\Middleware\CsrfMiddleware;

// 1. Load Environment Configuration
$envPath = dirname(__DIR__) . '/.env';
if (is_file($envPath)) {
    (new DotEnv($envPath))->load();
}

require_once dirname(__DIR__) . '/config/config.php';

// 2. Global Exception Handler & Session Initialization
ErrorHandler::register();
Session::init();

$router = new Router();

// ============================================================================
// ROUTES DEFINITIONS (chatrox Custom MVC Pattern)
// ============================================================================

// 1. Authentication Routes (Front)
$router->get('/login', 'Front\\AuthController@showLogin', [GuestMiddleware::class]);
$router->post('/login', 'Front\\AuthController@login', [GuestMiddleware::class]);
$router->get('/logout', 'Front\\AuthController@logout');
$router->post('/logout', 'Front\\AuthController@logout');

// 2. Main Application Pages
$router->get('/', 'Admin\\DashboardController@index', [AdminAuthMiddleware::class]);
$router->get('/dashboard', 'Admin\\DashboardController@index', [AdminAuthMiddleware::class]);
$router->get('/clients', 'Admin\\ClientsController@index', [ClientAuthMiddleware::class]);
$router->get('/reports', 'Admin\\ReportsController@index', [ReportAuthMiddleware::class]);
$router->get('/commission', 'Admin\\CommissionController@index', [CommissionAuthMiddleware::class]);

// 3. API Endpoints (Admin)
$router->post('/api/clients/create', 'Admin\\ClientsController@create', [AuthMiddleware::class]);
$router->post('/api/clients/update', 'Admin\\ClientsController@update', [AuthMiddleware::class]);
$router->post('/api/clients/delete', 'Admin\\ClientsController@delete', [AuthMiddleware::class]);
$router->post('/api/reports/toggle', 'Admin\\ReportsController@toggleCheckbox', [AuthMiddleware::class]);
$router->post('/api/reports/footer', 'Admin\\ReportsController@saveFooter', [AuthMiddleware::class]);
$router->post('/api/reports/switch-week', 'Admin\\ReportsController@switchWeek', [AuthMiddleware::class]);
$router->post('/api/reports/client-ledger', 'Admin\\ReportsController@getClientLedger', [AuthMiddleware::class]);

// 4. Dispatch Request
$url = isset($_GET['url']) ? rtrim((string)$_GET['url'], '/') : '';
$router->dispatch($url);
