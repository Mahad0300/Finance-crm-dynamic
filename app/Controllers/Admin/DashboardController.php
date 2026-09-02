<?php
namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Models\Client;
use App\Models\Agent;

class DashboardController extends Controller
{
    public function index(): void
    {
        $clientModel = new Client();
        $agentModel = new Agent();

        $clients = $clientModel->getAll();
        $smartAgents = $agentModel->getAgentsByRole('smart');
        $superAgents = $agentModel->getAgentsByRole('super');
        $closers = $agentModel->getAgentsByRole('closer');
        $connectors = $agentModel->getConnectors();

        $this->view('admin/dashboard', [
            'pageTitle'   => 'Executive Dashboard - Finance Portal',
            'activeNav'   => 'dashboard',
            'clients'     => $clients,
            'smartAgents' => $smartAgents,
            'superAgents' => $superAgents,
            'closers'     => $closers,
            'connectors'  => $connectors,
            'currentUser' => $this->getCurrentUser()
        ]);
    }
}
