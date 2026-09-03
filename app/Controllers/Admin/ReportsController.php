<?php
namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Models\WeeklyReport;
use App\Models\Agent;
use App\Models\Client;

class ReportsController extends Controller
{
    public function index(): void
    {
        $reportModel = new WeeklyReport();
        $agentModel = new Agent();
        $clientModel = new Client();

        $clients = $clientModel->getAll();
        $availableWeeks = $reportModel->getAvailableWeeks();
        
        // Active week requested or latest available
        $requestedStart = $_GET['start'] ?? $_GET['week'] ?? null;
        $activeWeek = null;
        if ($requestedStart) {
            foreach ($availableWeeks as $w) {
                if ($w['start_date'] === $requestedStart) {
                    $activeWeek = $w;
                    break;
                }
            }
        }
        if (!$activeWeek) {
            // Business rule: Always default to the latest COMPLETED week whose audit date has arrived
            $activeWeek = !empty($availableWeeks) ? $availableWeeks[0] : null;
            if (!$activeWeek) {
                $todayTimestamp = strtotime(date('Y-m-d'));
                $dayOfWeek = (int)date('N', $todayTimestamp);
                $thisMonday = strtotime('-' . ($dayOfWeek - 1) . ' days', $todayTimestamp);
                $prevMonday = date('Y-m-d', strtotime('-7 days', $thisMonday));
                $activeWeek = $reportModel->getWeekMeta($prevMonday);
            }
        }

        $records = $reportModel->getClientsByWeek($activeWeek['start_date'], $activeWeek['end_date']);
        $activeReport = $reportModel->getOrCreateWeeklyReport($activeWeek['start_date'], $activeWeek['end_date']);
        $previousRemainingList = $reportModel->getPreviousRemainingBreakdown($activeWeek['start_date']);
        $previousRemaining = $reportModel->getPreviousRemainingBalance($activeWeek['start_date']);

        $smartAgents = $agentModel->getAgentsByRole('smart');
        $superAgents = $agentModel->getAgentsByRole('super');
        $closers = $agentModel->getAgentsByRole('closer');
        $connectors = $agentModel->getConnectors();

        $this->view('admin/reports', [
            'pageTitle'              => 'Weekly Reports & Balance - Finance Portal',
            'activeNav'              => 'reports',
            'clients'                => $clients,
            'availableWeeks'         => $availableWeeks,
            'activeWeek'             => $activeWeek,
            'activeReport'           => $activeReport,
            'records'                => $records,
            'previousRemaining'      => $previousRemaining,
            'previousRemainingList'  => $previousRemainingList,
            'smartAgents'            => $smartAgents,
            'superAgents'            => $superAgents,
            'closers'                => $closers,
            'connectors'             => $connectors,
            'currentUser'            => $this->getCurrentUser()
        ]);
    }

    public function switchWeek(): void
    {
        $reportModel = new WeeklyReport();
        $startDate = $_POST['start_date'] ?? $_POST['week'] ?? date('Y-m-d');
        
        $meta = $reportModel->getWeekMeta($startDate);
        $records = $reportModel->getClientsByWeek($meta['start_date'], $meta['end_date']);
        $reportSummary = $reportModel->getOrCreateWeeklyReport($meta['start_date'], $meta['end_date']);
        $previousRemainingList = $reportModel->getPreviousRemainingBreakdown($meta['start_date']);
        $previousRemaining = $reportModel->getPreviousRemainingBalance($meta['start_date']);

        $this->jsonResponse([
            'success'                 => true,
            'week'                    => $meta,
            'records'                 => $records,
            'summary'                 => $reportSummary,
            'previous_remaining'      => $previousRemaining,
            'previous_remaining_list' => $previousRemainingList
        ]);
    }

    public function toggleCheckbox(): void
    {
        $clientId = (int)($_POST['id'] ?? 0);
        $isReceived = (int)($_POST['is_received'] ?? 0);

        $reportModel = new WeeklyReport();
        $updated = $reportModel->toggleClientReceived($clientId, $isReceived);
        $this->jsonResponse(['success' => $updated]);
    }

    public function saveFooter(): void
    {
        $reportId = (int)($_POST['report_id'] ?? 0);
        $totalTarget = isset($_POST['total_target']) ? (float)$_POST['total_target'] : null;
        $totalReceived = isset($_POST['total_received']) ? (float)$_POST['total_received'] : null;
        $totalRemaining = isset($_POST['total_remaining']) ? (float)$_POST['total_remaining'] : null;

        $reportModel = new WeeklyReport();
        $updated = $reportModel->updateFooterTotals($reportId, $totalReceived, $totalRemaining, $totalTarget);
        $this->jsonResponse(['success' => $updated]);
    }

    public function getClientLedger(): void
    {
        $clientId = (int)($_POST['client_id'] ?? 0);
        if ($clientId <= 0) {
            $this->jsonResponse(['success' => false, 'error' => 'Invalid client ID'], 400);
            return;
        }

        $reportModel = new WeeklyReport();
        $ledger = $reportModel->getClientStatement($clientId);
        if (!$ledger) {
            $this->jsonResponse(['success' => false, 'error' => 'Client statement not found'], 404);
            return;
        }

        $this->jsonResponse([
            'success' => true,
            'client'  => $ledger['client'],
            'records' => $ledger['records']
        ]);
    }
}
