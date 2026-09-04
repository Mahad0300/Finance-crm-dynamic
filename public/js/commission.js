/**
 * Finance Portal - Commission Page Logic
 * Handles live commission calculations, deals ledger, agent payouts summary,
 * interactive filters, KPI metrics cards, and CSV export.
 */

(function () {
    'use strict';

    // Commission Rates Configuration
    const COMMISSION_RATES = {
        closer: 0.10,     // 10%
        super: 0.05,      // 5%
        smart: 0.05,      // 5%
        connector: 0.02   // 2%
    };

    // Filter State
    const commFilterState = {
        search: '',
        month: 'all',
        status: 'Charged',
        role: 'all',
        activeTab: 'deals' // 'deals' or 'agents'
    };

    // Helpers
    function formatMoney(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
        const num = Number(amount);
        return '$' + num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getClients() {
        if (window.state && Array.isArray(window.state.clients) && window.state.clients.length > 0) {
            return window.state.clients;
        }
        if (window.APP_CONFIG && Array.isArray(window.APP_CONFIG.databaseClients)) {
            return window.APP_CONFIG.databaseClients;
        }
        return [];
    }

    function getApprovalAmount(client) {
        const approval = client.approvalAmount !== undefined ? client.approvalAmount : client.approval_amount;
        const initial = client.initialPayment !== undefined ? client.initialPayment : client.initial_payment;
        const val = parseFloat(approval) || parseFloat(initial) || 0;
        return val;
    }

    function calculateDealCommission(client) {
        const amount = getApprovalAmount(client);
        const closer = (client.closer || client.closer_name || '').trim();
        const superAgent = (client.superAgent || client.super_agent_name || '').trim();
        const smartAgent = (client.smartAgent || client.smart_agent_name || '').trim();
        const connector = (client.connector || client.connector_name || '').trim();

        const closerComm = (closer && closer !== '-') ? amount * COMMISSION_RATES.closer : 0;
        const superComm = (superAgent && superAgent !== '-') ? amount * COMMISSION_RATES.super : 0;
        const smartComm = (smartAgent && smartAgent !== '-') ? amount * COMMISSION_RATES.smart : 0;
        const connectorComm = (connector && connector !== '-') ? amount * COMMISSION_RATES.connector : 0;

        const totalComm = closerComm + superComm + smartComm + connectorComm;

        return {
            amount,
            closer: { name: closer || '-', comm: closerComm },
            superAgent: { name: superAgent || '-', comm: superComm },
            smartAgent: { name: smartAgent || '-', comm: smartComm },
            connector: { name: connector || '-', comm: connectorComm },
            totalComm
        };
    }

    function getFilteredDeals() {
        const allClients = getClients();

        return allClients.filter(c => {
            const status = c.status || 'Submit';
            const date = c.date || '';
            const clientName = (c.clientName || c.client_name || '').toLowerCase();
            const closer = (c.closer || c.closer_name || '').toLowerCase();
            const superAgent = (c.superAgent || c.super_agent_name || '').toLowerCase();
            const smartAgent = (c.smartAgent || c.smart_agent_name || '').toLowerCase();
            const connector = (c.connector || c.connector_name || '').toLowerCase();

            // Status filter
            if (commFilterState.status !== 'all' && status !== commFilterState.status) {
                return false;
            }

            // Month filter
            if (commFilterState.month !== 'all') {
                if (!date.startsWith(commFilterState.month)) {
                    return false;
                }
            }

            // Search filter
            if (commFilterState.search) {
                const q = commFilterState.search.toLowerCase();
                const matches = clientName.includes(q) ||
                    closer.includes(q) ||
                    superAgent.includes(q) ||
                    smartAgent.includes(q) ||
                    connector.includes(q);
                if (!matches) return false;
            }

            // Role filter
            if (commFilterState.role !== 'all') {
                if (commFilterState.role === 'closer' && (!closer || closer === '-')) return false;
                if (commFilterState.role === 'super' && (!superAgent || superAgent === '-')) return false;
                if (commFilterState.role === 'smart' && (!smartAgent || smartAgent === '-')) return false;
                if (commFilterState.role === 'connector' && (!connector || connector === '-')) return false;
            }

            return true;
        });
    }

    function updateKPICards(filteredDeals) {
        let totalVolume = 0;
        let totalCommission = 0;
        let closerTotal = 0;
        let supportTotal = 0;
        let chargedCount = 0;

        filteredDeals.forEach(client => {
            const isCharged = (client.status === 'Charged');
            const comm = calculateDealCommission(client);

            // Volume is calculated on deals meeting status criteria
            totalVolume += comm.amount;
            totalCommission += comm.totalComm;
            closerTotal += comm.closer.comm;
            supportTotal += (comm.superAgent.comm + comm.smartAgent.comm + comm.connector.comm);

            if (isCharged) chargedCount++;
        });

        const elVolume = document.getElementById('commTotalVolume');
        const elDeals = document.getElementById('commTotalDeals');
        const elCommission = document.getElementById('commTotalCommission');
        const elCloserTotal = document.getElementById('commCloserTotal');
        const elSupportTotal = document.getElementById('commSupportTotal');

        if (elVolume) elVolume.textContent = formatMoney(totalVolume);
        if (elDeals) elDeals.textContent = `${chargedCount} Charged Deal${chargedCount === 1 ? '' : 's'}`;
        if (elCommission) elCommission.textContent = formatMoney(totalCommission);
        if (elCloserTotal) elCloserTotal.textContent = formatMoney(closerTotal);
        if (elSupportTotal) elSupportTotal.textContent = formatMoney(supportTotal);
    }

    function renderDealsTable(filteredDeals) {
        const tbody = document.getElementById('commDealsTbody');
        if (!tbody) return;

        if (filteredDeals.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="margin: 0; font-size: 0.9rem;">No deals matching current filter criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredDeals.map(client => {
            const comm = calculateDealCommission(client);
            const status = client.status || 'Submit';
            let statusBadge = `<span class="badge badge-submit">Submit</span>`;
            if (status === 'Charged') {
                statusBadge = `<span class="badge badge-charged">Charged</span>`;
            } else if (status === 'Kick Back') {
                statusBadge = `<span class="badge badge-kickback">Kick Back</span>`;
            }

            const clientName = client.clientName || client.client_name || '-';
            const date = client.date || '-';

            const closerTag = comm.closer.name !== '-'
                ? `<div><strong>${escapeHtml(comm.closer.name)}</strong><br><span style="color: var(--primary); font-size: 0.75rem;">${formatMoney(comm.closer.comm)}</span></div>`
                : `<span style="color: var(--text-light);">-</span>`;

            const superTag = comm.superAgent.name !== '-'
                ? `<div><strong>${escapeHtml(comm.superAgent.name)}</strong><br><span style="color: #8B5CF6; font-size: 0.75rem;">${formatMoney(comm.superAgent.comm)}</span></div>`
                : `<span style="color: var(--text-light);">-</span>`;

            const smartTag = comm.smartAgent.name !== '-'
                ? `<div><strong>${escapeHtml(comm.smartAgent.name)}</strong><br><span style="color: #3B82F6; font-size: 0.75rem;">${formatMoney(comm.smartAgent.comm)}</span></div>`
                : `<span style="color: var(--text-light);">-</span>`;

            const connectorTag = comm.connector.name !== '-'
                ? `<div><strong>${escapeHtml(comm.connector.name)}</strong><br><span style="color: #F59E0B; font-size: 0.75rem;">${formatMoney(comm.connector.comm)}</span></div>`
                : `<span style="color: var(--text-light);">-</span>`;

            return `
                <tr>
                    <td style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(date)}</td>
                    <td><strong>${escapeHtml(clientName)}</strong></td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right; font-weight: 600;">${formatMoney(comm.amount)}</td>
                    <td>${closerTag}</td>
                    <td>${superTag}</td>
                    <td>${smartTag}</td>
                    <td>${connectorTag}</td>
                    <td style="text-align: right; font-weight: 700; color: var(--primary);">${formatMoney(comm.totalComm)}</td>
                </tr>
            `;
        }).join('');
    }

    function renderAgentsTable(filteredDeals) {
        const tbody = document.getElementById('commAgentsTbody');
        if (!tbody) return;

        const agentMap = {};

        function addAgentRecord(name, role, rate, dealVolume, isCharged) {
            if (!name || name === '-') return;
            const key = `${role}_${name.toLowerCase()}`;
            if (!agentMap[key]) {
                agentMap[key] = {
                    name,
                    role,
                    rate,
                    chargedCount: 0,
                    totalVolume: 0,
                    totalComm: 0
                };
            }
            if (isCharged) {
                agentMap[key].chargedCount++;
                agentMap[key].totalVolume += dealVolume;
                agentMap[key].totalComm += (dealVolume * rate);
            }
        }

        filteredDeals.forEach(client => {
            const amount = getApprovalAmount(client);
            const isCharged = (client.status === 'Charged');

            const closer = (client.closer || client.closer_name || '').trim();
            const superAgent = (client.superAgent || client.super_agent_name || '').trim();
            const smartAgent = (client.smartAgent || client.smart_agent_name || '').trim();
            const connector = (client.connector || client.connector_name || '').trim();

            addAgentRecord(closer, 'Closer', COMMISSION_RATES.closer, amount, isCharged);
            addAgentRecord(superAgent, 'Super Agent', COMMISSION_RATES.super, amount, isCharged);
            addAgentRecord(smartAgent, 'Smart Agent', COMMISSION_RATES.smart, amount, isCharged);
            addAgentRecord(connector, 'Connector', COMMISSION_RATES.connector, amount, isCharged);
        });

        const list = Object.values(agentMap).sort((a, b) => b.totalComm - a.totalComm);

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fa-solid fa-users" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.5;"></i>
                        <p style="margin: 0; font-size: 0.9rem;">No agent earnings recorded for current selection.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = list.map((agent, index) => {
            let roleBadge = '<span class="badge" style="background:#EBF8F2; color:#00B67A;">Closer</span>';
            if (agent.role === 'Super Agent') {
                roleBadge = '<span class="badge" style="background:#F5F3FF; color:#8B5CF6;">Super Agent</span>';
            } else if (agent.role === 'Smart Agent') {
                roleBadge = '<span class="badge" style="background:#EFF6FF; color:#3B82F6;">Smart Agent</span>';
            } else if (agent.role === 'Connector') {
                roleBadge = '<span class="badge" style="background:#FEF3C7; color:#F59E0B;">Connector</span>';
            }

            const pct = Math.round(agent.rate * 100) + '%';

            return `
                <tr>
                    <td style="color: var(--text-light);">${index + 1}</td>
                    <td><strong>${escapeHtml(agent.name)}</strong></td>
                    <td>${roleBadge}</td>
                    <td style="text-align: center;"><span class="badge-count" style="display:inline-flex;">${agent.chargedCount}</span></td>
                    <td style="text-align: right; font-weight: 600;">${formatMoney(agent.totalVolume)}</td>
                    <td style="text-align: center; font-weight: 600; color: var(--text-secondary);">${pct}</td>
                    <td style="text-align: right; font-weight: 700; color: var(--primary); font-size: 0.95rem;">${formatMoney(agent.totalComm)}</td>
                </tr>
            `;
        }).join('');
    }

    function populateMonthDropdown() {
        const select = document.getElementById('commFilterMonth');
        if (!select) return;

        const allClients = getClients();
        const months = new Set();

        allClients.forEach(c => {
            if (c.date && c.date.length >= 7) {
                months.add(c.date.substring(0, 7));
            }
        });

        const sorted = Array.from(months).sort().reverse();
        let options = '<option value="all">All Months</option>';

        sorted.forEach(m => {
            const [y, mon] = m.split('-');
            const d = new Date(parseInt(y, 10), parseInt(mon, 10) - 1, 1);
            const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            options += `<option value="${m}">${label}</option>`;
        });

        select.innerHTML = options;
    }

    function renderCommission() {
        const filtered = getFilteredDeals();
        updateKPICards(filtered);
        renderDealsTable(filtered);
        renderAgentsTable(filtered);
    }

    function exportToCSV() {
        const deals = getFilteredDeals();
        if (deals.length === 0) {
            if (window.showToast) window.showToast('info', 'No Data', 'No records to export with active filters.');
            return;
        }

        const headers = [
            'Date',
            'Client Name',
            'Status',
            'Approval Amount',
            'Closer',
            'Closer Comm (10%)',
            'Super Agent',
            'Super Agent Comm (5%)',
            'Smart Agent',
            'Smart Agent Comm (5%)',
            'Connector',
            'Connector Comm (2%)',
            'Total Deal Comm'
        ];

        const rows = deals.map(client => {
            const comm = calculateDealCommission(client);
            return [
                `"${client.date || ''}"`,
                `"${(client.clientName || client.client_name || '').replace(/"/g, '""')}"`,
                `"${client.status || 'Submit'}"`,
                comm.amount.toFixed(2),
                `"${comm.closer.name.replace(/"/g, '""')}"`,
                comm.closer.comm.toFixed(2),
                `"${comm.superAgent.name.replace(/"/g, '""')}"`,
                comm.superAgent.comm.toFixed(2),
                `"${comm.smartAgent.name.replace(/"/g, '""')}"`,
                comm.smartAgent.comm.toFixed(2),
                `"${comm.connector.name.replace(/"/g, '""')}"`,
                comm.connector.comm.toFixed(2),
                comm.totalComm.toFixed(2)
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Commission_Report_${new Date().toISOString().substring(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.showToast) window.showToast('success', 'Export Complete', 'Commission report downloaded successfully.');
    }

    function setupEventListeners() {
        // Search Input
        const searchInput = document.getElementById('commSearchInput');
        const clearBtn = document.getElementById('commSearchClearBtn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                commFilterState.search = e.target.value.trim();
                renderCommission();
            });
        }

        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                commFilterState.search = '';
                renderCommission();
            });
        }

        // Month Filter
        const monthSelect = document.getElementById('commFilterMonth');
        if (monthSelect) {
            monthSelect.addEventListener('change', (e) => {
                commFilterState.month = e.target.value;
                renderCommission();
            });
        }

        // Status Filter
        const statusSelect = document.getElementById('commFilterStatus');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                commFilterState.status = e.target.value;
                renderCommission();
            });
        }

        // Role Filter
        const roleSelect = document.getElementById('commFilterRole');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                commFilterState.role = e.target.value;
                renderCommission();
            });
        }

        // Reset Button
        const resetBtn = document.getElementById('commBtnReset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                commFilterState.search = '';
                commFilterState.month = 'all';
                commFilterState.status = 'Charged';
                commFilterState.role = 'all';

                if (searchInput) searchInput.value = '';
                if (monthSelect) monthSelect.value = 'all';
                if (statusSelect) statusSelect.value = 'Charged';
                if (roleSelect) roleSelect.value = 'all';

                renderCommission();
                if (window.showToast) window.showToast('info', 'Filters Reset', 'Default filters applied.');
            });
        }

        // Tab Switching
        const btnTabDeals = document.getElementById('btnTabDeals');
        const btnTabAgents = document.getElementById('btnTabAgents');
        const paneDeals = document.getElementById('paneDealsTable');
        const paneAgents = document.getElementById('paneAgentsTable');

        if (btnTabDeals && btnTabAgents && paneDeals && paneAgents) {
            btnTabDeals.addEventListener('click', () => {
                btnTabDeals.classList.add('active');
                btnTabDeals.style.background = '#FFFFFF';
                btnTabDeals.style.color = 'var(--text-main)';
                btnTabDeals.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';

                btnTabAgents.classList.remove('active');
                btnTabAgents.style.background = 'transparent';
                btnTabAgents.style.color = 'var(--text-muted)';
                btnTabAgents.style.boxShadow = 'none';

                paneDeals.style.display = 'block';
                paneAgents.style.display = 'none';
                commFilterState.activeTab = 'deals';
            });

            btnTabAgents.addEventListener('click', () => {
                btnTabAgents.classList.add('active');
                btnTabAgents.style.background = '#FFFFFF';
                btnTabAgents.style.color = 'var(--text-main)';
                btnTabAgents.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';

                btnTabDeals.classList.remove('active');
                btnTabDeals.style.background = 'transparent';
                btnTabDeals.style.color = 'var(--text-muted)';
                btnTabDeals.style.boxShadow = 'none';

                paneAgents.style.display = 'block';
                paneDeals.style.display = 'none';
                commFilterState.activeTab = 'agents';
            });
        }

        // Export Button
        const exportBtn = document.getElementById('btnExportCommission');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToCSV);
        }
    }

    // Initialization
    document.addEventListener('DOMContentLoaded', () => {
        populateMonthDropdown();
        setupEventListeners();
        renderCommission();
    });
})();
