<?php
namespace App\Controllers\Admin;

use App\Core\Controller;
use App\Models\Client;
use App\Models\Agent;

class ClientsController extends Controller
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

        $this->view('admin/clients', [
            'pageTitle'   => 'Client Data Management - Finance Portal',
            'activeNav'   => 'clients',
            'clients'     => $clients,
            'smartAgents' => $smartAgents,
            'superAgents' => $superAgents,
            'closers'     => $closers,
            'connectors'  => $connectors,
            'currentUser' => $this->getCurrentUser()
        ]);
    }

    public function create(): void
    {
        $clientModel = new Client();
        $user = $this->getCurrentUser();

        $rawInitial = $_POST['initialPayment'] ?? $_POST['initial_payment'] ?? null;
        $rawMonthly = $_POST['monthly'] ?? null;
        $rawResidual = $_POST['residual'] ?? null;
        $rawApproval = $_POST['approvalAmount'] ?? $_POST['approval_amount'] ?? null;
        $rawPaymentDate = $_POST['initialPaymentDate'] ?? $_POST['initial_payment_date'] ?? null;

        $data = [
            'date'                 => !empty($_POST['date']) ? $_POST['date'] : date('Y-m-d'),
            'client_name'          => trim($_POST['clientName'] ?? $_POST['client_name'] ?? ''),
            'connector_name'       => trim($_POST['connector'] ?? $_POST['connector_name'] ?? ''),
            'smart_agent_name'     => trim($_POST['smartAgent'] ?? $_POST['smart_agent_name'] ?? ''),
            'super_agent_name'     => trim($_POST['superAgent'] ?? $_POST['super_agent_name'] ?? ''),
            'closer_name'          => trim($_POST['closer'] ?? $_POST['closer_name'] ?? ''),
            'status'               => !empty($_POST['status']) ? $_POST['status'] : null,
            'plan'                 => (isset($_POST['plan']) && $_POST['plan'] !== '') ? (int)$_POST['plan'] : null,
            'monthly'              => ($rawMonthly !== null && $rawMonthly !== '') ? (float)$rawMonthly : null,
            'initial_payment'      => ($rawInitial !== null && $rawInitial !== '') ? (float)$rawInitial : null,
            'initial_payment_date' => !empty($rawPaymentDate) ? $rawPaymentDate : null,
            'residual'             => ($rawResidual !== null && $rawResidual !== '') ? (float)$rawResidual : null,
            'approval_amount'      => ($rawApproval !== null && $rawApproval !== '') ? (float)$rawApproval : null,
            'receiving'            => !empty($_POST['receiving']) ? $_POST['receiving'] : null,
            'created_by'           => $user['id'] ?? null
        ];

        if ($data['initial_payment'] !== null && $data['initial_payment'] < 250) {
            $this->jsonResponse(['success' => false, 'error' => 'Initial payment must be at least $250'], 422);
            return;
        }

        $insertId = $clientModel->create($data);
        $this->jsonResponse(['success' => $insertId !== null, 'id' => $insertId]);
    }

    public function update(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) {
            $this->jsonResponse(['success' => false, 'error' => 'Invalid ID'], 400);
            return;
        }

        $clientModel = new Client();
        $rawInitial = $_POST['initialPayment'] ?? $_POST['initial_payment'] ?? null;
        $rawMonthly = $_POST['monthly'] ?? null;
        $rawResidual = $_POST['residual'] ?? null;
        $rawApproval = $_POST['approvalAmount'] ?? $_POST['approval_amount'] ?? null;
        $rawPaymentDate = $_POST['initialPaymentDate'] ?? $_POST['initial_payment_date'] ?? null;

        $data = [
            'date'                 => !empty($_POST['date']) ? $_POST['date'] : date('Y-m-d'),
            'client_name'          => trim($_POST['clientName'] ?? $_POST['client_name'] ?? ''),
            'connector_name'       => trim($_POST['connector'] ?? $_POST['connector_name'] ?? ''),
            'smart_agent_name'     => trim($_POST['smartAgent'] ?? $_POST['smart_agent_name'] ?? ''),
            'super_agent_name'     => trim($_POST['superAgent'] ?? $_POST['super_agent_name'] ?? ''),
            'closer_name'          => trim($_POST['closer'] ?? $_POST['closer_name'] ?? ''),
            'status'               => !empty($_POST['status']) ? $_POST['status'] : null,
            'plan'                 => (isset($_POST['plan']) && $_POST['plan'] !== '') ? (int)$_POST['plan'] : null,
            'monthly'              => ($rawMonthly !== null && $rawMonthly !== '') ? (float)$rawMonthly : null,
            'initial_payment'      => ($rawInitial !== null && $rawInitial !== '') ? (float)$rawInitial : null,
            'initial_payment_date' => !empty($rawPaymentDate) ? $rawPaymentDate : null,
            'residual'             => ($rawResidual !== null && $rawResidual !== '') ? (float)$rawResidual : null,
            'approval_amount'      => ($rawApproval !== null && $rawApproval !== '') ? (float)$rawApproval : null,
            'receiving'            => !empty($_POST['receiving']) ? $_POST['receiving'] : null
        ];

        if ($data['initial_payment'] !== null && $data['initial_payment'] < 250) {
            $this->jsonResponse(['success' => false, 'error' => 'Initial payment must be at least $250'], 422);
            return;
        }

        $updated = $clientModel->update($id, $data);
        $this->jsonResponse(['success' => $updated]);
    }

    public function delete(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $clientModel = new Client();
        $deleted = $clientModel->delete($id);
        $this->jsonResponse(['success' => $deleted]);
    }
}
