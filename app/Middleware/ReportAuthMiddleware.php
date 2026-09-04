<?php
namespace App\Middleware;

use App\Core\Session;

class ReportAuthMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        if (!Session::isLoggedIn()) {
            Session::setFlash('error', 'Please sign in to access Weekly Reports.');
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            header('Location: ' . $baseUrl . '/login');
            exit;
        }

        $user = Session::user();
        $role = $user['role'] ?? '';

        // Admin and report_user are allowed
        if ($role !== 'admin' && $role !== 'report_user') {
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            if ($role === 'client_user') {
                header('Location: ' . $baseUrl . '/clients');
            } elseif ($role === 'commission_user') {
                header('Location: ' . $baseUrl . '/commission');
            } else {
                header('Location: ' . $baseUrl . '/login');
            }
            exit;
        }
    }
}
