<?php
namespace App\Middleware;

use App\Core\Session;

class AuthMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        if (!Session::isLoggedIn()) {
            Session::setFlash('error', 'Please sign in to access the Finance Portal.');
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            header('Location: ' . $baseUrl . '/login');
            exit;
        }
    }
}
