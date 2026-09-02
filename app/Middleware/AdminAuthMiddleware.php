<?php
namespace App\Middleware;

use App\Core\Session;

class AdminAuthMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        if (!Session::isLoggedIn()) {
            Session::setFlash('error', 'Please sign in to access the Dashboard.');
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            header('Location: ' . $baseUrl . '/login');
            exit;
        }

        $user = Session::user();
        if (($user['role'] ?? '') !== 'admin') {
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            $role = $user['role'] ?? 'client_user';
            if ($role === 'client_user') {
                header('Location: ' . $baseUrl . '/clients');
            } elseif ($role === 'report_user') {
                header('Location: ' . $baseUrl . '/reports');
            } else {
                header('Location: ' . $baseUrl . '/login');
            }
            exit;
        }
    }
}
