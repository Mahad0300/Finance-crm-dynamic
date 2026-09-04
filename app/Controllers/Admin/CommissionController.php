<?php
namespace App\Controllers\Admin;

use App\Core\Controller;

class CommissionController extends Controller
{
    public function index(): void
    {
        $user = $this->getCurrentUser();

        $this->view('commission_user/commission', [
            'pageTitle'   => 'Commission - Finance Portal',
            'activeNav'   => 'commission',
            'currentUser' => $user
        ]);
    }
}
