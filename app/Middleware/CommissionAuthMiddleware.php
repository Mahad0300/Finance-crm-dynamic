<?php
namespace App\Middleware;

use App\Core\Session;

class CommissionAuthMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        if (!Session::isLoggedIn()) {
            Session::setFlash('error', 'Please sign in to access Commission.');
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            header('Location: ' . $baseUrl . '/login');
            exit;
        }

        $user = Session::user();
        $role = $user['role'] ?? '';

        // Admin and commission_user are allowed
        if ($role !== 'admin' && $role !== 'commission_user') {
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
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
