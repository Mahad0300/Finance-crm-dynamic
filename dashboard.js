/**
 * Client Management CRM - Dashboard Page Logic
 * Handles dashboard analytics, KPI cards, and performance leaderboards (Connector, Smart Agent, Super Agent, Closer).
 */

// ============================================================================
// 1. DASHBOARD ANALYTICS & RENDERING
// ============================================================================

function renderDashboard() {
    const viewDashboard = document.getElementById('viewDashboard');
    if (!viewDashboard) return;

    const total = state.clients.length;
    const chargedClients = state.clients.filter(c => c.status === 'Charged');

    // 1. Total Charged Amount
    const totalChargedAmount = chargedClients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const chargedCount = chargedClients.length;

    // 2. Total Approval Amount & 5% Residual
    const totalApproval = state.clients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const totalResidual = state.clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);

    // 3. Total Received Amount
    const receivedClients = state.clients.filter(c => c.receiving === 'Received');
    const totalReceived = receivedClients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const receivedCount = receivedClients.length;

    const pendingClients = state.clients.filter(c => c.receiving === 'Pending');
    const pendingCount = pendingClients.length;

    const chargedPct = total > 0 ? Math.round((chargedCount / total) * 100) : 0;
    const receivedPct = total > 0 ? Math.round((receivedCount / total) * 100) : 0;

    // Card 1: Total Charged
    const elSubmit = document.getElementById('proTotalSubmit');
    if (elSubmit) elSubmit.textContent = formatCurrency(totalChargedAmount);

    const elSubmitTrend = document.getElementById('submitSubtrend');
    if (elSubmitTrend) elSubmitTrend.textContent = `${chargedCount} Charged client${chargedCount === 1 ? '' : 's'} (${chargedPct}% of total)`;

    // Card 2: Approval Amount
    const elApproval = document.getElementById('proTotalApproval');
    if (elApproval) elApproval.textContent = formatCurrency(totalApproval);

    const elResidualTag = document.getElementById('proResidualTag');
    if (elResidualTag) elResidualTag.textContent = formatCurrency(totalResidual);

    const curMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    const elMonthIncome = document.getElementById('finMonthIncome');
    if (elMonthIncome) elMonthIncome.innerHTML = `${curMonthName} <i class="fa-solid fa-chevron-down"></i>`;
    const elMonthExpense = document.getElementById('finMonthExpense');
    if (elMonthExpense) elMonthExpense.innerHTML = `${curMonthName} <i class="fa-solid fa-chevron-down"></i>`;

    // Card 3: Received Amount
    const elReceived = document.getElementById('proTotalReceived');
    if (elReceived) elReceived.textContent = formatCurrency(totalReceived);

    const elExpenseTrend = document.getElementById('expenseTrendText');
    if (elExpenseTrend) elExpenseTrend.textContent = `${receivedCount} Received (${receivedPct}%), ${pendingCount} Pending`;

    // Render 4 Performance Leaderboards
    renderPerformanceLeaderboards();
}

// ============================================================================
// 2. PERFORMANCE LEADERBOARDS
// ============================================================================

function renderPerformanceLeaderboards() {
    const elConnectorList = document.getElementById('perfConnectorList');
    const elSmartAgentList = document.getElementById('perfSmartAgentList');
    const elSuperAgentList = document.getElementById('perfSuperAgentList');
    const elCloserList = document.getElementById('perfCloserList');

    if (!elConnectorList && !elSmartAgentList && !elSuperAgentList && !elCloserList) return;

    // 1. Connectors (Top 5 Ranked by Lead Count)
    if (elConnectorList) {
        const connectorMap = {};
        state.clients.forEach(c => {
            const name = (c.connector || '').trim();
            if (!name || name === '-') return;
            if (!connectorMap[name]) {
                connectorMap[name] = { name, leads: 0 };
            }
            connectorMap[name].leads++;
        });

        const topConnectors = Object.values(connectorMap)
            .sort((a, b) => b.leads - a.leads)
            .slice(0, 5);

        if (topConnectors.length === 0) {
            elConnectorList.innerHTML = '<div class="perf-empty-state">No connector data available</div>';
        } else {
            elConnectorList.innerHTML = topConnectors.map((m, idx) => `
                <div class="perf-member-row">
                    <div class="perf-member-left">
                        <span class="perf-rank-badge rank-${idx + 1}">${idx + 1}</span>
                        <div class="perf-avatar-initials">${getInitials(m.name)}</div>
                        <div class="perf-member-info">
                            <span class="perf-member-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</span>
                        </div>
                    </div>
                    <div class="perf-member-right">
                        <span class="perf-lead-badge"><i class="fa-solid fa-bolt"></i> ${m.leads} Lead${m.leads === 1 ? '' : 's'}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Helper for Agent boxes (Smart Agent, Super Agent, Closer)
    function renderAgentPerformance(elementId, fieldName, defaultList = []) {
        const elList = document.getElementById(elementId);
        if (!elList) return;

        const agentMap = {};

        if (Array.isArray(defaultList)) {
            defaultList.forEach(name => {
                if (name && name.trim()) {
                    agentMap[name.trim()] = { name: name.trim(), count: 0, amount: 0, totalLeads: 0 };
                }
            });
        }

        state.clients.forEach(c => {
            const name = (c[fieldName] || '').trim();
            if (!name || name === '-') return;
            if (!agentMap[name]) {
                agentMap[name] = { name, count: 0, amount: 0, totalLeads: 0 };
            }
            agentMap[name].totalLeads++;
            if (c.status === 'Charged') {
                agentMap[name].count++;
                agentMap[name].amount += (parseFloat(c.approvalAmount) || parseFloat(c.initialPayment) || 0);
            }
        });

        const ranked = Object.values(agentMap)
            .sort((a, b) => {
                if (b.amount !== a.amount) return b.amount - a.amount;
                if (b.count !== a.count) return b.count - a.count;
                return b.totalLeads - a.totalLeads;
            })
            .slice(0, 5);

        if (ranked.length === 0) {
            elList.innerHTML = '<div class="perf-empty-state">No agent data available</div>';
        } else {
            elList.innerHTML = ranked.map((m, idx) => `
                <div class="perf-member-row">
                    <div class="perf-member-left">
                        <span class="perf-rank-badge rank-${idx + 1}">${idx + 1}</span>
                        <div class="perf-avatar-initials">${getInitials(m.name)}</div>
                        <div class="perf-member-info">
                            <span class="perf-member-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</span>
                            <span class="perf-sub-count">${m.count} Charged</span>
                        </div>
                    </div>
                    <div class="perf-member-right">
                        <span class="perf-amount-val">${formatCurrency(m.amount)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    renderAgentPerformance('perfSmartAgentList', 'smartAgent', state.smartAgents);
    renderAgentPerformance('perfSuperAgentList', 'superAgent', state.superAgents);
    renderAgentPerformance('perfCloserList', 'closer', state.closers);
}

// ============================================================================
// 3. DASHBOARD EVENT BINDINGS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const viewDashboard = document.getElementById('viewDashboard');
    if (!viewDashboard) return;

    renderDashboard();

    const btnExportHeader = document.getElementById('btnExportHeader');
    if (btnExportHeader) {
        btnExportHeader.addEventListener('click', () => {
            if (typeof exportData === 'function') exportData();
        });
    }

    const btnOpenAddModal = document.getElementById('btnOpenAddModal');
    if (btnOpenAddModal) {
        btnOpenAddModal.addEventListener('click', () => {
            window.location.href = 'clients.html?action=add';
        });
    }
});
