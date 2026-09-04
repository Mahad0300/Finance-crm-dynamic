<?php
namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Models\Client;
use App\Models\Agent;
use App\Models\WeeklyReport;

class DashboardController extends Controller
{
    public function index(): void
    {
        $clientModel = new Client();
        $agentModel = new Agent();
        $reportModel = new WeeklyReport();

        $clients = $clientModel->getAll();
        $smartAgents = $agentModel->getAgentsByRole('smart');
        $superAgents = $agentModel->getAgentsByRole('super');
        $closers = $agentModel->getAgentsByRole('closer');
        $connectors = $agentModel->getConnectors();

        $availableWeeks = $reportModel->getAvailableWeeks();
        $activeWeek = !empty($availableWeeks) ? $availableWeeks[0] : null;
        $dashboardWeeklySummaries = $reportModel->getDashboardWeeklySummaries();
        $weeklyReports = $reportModel->getAllReports();

        $this->view('admin/dashboard', [
            'pageTitle'                => 'Executive Dashboard - Finance Portal',
            'activeNav'                => 'dashboard',
            'clients'                  => $clients,
            'availableWeeks'           => $availableWeeks,
            'activeWeek'               => $activeWeek,
            'weeklyReports'            => $weeklyReports,
            'dashboardWeeklySummaries' => $dashboardWeeklySummaries,
            'smartAgents'              => $smartAgents,
            'superAgents'              => $superAgents,
            'closers'                  => $closers,
            'connectors'               => $connectors,
            'currentUser'              => $this->getCurrentUser()
        ]);
    }
}
