<?php
namespace App\Middleware;

use App\Core\Session;

class GuestMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        if (Session::isLoggedIn()) {
            $user = Session::user();
            $role = $user['role'] ?? 'client_user';
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';

            switch ($role) {
                case 'admin':
                    header('Location: ' . $baseUrl . '/dashboard');
                    break;
                case 'client_user':
                    header('Location: ' . $baseUrl . '/clients');
                    break;
                case 'report_user':
                    header('Location: ' . $baseUrl . '/reports');
                    break;
                default:
                    header('Location: ' . $baseUrl . '/');
                    break;
            }
            exit;
        }
    }
}
