<?php
namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Core\Session;

class AuthController extends Controller
{
    public function logout(): void
    {
        Session::logout();
        $this->redirect('login');
    }
}
