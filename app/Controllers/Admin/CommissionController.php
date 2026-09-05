<?php
namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Models\Client;
use App\Models\Agent;

class CommissionController extends Controller
{
    public function index(): void
    {
        $user = $this->getCurrentUser();
        $role = $user['role'] ?? 'admin';

        $clientModel = new Client();
        $agentModel = new Agent();

        $clientCount = $clientModel->getCount();
        $smartAgents = $agentModel->getAgentsByRole('smart');
        $superAgents = $agentModel->getAgentsByRole('super');
        $closers = $agentModel->getAgentsByRole('closer');
        $connectors = $agentModel->getConnectors();

        $viewPath = ($role === 'commission_user') ? 'commission_user/commission' : 'admin/commission';

        $this->view($viewPath, [
            'pageTitle'   => 'Commission - Finance Portal',
            'activeNav'   => 'commission',
            'pageScript'  => 'commission.js',
            'clients'     => [],
            'clientCount' => $clientCount,
            'smartAgents' => $smartAgents,
            'superAgents' => $superAgents,
            'closers'     => $closers,
            'connectors'  => $connectors,
            'currentUser' => $user
        ]);
    }
}
