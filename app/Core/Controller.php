<?php
namespace App\Core;

class Controller
{
    protected function view(string $view, array $data = []): void
    {
        extract($data, EXTR_SKIP);
        $viewDir = defined('VIEW_DIR') ? VIEW_DIR : dirname(dirname(__DIR__)) . '/views';
        $viewFile = $viewDir . '/' . ltrim($view, '/') . '.php';

        if (!is_file($viewFile)) {
            throw new \RuntimeException('View does not exist: ' . $view);
        }

        require $viewFile;
    }

    protected function renderView(string $view, array $data = []): void
    {
        $this->view($view, $data);
    }

    protected function redirect(string $url): never
    {
        if (!str_starts_with($url, 'http')) {
            $baseUrl = defined('BASE_URL') ? BASE_URL : '';
            $url = $baseUrl . '/' . ltrim($url, '/');
        }

        header('Location: ' . $url);
        exit;
    }

    protected function jsonResponse(array $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    protected function json(array $data, int $status = 200): never
    {
        $this->jsonResponse($data, $status);
    }

    protected function getRequestInput(int $maxBytes = 2097152): array
    {
        $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
        if ($contentLength > $maxBytes) {
            $this->jsonResponse(['error' => 'Request body too large'], 413);
        }

        $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
        if (strlen($raw) > $maxBytes) {
            $this->jsonResponse(['error' => 'Request body too large'], 413);
        }

        return json_decode($raw, true) ?? $_POST ?? [];
    }

    protected function getCurrentUser(): ?array
    {
        return Session::user();
    }

    protected function isAuthenticated(): bool
    {
        return Session::isLoggedIn();
    }

    public function redirectByRole(string $role): never
    {
        switch ($role) {
            case 'admin':
                $this->redirect('dashboard');
                break;
            case 'client_user':
                $this->redirect('clients');
                break;
            case 'report_user':
                $this->redirect('reports');
                break;
            default:
                $this->redirect('login');
                break;
        }
    }
}
