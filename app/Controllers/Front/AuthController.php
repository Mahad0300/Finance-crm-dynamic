<?php
namespace App\Controllers\Front;

use App\Core\Controller;
use App\Core\Session;
use App\Models\User;

class AuthController extends Controller
{
    public function showLogin(): void
    {
        if ($this->isAuthenticated()) {
            $user = $this->getCurrentUser();
            $this->redirectByRole($user['role'] ?? 'client_user');
        }

        $flash = Session::getFlash();
        $error = ($flash && isset($flash['type']) && $flash['type'] === 'error') ? $flash['message'] : null;

        $this->view('front/login', [
            'pageTitle' => 'Sign In - Finance Portal',
            'error'     => $error
        ]);
    }

    public function login(): void
    {
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (empty($username) || empty($password)) {
            Session::setFlash('error', 'Please enter both username and password.');
            $this->redirect('login');
        }

        $userModel = new User();
        $user = $userModel->findByUsernameOrEmail($username);

        // Authenticate against database records
        if ($user && password_verify($password, $user['password_hash'])) {
            Session::login([
                'id'        => (int)$user['id'],
                'username'  => $user['username'],
                'full_name' => $user['full_name'],
                'email'     => $user['email'],
                'role'      => $user['role']
            ]);
            $userModel->updateLastLogin((int)$user['id']);
            $this->redirectByRole($user['role']);
        }

        Session::setFlash('error', 'Invalid username or password. Please check your credentials.');
        $this->redirect('login');
    }

    public function logout(): void
    {
        Session::logout();
        $this->redirect('login');
    }
}
