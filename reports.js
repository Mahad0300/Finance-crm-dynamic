/**
 * Client Management CRM - Reports Page Logic
 * Handles Initial Payment scheduled reports, 4 top KPI metric cards,
 * 5-day quick date selector pills, search, column filters, and live table calculations in <tfoot>.
 */

// ============================================================================
// 1. REPORTS STATE & STATIC DATA
// ============================================================================

const reportsState = {
    selectedDate: '2026-08-31',
    searchQuery: '',
    statusFilter: 'all',
    columnFilters: {}
};

function getReportDateList() {
    return [
        { label: 'Today', date: '2026-08-31' },
        { label: 'Aug 30', date: '2026-08-30' },
        { label: 'Aug 29', date: '2026-08-29' },
        { label: 'Aug 28', date: '2026-08-28' }
    ];
}

function getStaticReportClients() {
    return [
        // ==================== TODAY: AUG 31, 2026 (12 Records) ====================
        {
            id: 101,
            date: "2026-08-13",
            clientName: "LAVERNON EDWARDS",
            connector: "Zabloon Shamaun",
            smartAgent: "Hamza Khan",
            superAgent: "Zia Uddin",
            closer: "shahab",
            status: "Submit",
            plan: 24,
            monthly: 359.49,
            initialPayment: 359.49,
            initialPaymentDate: "2026-08-31",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Pending"
        },
        {
            id: 102,
            date: "2026-08-14",
            clientName: "MARLENE DICKERSON",
            connector: "David Wilson",
            smartAgent: "Ahad",
            superAgent: "KK",
            closer: "Yasir",
            status: "Charged",
            plan: 36,
            monthly: 420.00,
            initialPayment: 420.00,
            initialPaymentDate: "2026-08-31",
            residual: 50.00,
            approvalAmount: 1000.00,
            receiving: "Received"
        },
        {
            id: 103,
            date: "2026-08-15",
            clientName: "WOLNEY JACKSON",
            connector: "Sarah Connor",
            smartAgent: "Ali",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Submit",
            plan: 12,
            monthly: 180.50,
            initialPayment: 180.50,
            initialPaymentDate: "2026-08-31",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Received"
        },
        {
            id: 104,
            date: "2026-08-16",
            clientName: "ROBERT CHEN",
            connector: "Michael Scott",
            smartAgent: "Hamza Khan",
            superAgent: "KK",
            closer: "shahab",
            status: "Charged",
            plan: 48,
            monthly: 550.00,
            initialPayment: 550.00,
            initialPaymentDate: "2026-08-31",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },
        {
            id: 105,
            date: "2026-08-17",
            clientName: "EMILY DAVIS",
            connector: "Jessica Taylor",
            smartAgent: "Usman",
            superAgent: "Zia Uddin",
            closer: "Yasir",
            status: "Submit",
            plan: 18,
            monthly: 275.00,
            initialPayment: 275.00,
            initialPaymentDate: "2026-08-31",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Pending"
        },
        {
            id: 106,
            date: "2026-08-18",
            clientName: "DANIEL MARTINEZ",
            connector: "Alex Turner",
            smartAgent: "Ahad",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Charged",
            plan: 60,
            monthly: 650.00,
            initialPayment: 650.00,
            initialPaymentDate: "2026-08-31",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },
        {
            id: 107,
            date: "2026-08-19",
            clientName: "SOPHIA RODRIGUEZ",
            connector: "Rachel Green",
            smartAgent: "Ali",
            superAgent: "KK",
            closer: "shahab",
            status: "Charged",
            plan: 12,
            monthly: 95.00,
            initialPayment: 95.00,
            initialPaymentDate: "2026-08-31",
            residual: 25.00,
            approvalAmount: 500.00,
            receiving: "Pending"
        },
        {
            id: 108,
            date: "2026-08-20",
            clientName: "JAMES ANDERSON",
            connector: "Thomas Shelby",
            smartAgent: "Hamza Khan",
            superAgent: "Zia Uddin",
            closer: "Yasir",
            status: "Charged",
            plan: 24,
            monthly: 320.00,
            initialPayment: 320.00,
            initialPaymentDate: "2026-08-31",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Received"
        },
        {
            id: 109,
            date: "2026-08-21",
            clientName: "OLIVIA THOMAS",
            connector: "Donna Paulsen",
            smartAgent: "Usman",
            superAgent: "Ali",
            closer: "Ahmed",
            status: "Kick Back",
            plan: 36,
            monthly: 210.00,
            initialPayment: 210.00,
            initialPaymentDate: "2026-08-31",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Pending"
        },
        {
            id: 110,
            date: "2026-08-22",
            clientName: "WILLIAM WHITE",
            connector: "Harvey Specter",
            smartAgent: "Ahad",
            superAgent: "Zia Uddin",
            closer: "shahab",
            status: "Charged",
            plan: 12,
            monthly: 480.00,
            initialPayment: 480.00,
            initialPaymentDate: "2026-08-31",
            residual: 50.00,
            approvalAmount: 1000.00,
            receiving: "Received"
        },
        {
            id: 111,
            date: "2026-08-23",
            clientName: "AVA HERNANDEZ",
            connector: "Mike Ross",
            smartAgent: "Ali",
            superAgent: "KK",
            closer: "Yasir",
            status: "Submit",
            plan: 24,
            monthly: 150.00,
            initialPayment: 150.00,
            initialPaymentDate: "2026-08-31",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Pending"
        },
        {
            id: 112,
            date: "2026-08-24",
            clientName: "ETHAN MOORE",
            connector: "Louis Litt",
            smartAgent: "Hamza Khan",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Charged",
            plan: 48,
            monthly: 1200.00,
            initialPayment: 1200.00,
            initialPaymentDate: "2026-08-31",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },

        // ==================== AUG 30, 2026 (5 Records) ====================
        {
            id: 201,
            date: "2026-08-10",
            clientName: "HARVEY SPECTER",
            connector: "Mike Ross",
            smartAgent: "Hamza Khan",
            superAgent: "Zia Uddin",
            closer: "shahab",
            status: "Charged",
            plan: 36,
            monthly: 620.00,
            initialPayment: 620.00,
            initialPaymentDate: "2026-08-30",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },
        {
            id: 202,
            date: "2026-08-11",
            clientName: "RACHEL ZANE",
            connector: "Donna Paulsen",
            smartAgent: "Ahad",
            superAgent: "KK",
            closer: "Yasir",
            status: "Submit",
            plan: 24,
            monthly: 310.00,
            initialPayment: 310.00,
            initialPaymentDate: "2026-08-30",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Pending"
        },
        {
            id: 203,
            date: "2026-08-12",
            clientName: "JESSICA PEARSON",
            connector: "Harvey Specter",
            smartAgent: "Ali",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Charged",
            plan: 48,
            monthly: 850.00,
            initialPayment: 850.00,
            initialPaymentDate: "2026-08-30",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },
        {
            id: 204,
            date: "2026-08-12",
            clientName: "LOUIS LITT",
            connector: "Thomas Shelby",
            smartAgent: "Usman",
            superAgent: "Zia Uddin",
            closer: "shahab",
            status: "Charged",
            plan: 12,
            monthly: 220.00,
            initialPayment: 220.00,
            initialPaymentDate: "2026-08-30",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Received"
        },
        {
            id: 205,
            date: "2026-08-13",
            clientName: "KATRINA BENNETT",
            connector: "Sarah Connor",
            smartAgent: "Hamza Khan",
            superAgent: "KK",
            closer: "Yasir",
            status: "Submit",
            plan: 24,
            monthly: 195.00,
            initialPayment: 195.00,
            initialPaymentDate: "2026-08-30",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Pending"
        },

        // ==================== AUG 29, 2026 (4 Records) ====================
        {
            id: 301,
            date: "2026-08-08",
            clientName: "ALEX WILLIAMS",
            connector: "Harvey Specter",
            smartAgent: "Ahad",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Charged",
            plan: 24,
            monthly: 440.00,
            initialPayment: 440.00,
            initialPaymentDate: "2026-08-29",
            residual: 50.00,
            approvalAmount: 1000.00,
            receiving: "Received"
        },
        {
            id: 302,
            date: "2026-08-09",
            clientName: "SAMANTHA WHEELER",
            connector: "Donna Paulsen",
            smartAgent: "Ali",
            superAgent: "Zia Uddin",
            closer: "shahab",
            status: "Submit",
            plan: 36,
            monthly: 380.00,
            initialPayment: 380.00,
            initialPaymentDate: "2026-08-29",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Pending"
        },
        {
            id: 303,
            date: "2026-08-09",
            clientName: "CHARLES FORSTMAN",
            connector: "Louis Litt",
            smartAgent: "Hamza Khan",
            superAgent: "KK",
            closer: "Yasir",
            status: "Charged",
            plan: 12,
            monthly: 520.00,
            initialPayment: 520.00,
            initialPaymentDate: "2026-08-29",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },
        {
            id: 304,
            date: "2026-08-10",
            clientName: "DANA SCOTT",
            connector: "Mike Ross",
            smartAgent: "Usman",
            superAgent: "Ali",
            closer: "Ahmed",
            status: "Submit",
            plan: 18,
            monthly: 160.00,
            initialPayment: 160.00,
            initialPaymentDate: "2026-08-29",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Pending"
        },

        // ==================== AUG 28, 2026 (3 Records) ====================
        {
            id: 401,
            date: "2026-08-06",
            clientName: "SEAN CAHILL",
            connector: "Harvey Specter",
            smartAgent: "Ali",
            superAgent: "KK",
            closer: "shahab",
            status: "Charged",
            plan: 24,
            monthly: 350.00,
            initialPayment: 350.00,
            initialPaymentDate: "2026-08-28",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Received"
        },
        {
            id: 402,
            date: "2026-08-07",
            clientName: "SHEILA SAZS",
            connector: "Louis Litt",
            smartAgent: "Ahad",
            superAgent: "Zia Uddin",
            closer: "Yasir",
            status: "Submit",
            plan: 12,
            monthly: 290.00,
            initialPayment: 290.00,
            initialPaymentDate: "2026-08-28",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Pending"
        },
        {
            id: 403,
            date: "2026-08-07",
            clientName: "JEFF MALONE",
            connector: "Sarah Connor",
            smartAgent: "Hamza Khan",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Charged",
            plan: 48,
            monthly: 700.00,
            initialPayment: 700.00,
            initialPaymentDate: "2026-08-28",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },

        // ==================== AUG 27, 2026 (4 Records) ====================
        {
            id: 501,
            date: "2026-08-04",
            clientName: "TREVOR EVANS",
            connector: "Mike Ross",
            smartAgent: "Hamza Khan",
            superAgent: "Zia Uddin",
            closer: "shahab",
            status: "Charged",
            plan: 24,
            monthly: 260.00,
            initialPayment: 260.00,
            initialPaymentDate: "2026-08-27",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Received"
        },
        {
            id: 502,
            date: "2026-08-05",
            clientName: "JENNY GRIFFITH",
            connector: "Donna Paulsen",
            smartAgent: "Ali",
            superAgent: "KK",
            closer: "Yasir",
            status: "Submit",
            plan: 12,
            monthly: 120.00,
            initialPayment: 120.00,
            initialPaymentDate: "2026-08-27",
            residual: 35.00,
            approvalAmount: 700.00,
            receiving: "Pending"
        },
        {
            id: 503,
            date: "2026-08-05",
            clientName: "DANIEL HARDMAN",
            connector: "Harvey Specter",
            smartAgent: "Ahad",
            superAgent: "Usman",
            closer: "Ahmed",
            status: "Charged",
            plan: 60,
            monthly: 950.00,
            initialPayment: 950.00,
            initialPaymentDate: "2026-08-27",
            residual: 55.00,
            approvalAmount: 1100.00,
            receiving: "Received"
        },
        {
            id: 504,
            date: "2026-08-06",
            clientName: "JACK SOLOFF",
            connector: "Louis Litt",
            smartAgent: "Usman",
            superAgent: "Ali",
            closer: "shahab",
            status: "Charged",
            plan: 36,
            monthly: 400.00,
            initialPayment: 400.00,
            initialPaymentDate: "2026-08-27",
            residual: 45.00,
            approvalAmount: 900.00,
            receiving: "Received"
        }
    ];
}

// ============================================================================
// 2. REPORTS PAGE INITIALIZATION & QUICK PILLS
// ============================================================================

function initReportsPage() {
    const reportTable = document.getElementById('reportTable');
    if (!reportTable) return;

    // Date Picker Input
    const repDateInput = document.getElementById('repDateInput');
    if (repDateInput) {
        repDateInput.value = reportsState.selectedDate === 'all' ? '' : reportsState.selectedDate;
        repDateInput.addEventListener('change', (e) => {
            reportsState.selectedDate = e.target.value || 'all';
            updateReportsQuickPills();
            renderReportsPage();
        });
    }

    // Search Input
    const repSearchInput = document.getElementById('repSearchInput');
    if (repSearchInput) {
        repSearchInput.addEventListener('input', (e) => {
            reportsState.searchQuery = e.target.value;
            renderReportsPage();
        });
    }

    // Status Filter Dropdown
    const repStatusFilter = document.getElementById('repStatusFilter');
    if (repStatusFilter) {
        repStatusFilter.value = reportsState.statusFilter;
        repStatusFilter.addEventListener('change', (e) => {
            reportsState.statusFilter = e.target.value;
            if (e.target.value === 'all') {
                delete reportsState.columnFilters['receiving'];
            } else {
                reportsState.columnFilters['receiving'] = e.target.value;
            }
            renderReportsPage();
        });
    }

    // Export Button
    const btnExportReport = document.getElementById('btnExportReport');
    if (btnExportReport) {
        btnExportReport.addEventListener('click', () => {
            const allReportClients = getStaticReportClients();
            const filtered = allReportClients.filter(c => {
                if (reportsState.selectedDate !== 'all' && c.initialPaymentDate !== reportsState.selectedDate) return false;
                if (reportsState.statusFilter !== 'all' && c.receiving !== reportsState.statusFilter) return false;
                return true;
            });

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `report_initial_payments_${reportsState.selectedDate || 'all'}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast('info', 'Report Exported', 'Initial payments report downloaded.');
        });
    }

    buildReportsQuickPills();
    renderReportsPage();
}

function buildReportsQuickPills() {
    const container = document.getElementById('repQuickDateContainer');
    if (!container) return;

    container.innerHTML = '';
    const dateList = getReportDateList();

    dateList.forEach(item => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `sheet-tab-btn ${item.date === reportsState.selectedDate ? 'active' : ''}`;
        pill.setAttribute('data-date', item.date);
        pill.innerHTML = `
            <i class="fa-regular fa-calendar-check"></i>
            <span>${escapeHtml(item.label)}</span>
        `;

        pill.addEventListener('click', () => {
            reportsState.selectedDate = item.date;
            const dateInp = document.getElementById('repDateInput');
            if (dateInp) {
                dateInp.value = item.date === 'all' ? '' : item.date;
            }
            updateReportsQuickPills();
            renderReportsPage();
        });

        container.appendChild(pill);
    });
}

function updateReportsQuickPills() {
    const container = document.getElementById('repQuickDateContainer');
    if (!container) return;
    const pills = container.querySelectorAll('.sheet-tab-btn');
    pills.forEach(p => {
        if (p.getAttribute('data-date') === reportsState.selectedDate) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });
}

// ============================================================================
// 3. REPORTS PAGE RENDERING & CALCULATIONS
// ============================================================================

function renderReportsPage() {
    const tbody = document.getElementById('reportTableBody');
    const emptyState = document.getElementById('reportEmptyState');
    const tableEl = document.getElementById('reportTable');
    if (!tbody) return;

    const allReportClients = getStaticReportClients();

    const filtered = allReportClients.filter(c => {
        // 1. Date Filter
        if (reportsState.selectedDate && reportsState.selectedDate !== 'all') {
            if (c.initialPaymentDate !== reportsState.selectedDate) {
                return false;
            }
        }

        // 2. Search Query
        if (reportsState.searchQuery) {
            const q = reportsState.searchQuery.trim().toLowerCase();
            const name = (c.clientName || '').toLowerCase();
            const conn = (c.connector || '').toLowerCase();
            const smart = (c.smartAgent || '').toLowerCase();
            const superA = (c.superAgent || '').toLowerCase();
            const closer = (c.closer || '').toLowerCase();
            if (!name.includes(q) && !conn.includes(q) && !smart.includes(q) && !superA.includes(q) && !closer.includes(q)) {
                return false;
            }
        }

        // 3. Top Status Filter
        if (reportsState.statusFilter !== 'all' && c.receiving !== reportsState.statusFilter) {
            return false;
        }

        // 4. Column Filters
        for (const [colKey, filterVal] of Object.entries(reportsState.columnFilters)) {
            if (!filterVal) continue;

            if (Array.isArray(filterVal)) {
                if (filterVal.length === 0) continue;
                const normSet = filterVal.map(v => String(v).toLowerCase());

                if (colKey === 'plan') {
                    if (!normSet.includes(String(c.plan).toLowerCase())) return false;
                } else if (colKey === 'receiving') {
                    if (!normSet.includes((c.receiving || '').toLowerCase())) return false;
                } else if (colKey === 'smartAgent') {
                    if (!normSet.includes((c.smartAgent || '').toLowerCase())) return false;
                } else if (colKey === 'superAgent') {
                    if (!normSet.includes((c.superAgent || '').toLowerCase())) return false;
                } else if (colKey === 'closer') {
                    if (!normSet.includes((c.closer || '').toLowerCase())) return false;
                } else if (colKey === 'connector') {
                    if (!normSet.includes((c.connector || '').toLowerCase())) return false;
                }
                continue;
            }

            const fVal = String(filterVal).trim().toLowerCase();
            if (!fVal) continue;

            if (colKey === 'clientName' && !c.clientName.toLowerCase().includes(fVal)) return false;
            if (colKey === 'connector' && !(c.connector || '').toLowerCase().includes(fVal)) return false;
            if (colKey === 'smartAgent' && (c.smartAgent || '').toLowerCase() !== fVal) return false;
            if (colKey === 'superAgent' && (c.superAgent || '').toLowerCase() !== fVal) return false;
            if (colKey === 'closer' && (c.closer || '').toLowerCase() !== fVal) return false;
            if (colKey === 'plan' && String(c.plan).toLowerCase() !== fVal) return false;
            if (colKey === 'receiving' && (c.receiving || '').toLowerCase() !== fVal) return false;
            if (colKey === 'initialPaymentDate' && (!c.initialPaymentDate || !c.initialPaymentDate.toLowerCase().includes(fVal))) return false;
        }

        return true;
    });

    // KPI Metrics Calculation
    const totalApproval = filtered.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const totalDue = filtered.reduce((sum, c) => sum + (parseFloat(c.initialPayment) || 0), 0);
    const clientCount = filtered.length;
    const collectedAmount = filtered.filter(c => c.receiving === 'Received').reduce((sum, c) => sum + (parseFloat(c.initialPayment) || 0), 0);
    const pendingAmount = filtered.filter(c => c.receiving === 'Pending').reduce((sum, c) => sum + (parseFloat(c.initialPayment) || 0), 0);
    const collectedCount = filtered.filter(c => c.receiving === 'Received').length;
    const pendingCount = filtered.filter(c => c.receiving === 'Pending').length;

    // Top 4 KPI Cards (Aligned with reports.html IDs)
    const repTotalInitialDue = document.getElementById('repTotalInitialDue');
    const repClientsDueCount = document.getElementById('repClientsDueCount');
    const repTotalCollected = document.getElementById('repTotalCollected');
    const repTotalPending = document.getElementById('repTotalPending');
    const repCollectedSub = document.getElementById('repCollectedSub');
    const repPendingSub = document.getElementById('repPendingSub');

    if (repTotalInitialDue) repTotalInitialDue.textContent = formatCurrency(totalDue);
    if (repClientsDueCount) repClientsDueCount.textContent = `${clientCount} Client${clientCount === 1 ? '' : 's'}`;
    if (repTotalCollected) repTotalCollected.textContent = formatCurrency(collectedAmount);
    if (repTotalPending) repTotalPending.textContent = formatCurrency(pendingAmount);
    if (repCollectedSub) repCollectedSub.textContent = `${collectedCount} Received`;
    if (repPendingSub) repPendingSub.textContent = `${pendingCount} Pending`;

    // Render Table Rows (Exact 11 Columns matching thead)
    tbody.innerHTML = '';
    const paginationFooter = document.querySelector('.table-pagination-footer');

    if (filtered.length === 0) {
        if (tableEl) tableEl.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    } else {
        if (tableEl) tableEl.style.display = 'table';
        if (emptyState) emptyState.style.display = 'none';

        filtered.forEach(client => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="cell-date font-bold">${formatDateDisplay(client.initialPaymentDate)}</td>
                <td>
                    <strong class="client-name-text">${escapeHtml(client.clientName)}</strong>
                </td>
                <td>${escapeHtml(client.connector || '-')}</td>
                <td>${getSmartAgentBadgeHtml(client.smartAgent)}</td>
                <td>${getSuperAgentBadgeHtml(client.superAgent)}</td>
                <td>${getCloserBadgeHtml(client.closer)}</td>
                <td>${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}</td>
                <td class="currency-cell">${formatCurrency(client.approvalAmount)}</td>
                <td class="currency-cell">${formatCurrency(client.initialPayment)}</td>
                <td>${getReceivingBadgeHtml(client.receiving)}</td>
                <td>
                    <button class="btn-row-info" title="View Statement & Ledger" onclick="handleViewClient(${client.id}); event.stopPropagation();">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update tfoot Summary
    const tfootTotalApproval = document.getElementById('tfootTotalApproval');
    const tfootTotalInitial = document.getElementById('tfootTotalInitial');
    const tfootClientCount = document.getElementById('tfootClientCount');
    const tfootReceivingSummary = document.getElementById('tfootReceivingSummary');
    const repPaginationRange = document.getElementById('repPaginationRange');

    if (tfootTotalApproval) tfootTotalApproval.textContent = formatCurrency(totalApproval);
    if (tfootTotalInitial) tfootTotalInitial.textContent = formatCurrency(totalDue);
    if (tfootClientCount) tfootClientCount.textContent = `${clientCount} Client${clientCount === 1 ? '' : 's'}`;
    if (tfootReceivingSummary) {
        tfootReceivingSummary.innerHTML = `<span class="status-pill pill-charged tfoot-pill-wrap">${collectedCount} Rec / ${pendingCount} Pend</span>`;
    }
    if (repPaginationRange) {
        if (clientCount === 0) {
            repPaginationRange.textContent = `Showing 0 of 0 Scheduled Initial Collections`;
        } else {
            repPaginationRange.textContent = `Showing 1 – ${clientCount} of ${clientCount} Scheduled Initial Collections`;
        }
    }

    updateThFilterIndicators();
}

// ============================================================================
// 4. REPORTS DOM EVENT BINDING
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const reportTable = document.getElementById('reportTable');
    if (!reportTable) return;

    initReportsPage();
});
