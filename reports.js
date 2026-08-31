/**
 * Client Management CRM - Reports Page Logic
 * Handles 2 Reports Tables:
 * 1. Initial Payment Reports (13 rows, vertical scroll after 10 rows, editable Receiving inputs & tfoot live sum)
 * 2. Residual Reports (13 rows, vertical scroll after 10 rows, editable Receiving inputs & tfoot live sum)
 */

// ============================================================================
// 1. DATA SOURCES (13 ROWS EACH)
// ============================================================================

function getInitialPaymentClientsData() {
    return [
        { id: 101, date: "2026-08-31", clientName: "LAVERNON EDWARDS", plan: 24, initialPayment: 359.49, receivingAmount: 0 },
        { id: 102, date: "2026-08-31", clientName: "MARLENE DICKERSON", plan: 36, initialPayment: 420.00, receivingAmount: 420.00 },
        { id: 103, date: "2026-08-31", clientName: "WOLNEY JACKSON", plan: 12, initialPayment: 180.50, receivingAmount: 180.50 },
        { id: 104, date: "2026-08-31", clientName: "ROBERT CHEN", plan: 48, initialPayment: 550.00, receivingAmount: 550.00 },
        { id: 105, date: "2026-08-31", clientName: "EMILY DAVIS", plan: 18, initialPayment: 275.00, receivingAmount: 0 },
        { id: 106, date: "2026-08-31", clientName: "DANIEL MARTINEZ", plan: 60, initialPayment: 650.00, receivingAmount: 650.00 },
        { id: 107, date: "2026-08-31", clientName: "SOPHIA RODRIGUEZ", plan: 12, initialPayment: 95.00, receivingAmount: 0 },
        { id: 108, date: "2026-08-31", clientName: "JAMES ANDERSON", plan: 24, initialPayment: 320.00, receivingAmount: 320.00 },
        { id: 109, date: "2026-08-31", clientName: "OLIVIA THOMAS", plan: 36, initialPayment: 210.00, receivingAmount: 0 },
        { id: 110, date: "2026-08-31", clientName: "WILLIAM WHITE", plan: 12, initialPayment: 480.00, receivingAmount: 480.00 }
    ];
}

function getResidualClientsData() {
    return [
        { id: 201, date: "2026-08-31", clientName: "LAVERNON EDWARDS", plan: 24, residual: 45.00, receivingAmount: 0 },
        { id: 202, date: "2026-08-31", clientName: "MARLENE DICKERSON", plan: 36, residual: 50.00, receivingAmount: 50.00 },
        { id: 203, date: "2026-08-31", clientName: "WOLNEY JACKSON", plan: 12, residual: 35.00, receivingAmount: 35.00 },
        { id: 204, date: "2026-08-31", clientName: "ROBERT CHEN", plan: 48, residual: 55.00, receivingAmount: 55.00 },
        { id: 205, date: "2026-08-31", clientName: "EMILY DAVIS", plan: 18, residual: 45.00, receivingAmount: 0 },
        { id: 206, date: "2026-08-31", clientName: "DANIEL MARTINEZ", plan: 60, residual: 55.00, receivingAmount: 55.00 },
        { id: 207, date: "2026-08-31", clientName: "SOPHIA RODRIGUEZ", plan: 12, residual: 25.00, receivingAmount: 0 },
        { id: 208, date: "2026-08-31", clientName: "JAMES ANDERSON", plan: 24, residual: 45.00, receivingAmount: 45.00 },
        { id: 209, date: "2026-08-31", clientName: "OLIVIA THOMAS", plan: 36, residual: 35.00, receivingAmount: 0 },
        { id: 210, date: "2026-08-31", clientName: "WILLIAM WHITE", plan: 12, residual: 50.00, receivingAmount: 50.00 }
    ];
}

function getCombinedPaymentClientsData() {
    return [
        { id: 301, date: "2026-08-31", clientName: "LAVERNON EDWARDS", plan: 24, initialPayment: 359.49, residual: 0, receivingAmount: 0 },
        { id: 302, date: "2026-08-31", clientName: "MARLENE DICKERSON", plan: 36, initialPayment: 0, residual: 50.00, receivingAmount: 50.00 },
        { id: 303, date: "2026-08-31", clientName: "WOLNEY JACKSON", plan: 12, initialPayment: 180.50, residual: 0, receivingAmount: 180.50 },
        { id: 304, date: "2026-08-31", clientName: "ROBERT CHEN", plan: 48, initialPayment: 0, residual: 55.00, receivingAmount: 55.00 },
        { id: 305, date: "2026-08-31", clientName: "EMILY DAVIS", plan: 18, initialPayment: 275.00, residual: 0, receivingAmount: 0 },
        { id: 306, date: "2026-08-31", clientName: "DANIEL MARTINEZ", plan: 60, initialPayment: 0, residual: 55.00, receivingAmount: 55.00 },
        { id: 307, date: "2026-08-31", clientName: "SOPHIA RODRIGUEZ", plan: 12, initialPayment: 95.00, residual: 0, receivingAmount: 0 },
        { id: 308, date: "2026-08-31", clientName: "JAMES ANDERSON", plan: 24, initialPayment: 0, residual: 45.00, receivingAmount: 45.00 },
        { id: 309, date: "2026-08-31", clientName: "OLIVIA THOMAS", plan: 36, initialPayment: 210.00, residual: 0, receivingAmount: 0 },
        { id: 310, date: "2026-08-31", clientName: "WILLIAM WHITE", plan: 12, initialPayment: 0, residual: 50.00, receivingAmount: 50.00 }
    ];
}

let initialReportClients = null;
let residualReportClients = null;
let combinedReportClients = null;

function getInitialReportClients() {
    if (!initialReportClients) {
        initialReportClients = getInitialPaymentClientsData();
    }
    return initialReportClients;
}

function getResidualReportClients() {
    if (!residualReportClients) {
        residualReportClients = getResidualClientsData();
    }
    return residualReportClients;
}

function getCombinedReportClients() {
    if (!combinedReportClients) {
        combinedReportClients = getCombinedPaymentClientsData();
    }
    return combinedReportClients;
}

// ============================================================================
// 2. RENDERING TABLE 1: INITIAL PAYMENT REPORTS (13 ROWS)
// ============================================================================

function renderInitialPaymentReportsTable() {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;

    const clients = getInitialReportClients();
    tbody.innerHTML = '';

    clients.forEach(client => {
        const tr = document.createElement('tr');
        const recVal = client.receivingAmount !== undefined ? client.receivingAmount : 0;

        tr.innerHTML = `
            <td class="cell-date font-bold">${formatDateDisplay(client.date)}</td>
            <td>
                <strong class="client-name-text">${escapeHtml(client.clientName)}</strong>
            </td>
            <td>${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}</td>
            <td class="currency-cell">${formatCurrency(client.initialPayment)}</td>
            <td>
                <input type="number" step="0.01" min="0" 
                    class="tbl-input rep-receiving-input" 
                    data-client-id="${client.id}" 
                    value="${recVal}" 
                    placeholder="0.00">
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach real-time input listeners
    tbody.querySelectorAll('.rep-receiving-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            const cId = parseInt(e.target.getAttribute('data-client-id'), 10);
            const val = parseFloat(e.target.value) || 0;
            const targetClient = getInitialReportClients().find(c => c.id === cId);
            if (targetClient) {
                targetClient.receivingAmount = val;
            }
            updateInitialPaymentTotals();
        });
    });

    updateInitialPaymentTotals();
}

function updateInitialPaymentTotals() {
    const clients = getInitialReportClients();
    const totalDue = clients.reduce((sum, c) => sum + (parseFloat(c.initialPayment) || 0), 0);
    const totalReceived = clients.reduce((sum, c) => sum + (parseFloat(c.receivingAmount) || 0), 0);

    const tfootTotalInitial = document.getElementById('tfootTotalInitial');
    const tfootReceivingSummary = document.getElementById('tfootReceivingSummary');
    const tfootClientCount = document.getElementById('tfootClientCount');

    if (tfootTotalInitial) tfootTotalInitial.textContent = formatCurrency(totalDue);
    if (tfootReceivingSummary) tfootReceivingSummary.textContent = formatCurrency(totalReceived);
    if (tfootClientCount) tfootClientCount.textContent = `${clients.length} Clients`;
}

// ============================================================================
// 3. RENDERING TABLE 2: RESIDUAL REPORTS (13 ROWS)
// ============================================================================

function renderResidualReportsTable() {
    const tbody = document.getElementById('residualTableBody');
    if (!tbody) return;

    const clients = getResidualReportClients();
    tbody.innerHTML = '';

    clients.forEach(client => {
        const tr = document.createElement('tr');
        const recVal = client.receivingAmount !== undefined ? client.receivingAmount : 0;

        tr.innerHTML = `
            <td class="cell-date font-bold">${formatDateDisplay(client.date)}</td>
            <td>
                <strong class="client-name-text">${escapeHtml(client.clientName)}</strong>
            </td>
            <td>${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}</td>
            <td class="currency-cell">${formatCurrency(client.residual)}</td>
            <td>
                <input type="number" step="0.01" min="0" 
                    class="tbl-input rep-receiving-input rep-residual-receiving-input" 
                    data-residual-id="${client.id}" 
                    value="${recVal}" 
                    placeholder="0.00">
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach real-time input listeners
    tbody.querySelectorAll('.rep-residual-receiving-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            const cId = parseInt(e.target.getAttribute('data-residual-id'), 10);
            const val = parseFloat(e.target.value) || 0;
            const targetClient = getResidualReportClients().find(c => c.id === cId);
            if (targetClient) {
                targetClient.receivingAmount = val;
            }
            updateResidualTotals();
        });
    });

    updateResidualTotals();
}

function updateResidualTotals() {
    const clients = getResidualReportClients();
    const totalResidualDue = clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);
    const totalReceived = clients.reduce((sum, c) => sum + (parseFloat(c.receivingAmount) || 0), 0);

    const tfootTotalResidual = document.getElementById('tfootTotalResidual');
    const tfootResidualReceivingSummary = document.getElementById('tfootResidualReceivingSummary');
    const tfootResidualClientCount = document.getElementById('tfootResidualClientCount');

    if (tfootTotalResidual) tfootTotalResidual.textContent = formatCurrency(totalResidualDue);
    if (tfootResidualReceivingSummary) tfootResidualReceivingSummary.textContent = formatCurrency(totalReceived);
    if (tfootResidualClientCount) tfootResidualClientCount.textContent = `${clients.length} Clients`;
}

// ============================================================================
// 4. RENDERING TABLE 3: COMBINED INITIAL & RESIDUAL REPORTS (13 ROWS)
// ============================================================================

function renderCombinedReportsTable() {
    const tbody = document.getElementById('combinedTableBody');
    if (!tbody) return;

    const clients = getCombinedReportClients();
    tbody.innerHTML = '';

    clients.forEach(client => {
        const tr = document.createElement('tr');
        const recVal = client.receivingAmount !== undefined ? client.receivingAmount : 0;
        
        // Initial vs Residual mutually exclusive display
        const initialDisplay = (client.initialPayment && client.initialPayment > 0) 
            ? formatCurrency(client.initialPayment) 
            : `<span class="text-muted">-</span>`;
            
        const residualDisplay = (client.residual && client.residual > 0) 
            ? formatCurrency(client.residual) 
            : `<span class="text-muted">-</span>`;

        tr.innerHTML = `
            <td class="cell-date font-bold">${formatDateDisplay(client.date)}</td>
            <td>
                <strong class="client-name-text">${escapeHtml(client.clientName)}</strong>
            </td>
            <td>${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}</td>
            <td class="currency-cell">${initialDisplay}</td>
            <td class="currency-cell">${residualDisplay}</td>
            <td>
                <input type="number" step="0.01" min="0" 
                    class="tbl-input rep-receiving-input rep-combined-receiving-input" 
                    data-combined-id="${client.id}" 
                    value="${recVal}" 
                    placeholder="0.00">
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach real-time input listeners
    tbody.querySelectorAll('.rep-combined-receiving-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            const cId = parseInt(e.target.getAttribute('data-combined-id'), 10);
            const val = parseFloat(e.target.value) || 0;
            const targetClient = getCombinedReportClients().find(c => c.id === cId);
            if (targetClient) {
                targetClient.receivingAmount = val;
            }
            updateCombinedTotals();
        });
    });

    updateCombinedTotals();
}

function updateCombinedTotals() {
    const clients = getCombinedReportClients();
    const totalInitialDue = clients.reduce((sum, c) => sum + (parseFloat(c.initialPayment) || 0), 0);
    const totalResidualDue = clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);
    const totalReceived = clients.reduce((sum, c) => sum + (parseFloat(c.receivingAmount) || 0), 0);

    const tfootCombinedInitial = document.getElementById('tfootCombinedInitial');
    const tfootCombinedResidual = document.getElementById('tfootCombinedResidual');
    const tfootCombinedReceiving = document.getElementById('tfootCombinedReceiving');
    const tfootCombinedClientCount = document.getElementById('tfootCombinedClientCount');

    if (tfootCombinedInitial) tfootCombinedInitial.textContent = formatCurrency(totalInitialDue);
    if (tfootCombinedResidual) tfootCombinedResidual.textContent = formatCurrency(totalResidualDue);
    if (tfootCombinedReceiving) tfootCombinedReceiving.textContent = formatCurrency(totalReceived);
    if (tfootCombinedClientCount) tfootCombinedClientCount.textContent = `${clients.length} Clients`;
}

// ============================================================================
// 5. EXPORT HANDLERS & INITIALIZATION
// ============================================================================

function updateReportLiveHeaderDate() {
    const el = document.getElementById('reportHeaderDate');
    if (!el) return;
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    el.textContent = formatted;
}

function initReportsPage() {
    updateReportLiveHeaderDate();
    renderInitialPaymentReportsTable();
    renderResidualReportsTable();
    renderCombinedReportsTable();

    // Export Table 1
    const btnExportReport = document.getElementById('btnExportReport');
    if (btnExportReport) {
        btnExportReport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getInitialReportClients(), null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `initial_payments.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('info', 'Report Exported', 'Initial payments downloaded.');
        });
    }

    // Export Table 2
    const btnExportResidualReport = document.getElementById('btnExportResidualReport');
    if (btnExportResidualReport) {
        btnExportResidualReport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getResidualReportClients(), null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `residual_payments.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('info', 'Report Exported', 'Residual payments downloaded.');
        });
    }

    // Export Table 3
    const btnExportCombinedReport = document.getElementById('btnExportCombinedReport');
    if (btnExportCombinedReport) {
        btnExportCombinedReport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getCombinedReportClients(), null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `initial_and_residual_payments.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('info', 'Report Exported', 'Combined payments report downloaded.');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const viewReports = document.getElementById('viewReports');
    if (!viewReports) return;

    initReportsPage();
});
