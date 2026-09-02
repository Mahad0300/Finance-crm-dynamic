<?php
namespace App\Middleware;

use App\Core\Session;

class CsrfMiddleware implements MiddlewareInterface
{
    public function handle(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'], true)) {
            // Check if CSRF token is provided (or allow AJAX fallback if header not present)
            $token = $_POST['_csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            if ($token !== null && !Session::verifyCsrf($token, false)) {
                http_response_code(419);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'CSRF token mismatch. Please reload page.']);
                exit;
            }
        }
    }
}
