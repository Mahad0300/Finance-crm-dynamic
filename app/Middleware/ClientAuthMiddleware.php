<?php
namespace App\Middleware;

use App\Core\Session;

class ClientAuthMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        if (!Session::isLoggedIn()) {
            Session::setFlash('error', 'Please sign in to access Client Data.');
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            header('Location: ' . $baseUrl . '/login');
            exit;
        }

        $user = Session::user();
        $role = $user['role'] ?? '';

        // Admin and client_user are allowed
        if ($role !== 'admin' && $role !== 'client_user') {
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            if ($role === 'report_user') {
                header('Location: ' . $baseUrl . '/reports');
            } else {
                header('Location: ' . $baseUrl . '/login');
            }
            exit;
        }
    }
}
