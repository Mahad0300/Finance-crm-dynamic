<?php
namespace App\Middleware;

use App\Core\Session;

class CsrfMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'], true)) {
            $token = $_POST['_csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

            if (empty($token) || !Session::verifyCsrf((string)$token, false)) {
                http_response_code(419);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'error'   => 'CSRF token mismatch or missing. Please refresh the page.'
                ]);
                exit;
            }
        }
    }
}

