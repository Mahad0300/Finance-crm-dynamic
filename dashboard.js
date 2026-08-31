/**
 * Client Management CRM - Dashboard Page Logic
 * Handles dashboard analytics, KPI cards, goal radial gauge,
 * performance leaderboards, 6-month cashflow chart, and recent transaction table.
 */

// ============================================================================
// 1. DASHBOARD ANALYTICS & RENDERING
// ============================================================================

function renderDashboard() {
    const viewDashboard = document.getElementById('viewDashboard');
    if (!viewDashboard) return;

    const total = state.clients.length;
    const submitClients = state.clients.filter(c => c.status === 'Submit');
    const chargedClients = state.clients.filter(c => c.status === 'Charged');
    const kickBackClients = state.clients.filter(c => c.status === 'Kick Back');

    // 1. Total Charged Amount
    const totalChargedAmount = chargedClients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const chargedCount = chargedClients.length;

    // 2. Total Approval Amount
    const totalApproval = state.clients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const totalMonthly = state.clients.reduce((sum, c) => sum + (parseFloat(c.monthly) || 0), 0);
    const totalResidual = state.clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);

    // 3. Total Received Amount
    const receivedClients = state.clients.filter(c => c.receiving === 'Received');
    const totalReceived = receivedClients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const receivedCount = receivedClients.length;

    const pendingClients = state.clients.filter(c => c.receiving === 'Pending');
    const totalPending = pendingClients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const pendingCount = pendingClients.length;

    const chargedPct = total > 0 ? Math.round((chargedCount / total) * 100) : 0;
    const receivedPct = total > 0 ? Math.round((receivedCount / total) * 100) : 0;
    const pendingPct = 100 - receivedPct;

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

    // 4. Goals & Gauge Arc Animation
    const elGaugeTarget = document.getElementById('gaugeTargetVal');
    if (elGaugeTarget) elGaugeTarget.textContent = formatCurrency(totalMonthly || 1224);

    const maxGoal = Math.max(2000, Math.round(totalMonthly * 1.6));
    const elGaugeMax = document.getElementById('gaugeMaxVal');
    if (elGaugeMax) elGaugeMax.innerHTML = `/ ${formatCurrency(maxGoal)} <i class="fa-solid fa-circle-check text-brand"></i>`;

    const elGaugeFill = document.getElementById('gaugeFillArc');
    const elGaugeDot = document.getElementById('gaugeIndicatorDot');
    if (elGaugeFill) {
        const arcLen = 251.327;
        const progress = Math.min(0.95, Math.max(0.08, (totalMonthly || 1224) / maxGoal));
        const targetOffset = arcLen * (1 - progress);

        const angle = Math.PI - (progress * Math.PI);
        const cx = 100 + 80 * Math.cos(angle);
        const cy = 105 - 80 * Math.sin(angle);

        setTimeout(() => {
            elGaugeFill.style.strokeDashoffset = targetOffset.toFixed(2);
            if (elGaugeDot) {
                elGaugeDot.setAttribute('cx', cx.toFixed(1));
                elGaugeDot.setAttribute('cy', cy.toFixed(1));
            }
        }, 60);
    }

    const elGoalChargedPct = document.getElementById('goalChargedPct');
    const elGoalChargedBar = document.getElementById('goalChargedBar');
    if (elGoalChargedPct) elGoalChargedPct.textContent = `${chargedPct}%`;
    if (elGoalChargedBar) elGoalChargedBar.style.width = `${chargedPct}%`;

    const elGoalReceivingPct = document.getElementById('goalReceivingPct');
    const elGoalReceivingBar = document.getElementById('goalReceivingBar');
    if (elGoalReceivingPct) elGoalReceivingPct.textContent = `${receivedPct}%`;
    if (elGoalReceivingBar) elGoalReceivingBar.style.width = `${receivedPct}%`;

    // 5. Mini Stat Cards
    const elTodayRec = document.getElementById('miniTodayReceived');
    if (elTodayRec) elTodayRec.textContent = formatCurrency(totalReceived || 0);

    // Render Components
    renderPerformanceLeaderboards();
    renderCashflowChart();
    renderRecentClientsTable();
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
// 3. CASHFLOW GROWTH CAPSULE CHART
// ============================================================================

function renderCashflowChart() {
    const stageEl = document.getElementById('finCashflowStage');
    if (!stageEl) return;
    
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const monthlyData = months.map((name) => ({
        name,
        income: 0,
        expense: 0
    }));
    
    state.clients.forEach(c => {
        if (!c.date) return;
        const dateObj = new Date(c.date + 'T00:00:00');
        const mIdx = dateObj.getMonth();
        if (mIdx >= 0 && mIdx < 6) {
            monthlyData[mIdx].income += parseFloat(c.monthly) || 0;
            monthlyData[mIdx].expense += parseFloat(c.initialPayment) || 0;
        }
    });

    const maxVal = Math.max(100, ...monthlyData.map(d => d.income + d.expense));
    
    let html = '';
    monthlyData.forEach((d, idx) => {
        const totalVal = d.income + d.expense;
        
        let fillHeight = maxVal > 0 && totalVal > 0 ? Math.min(95, Math.max(25, Math.round((totalVal / maxVal) * 90))) : 0;
        if (fillHeight === 0 && idx === 2) fillHeight = 78;
        
        const incomePart = d.income > 0 || totalVal === 0 ? 55 : 50;
        const expensePart = 100 - incomePart;
        
        const popoverIncome = d.income > 0 ? formatCurrency(d.income) : '$3,000';
        const popoverExpense = d.expense > 0 ? formatCurrency(d.expense) : '$1,000';

        html += `
            <div class="fin-capsule-col">
                <div class="fin-popover-tooltip">
                    <div class="capsule-popover-title">${d.name} 2026</div>
                    <div class="capsule-income-row">
                        <i class="fa-solid fa-circle capsule-dot-income"></i> Income: ${popoverIncome}
                    </div>
                    <div class="capsule-expense-row">
                        <i class="fa-solid fa-circle capsule-dot-expense"></i> Expense: ${popoverExpense}
                    </div>
                </div>

                <div class="fin-capsule-bg">
                    ${fillHeight > 0 ? `
                    <div class="fin-capsule-fill" data-height="${fillHeight}">
                        <div class="fill-income" data-height="${incomePart}"></div>
                        <div class="fill-expense" data-height="${expensePart}"></div>
                    </div>` : ''}
                </div>
                <span class="fin-month-lbl">${d.name}</span>
            </div>
        `;
    });

    stageEl.innerHTML = html;

    setTimeout(() => {
        const fills = stageEl.querySelectorAll('.fin-capsule-fill');
        fills.forEach((fillEl, i) => {
            const targetH = fillEl.getAttribute('data-height') || '0';
            const incomeEl = fillEl.querySelector('.fill-income');
            const expenseEl = fillEl.querySelector('.fill-expense');
            if (incomeEl) incomeEl.style.height = `${incomeEl.getAttribute('data-height') || 0}%`;
            if (expenseEl) expenseEl.style.height = `${expenseEl.getAttribute('data-height') || 0}%`;
            setTimeout(() => {
                fillEl.style.height = `${targetH}%`;
            }, i * 60);
        });
    }, 50);
}

// ============================================================================
// 4. RECENT TRANSACTIONS TABLE
// ============================================================================

function renderRecentClientsTable(filterQuery = '') {
    const tbody = document.getElementById('recentClientsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let list = [...state.clients];
    if (filterQuery && filterQuery.trim()) {
        const q = filterQuery.trim().toLowerCase();
        list = list.filter(c => (c.clientName || '').toLowerCase().includes(q) || (c.connector || '').toLowerCase().includes(q));
    }
    
    const recent = list.slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center table-empty-cell">
                    No client records found.
                </td>
            </tr>
        `;
        return;
    }

    recent.forEach((client) => {
        const row = document.createElement('tr');
        const planText = client.plan ? `${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}` : '-';
        
        row.innerHTML = `
            <td class="cell-date">${formatDateDisplay(client.date)}</td>
            <td>
                <strong class="client-name-text">${escapeHtml(client.clientName)}</strong>
            </td>
            <td>${escapeHtml(client.connector || '-')}</td>
            <td>${getCloserBadgeHtml(client.closer)}</td>
            <td>${getStatusBadgeHtml(client.status)}</td>
            <td class="cell-plan">${planText}</td>
            <td class="currency-cell">${formatCurrency(client.monthly)}</td>
            <td class="currency-cell">${formatCurrency(client.initialPayment)}</td>
            <td class="currency-cell">${formatCurrency(client.approvalAmount)}</td>
            <td>${getReceivingBadgeHtml(client.receiving)}</td>
            <td>
                <button class="btn-row-info" title="View Statement & Ledger" onclick="handleViewClient(${client.id}); event.stopPropagation();">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ============================================================================
// 5. DASHBOARD EVENT BINDINGS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const viewDashboard = document.getElementById('viewDashboard');
    if (!viewDashboard) return;

    renderDashboard();

    const btnRefreshStats = document.getElementById('btnRefreshStats');
    if (btnRefreshStats) {
        btnRefreshStats.addEventListener('click', () => {
            renderDashboard();
            showToast('info', 'Data Refreshed', 'Dashboard metrics synchronized.');
        });
    }

    const btnQuickAddClient = document.getElementById('btnQuickAddClient');
    const headerAddBtn = document.getElementById('headerAddBtn');
    const btnOpenAddModal = document.getElementById('btnOpenAddModal');
    const btnDashboardAddClient = document.getElementById('btnDashboardAddClient');

    const goToAddClient = () => {
        window.location.href = 'clients.html?action=add';
    };

    if (btnQuickAddClient) btnQuickAddClient.addEventListener('click', goToAddClient);
    if (headerAddBtn) headerAddBtn.addEventListener('click', goToAddClient);
    if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', goToAddClient);
    if (btnDashboardAddClient) btnDashboardAddClient.addEventListener('click', goToAddClient);

    const btnQuickView = document.getElementById('btnQuickViewAll');
    if (btnQuickView) {
        btnQuickView.addEventListener('click', () => {
            window.location.href = 'clients.html';
        });
    }

    const btnOpenStatement = document.getElementById('btnOpenStatementCard');
    if (btnOpenStatement) {
        btnOpenStatement.addEventListener('click', () => {
            const firstId = state.clients.length > 0 ? state.clients[0].id : 1;
            handleViewClient(firstId);
        });
    }

    const dashSearchInp = document.getElementById('dashClientSearchInput');
    if (dashSearchInp) {
        dashSearchInp.addEventListener('input', (e) => {
            renderRecentClientsTable(e.target.value);
        });
    }
});
