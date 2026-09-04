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

        $parseNum = function($val) {
            if ($val === null || $val === '' || $val === 'null' || $val === 'undefined') return null;
            return (float)$val;
        };

        $rawInitial = $_POST['initialPayment'] ?? $_POST['initial_payment'] ?? null;
        $initialPayment = $parseNum($rawInitial);
        $monthly = $parseNum($_POST['monthly'] ?? null);
        $residual = $parseNum($_POST['residual'] ?? null);
        $approvalAmount = $parseNum($_POST['approvalAmount'] ?? $_POST['approval_amount'] ?? null);

        $rawPaymentDate = $_POST['initialPaymentDate'] ?? $_POST['initial_payment_date'] ?? null;
        $initialPaymentDate = (!empty($rawPaymentDate) && $rawPaymentDate !== 'null' && $rawPaymentDate !== 'undefined') ? $rawPaymentDate : null;

        $rawPlan = $_POST['plan'] ?? null;
        $plan = ($rawPlan !== null && $rawPlan !== '' && $rawPlan !== 'null' && $rawPlan !== 'undefined') ? (int)$rawPlan : null;

        $data = [
            'date'                 => (!empty($_POST['date']) && $_POST['date'] !== 'null') ? $_POST['date'] : date('Y-m-d'),
            'client_name'          => trim($_POST['clientName'] ?? $_POST['client_name'] ?? ''),
            'connector_name'       => trim($_POST['connector'] ?? $_POST['connector_name'] ?? ''),
            'smart_agent_name'     => trim($_POST['smartAgent'] ?? $_POST['smart_agent_name'] ?? ''),
            'super_agent_name'     => trim($_POST['superAgent'] ?? $_POST['super_agent_name'] ?? ''),
            'closer_name'          => trim($_POST['closer'] ?? $_POST['closer_name'] ?? ''),
            'status'               => (!empty($_POST['status']) && $_POST['status'] !== 'null') ? $_POST['status'] : null,
            'plan'                 => $plan,
            'monthly'              => $monthly,
            'initial_payment'      => $initialPayment,
            'initial_payment_date' => $initialPaymentDate,
            'residual'             => $residual,
            'approval_amount'      => $approvalAmount,
            'receiving'            => (!empty($_POST['receiving']) && $_POST['receiving'] !== 'null') ? $_POST['receiving'] : null,
            'created_by'           => $user['id'] ?? null
        ];

        // Validation: Only enforce $250 minimum if an initial payment is actually entered and > 0
        if ($data['initial_payment'] !== null && $data['initial_payment'] > 0 && $data['initial_payment'] < 250) {
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
        $parseNum = function($val) {
            if ($val === null || $val === '' || $val === 'null' || $val === 'undefined') return null;
            return (float)$val;
        };

        $rawInitial = $_POST['initialPayment'] ?? $_POST['initial_payment'] ?? null;
        $initialPayment = $parseNum($rawInitial);
        $monthly = $parseNum($_POST['monthly'] ?? null);
        $residual = $parseNum($_POST['residual'] ?? null);
        $approvalAmount = $parseNum($_POST['approvalAmount'] ?? $_POST['approval_amount'] ?? null);

        $rawPaymentDate = $_POST['initialPaymentDate'] ?? $_POST['initial_payment_date'] ?? null;
        $initialPaymentDate = (!empty($rawPaymentDate) && $rawPaymentDate !== 'null' && $rawPaymentDate !== 'undefined') ? $rawPaymentDate : null;

        $rawPlan = $_POST['plan'] ?? null;
        $plan = ($rawPlan !== null && $rawPlan !== '' && $rawPlan !== 'null' && $rawPlan !== 'undefined') ? (int)$rawPlan : null;

        $data = [
            'date'                 => (!empty($_POST['date']) && $_POST['date'] !== 'null') ? $_POST['date'] : date('Y-m-d'),
            'client_name'          => trim($_POST['clientName'] ?? $_POST['client_name'] ?? ''),
            'connector_name'       => trim($_POST['connector'] ?? $_POST['connector_name'] ?? ''),
            'smart_agent_name'     => trim($_POST['smartAgent'] ?? $_POST['smart_agent_name'] ?? ''),
            'super_agent_name'     => trim($_POST['superAgent'] ?? $_POST['super_agent_name'] ?? ''),
            'closer_name'          => trim($_POST['closer'] ?? $_POST['closer_name'] ?? ''),
            'status'               => (!empty($_POST['status']) && $_POST['status'] !== 'null') ? $_POST['status'] : null,
            'plan'                 => $plan,
            'monthly'              => $monthly,
            'initial_payment'      => $initialPayment,
            'initial_payment_date' => $initialPaymentDate,
            'residual'             => $residual,
            'approval_amount'      => $approvalAmount,
            'receiving'            => (!empty($_POST['receiving']) && $_POST['receiving'] !== 'null') ? $_POST['receiving'] : null
        ];

        // Validation: Only enforce $250 minimum if an initial payment is actually entered and > 0
        if ($data['initial_payment'] !== null && $data['initial_payment'] > 0 && $data['initial_payment'] < 250) {
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
