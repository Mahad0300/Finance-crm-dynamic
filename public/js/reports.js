/**
 * Client Management CRM - Reports Page Logic
 * Handles Master Approval & Residual Payments Report Table
 * Monday-to-Friday Weekly Cycles, Schedule Timing, Live Checkbox Sync, and Footer Calculations
 */

// ============================================================================
// 1. DATA SOURCE (DYNAMIC LIVE DATABASE MONDAY-TO-FRIDAY WEEKLY CLIENTS)
// ============================================================================

let combinedReportClients = null;
let isClientLedgerMode = false;
let activeClientLedgerData = null;
let savedWeeklyReportState = null;

function getCombinedReportClients() {
    if (!combinedReportClients) {
        if (window.APP_CONFIG && Array.isArray(window.APP_CONFIG.databaseReports)) {
            combinedReportClients = window.APP_CONFIG.databaseReports.map(c => ({
                id: c.client_id ? Number(c.client_id) : Number(c.id),
                date: c.date || c.initial_payment_date || '',
                clientName: c.client_name || c.clientName || '',
                plan: c.plan ? Number(c.plan) : null,
                approvalPayment: (c.approval_payment !== null && c.approval_payment !== undefined && c.approval_payment !== '') ? Number(c.approval_payment) : null,
                residual: (c.residual_payment !== null && c.residual_payment !== undefined && c.residual_payment !== '') ? Number(c.residual_payment) : null,
                paymentType: c.payment_type || 'Approval Payment',
                isReceived: c.receiving === 'Received' || Boolean(Number(c.is_received))
            }));
        } else {
            combinedReportClients = [];
        }
    }
    return combinedReportClients;
}

// ============================================================================
// 2. RENDERING APPROVAL & RESIDUAL PAYMENTS REPORT TABLE
// ============================================================================

function renderCombinedReportsTable() {
    const tbody = document.getElementById('combinedTableBody');
    if (!tbody) return;

    const clients = getCombinedReportClients();
    tbody.innerHTML = '';

    // Render Previous Week Remaining Balance Rows directly under thead if carry-forward exists
    const prevList = (window.APP_CONFIG && Array.isArray(window.APP_CONFIG.previousRemainingList)) 
        ? window.APP_CONFIG.previousRemainingList 
        : [];

    if (prevList.length > 0) {
        prevList.forEach(item => {
            const remAmount = parseFloat(item.remaining) || 0;
            if (remAmount > 0) {
                const bannerTr = document.createElement('tr');
                bannerTr.className = 'prev-remaining-banner-row prev-remaining-clickable';
                bannerTr.setAttribute('title', `Click to open report for ${item.title}`);
                const cleanItemTitle = (item.date_range || item.title || '').replace(/^Week\s+\d+:\s*/i, '');
                bannerTr.innerHTML = `
                    <td colspan="6" class="prev-remaining-banner-cell">
                        <div class="prev-remaining-alert-content">
                            <div class="prev-remaining-left">
                                <span class="prev-remaining-icon-badge"><i class="fa-solid fa-clock-rotate-left"></i></span>
                                <span class="prev-remaining-label font-bold">Previous Week Remaining Balance Carried Forward ${escapeHtml(cleanItemTitle)}</span>
                                <span class="prev-remaining-link-hint" title="View report"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                            </div>
                            <div class="prev-remaining-right">
                                <span class="prev-remaining-amount font-mono font-bold text-amber">+${formatCurrency(remAmount)}</span>
                            </div>
                        </div>
                    </td>
                `;
                bannerTr.addEventListener('click', () => {
                    switchWeeklyCycle(item.start_date);
                });
                tbody.appendChild(bannerTr);
            }
        });
    } else {
        const prevRemaining = (window.APP_CONFIG && window.APP_CONFIG.previousRemaining) 
            ? parseFloat(window.APP_CONFIG.previousRemaining) 
            : 0;

        if (prevRemaining > 0) {
            const bannerTr = document.createElement('tr');
            bannerTr.className = 'prev-remaining-banner-row';
            bannerTr.innerHTML = `
                <td colspan="6" class="prev-remaining-banner-cell">
                    <div class="prev-remaining-alert-content">
                        <div class="prev-remaining-left">
                            <span class="prev-remaining-icon-badge"><i class="fa-solid fa-clock-rotate-left"></i></span>
                            <span class="prev-remaining-label font-bold">Previous Week Remaining Balance Carried Forward</span>
                        </div>
                        <div class="prev-remaining-right">
                            <span class="prev-remaining-amount font-mono font-bold text-amber">+${formatCurrency(prevRemaining)}</span>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(bannerTr);
        }
    }

    if (clients.length === 0) {
        const emptyTr = document.createElement('tr');
        emptyTr.innerHTML = `
            <td colspan="6" class="text-center text-muted" style="padding: 36px 16px;">
                <i class="fa-solid fa-calendar-xmark" style="font-size: 26px; margin-bottom: 8px; display:block; color: #94A3B8;"></i>
                No charged client payments scheduled for this Monday - Sunday work week.
            </td>
        `;
        tbody.appendChild(emptyTr);
        updateCombinedTotals();
        return;
    }

    clients.forEach(client => {
        const tr = document.createElement('tr');
        
        // Approval vs Residual display
        const approvalDisplay = (client.approvalPayment && client.approvalPayment > 0) 
            ? formatCurrency(client.approvalPayment) 
            : `<span class="text-muted-dash">-</span>`;
            
        const residualDisplay = (client.residual && client.residual > 0) 
            ? formatCurrency(client.residual) 
            : `<span class="text-muted-dash">-</span>`;

        const planDisplay = client.plan ? `${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}` : `<span class="text-muted-dash">-</span>`;

        tr.innerHTML = `
            <td class="cell-rep-date font-mono">${formatDateDisplay(client.date)}</td>
            <td class="cell-rep-name font-bold">
                <span class="client-name-link" data-client-id="${client.id}" title="Click to view full transaction ledger for ${escapeHtml(client.clientName)}">
                    ${escapeHtml(client.clientName)}
                    <i class="fa-solid fa-arrow-up-right-from-square client-name-link-icon"></i>
                </span>
            </td>
            <td class="cell-rep-plan font-bold text-center">${planDisplay}</td>
            <td class="currency-val cell-rep-initial font-bold">${approvalDisplay}</td>
            <td class="currency-val cell-rep-residual font-bold text-primary">${residualDisplay}</td>
            <td class="cell-rep-checkbox">
                <label class="crm-custom-chk" title="Toggle Received Status">
                    <input type="checkbox" 
                        class="crm-chk-native rep-receiving-checkbox" 
                        data-combined-id="${client.id}" 
                        ${client.isReceived ? 'checked' : ''}>
                    <span class="crm-chk-box">
                        <i class="fa-solid fa-check"></i>
                    </span>
                </label>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Checkbox toggle listeners & AJAX database sync
    tbody.querySelectorAll('.rep-receiving-checkbox').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const cId = parseInt(e.target.getAttribute('data-combined-id'), 10);
            const isChecked = e.target.checked;
            const targetClient = getCombinedReportClients().find(c => c.id === cId);
            if (targetClient) {
                targetClient.isReceived = isChecked;
            }

            // AJAX sync with backend API
            if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
                fetch(`${window.APP_CONFIG.baseUrl}/api/reports/toggle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `id=${cId}&is_received=${isChecked ? 1 : 0}`
                }).catch(err => console.log('Report toggle offline sync', err));
            }
        });
    });

    // Client ledger click listener
    tbody.querySelectorAll('.client-name-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            const cId = parseInt(link.getAttribute('data-client-id'), 10);
            if (cId) loadClientLedger(cId);
        });
    });

    updateCombinedTotals();
}

function updateCombinedTotals() {
    if (isClientLedgerMode) return;
    const clients = getCombinedReportClients();
    const totalApprovalDue = clients.reduce((sum, c) => sum + (parseFloat(c.approvalPayment) || 0), 0);
    const totalResidualDue = clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);
    const thisWeekReceiving = totalApprovalDue + totalResidualDue;

    // Report Total Receiving strictly reflects this specific report's fresh target (Approval + Residual)
    const totalReceivingTarget = thisWeekReceiving;

    const inputTotalReceived = document.getElementById('inputTotalReceived');
    const enteredReceivedVal = (inputTotalReceived && inputTotalReceived.value !== '') 
        ? (parseFloat(inputTotalReceived.value) || 0) 
        : 0;

    const totalRemaining = Math.max(0, totalReceivingTarget - enteredReceivedVal);

    const tfootCombinedInitial = document.getElementById('tfootCombinedInitial');
    const tfootCombinedResidual = document.getElementById('tfootCombinedResidual');
    const tfootCombinedClientCount = document.getElementById('tfootCombinedClientCount');
    const tfootTotalReceivingTarget = document.getElementById('tfootTotalReceivingTarget');
    const tfootTotalRemaining = document.getElementById('tfootTotalRemaining');

    if (tfootCombinedInitial) tfootCombinedInitial.innerHTML = formatCurrency(totalApprovalDue);
    if (tfootCombinedResidual) tfootCombinedResidual.innerHTML = formatCurrency(totalResidualDue);
    if (tfootCombinedClientCount) tfootCombinedClientCount.textContent = `${clients.length} Clients`;
    if (tfootTotalReceivingTarget) tfootTotalReceivingTarget.innerHTML = formatCurrency(totalReceivingTarget);
    if (tfootTotalRemaining) tfootTotalRemaining.innerHTML = formatCurrency(totalRemaining);

    // Auto-sync totals if they changed
    if (window.APP_CONFIG && window.APP_CONFIG.activeReportSummary) {
        const summary = window.APP_CONFIG.activeReportSummary;
        if (summary.id && (Number(summary.total_receiving_target) !== Number(totalReceivingTarget) || Number(summary.total_remaining_balance) !== Number(totalRemaining))) {
            summary.total_receiving_target = totalReceivingTarget;
            summary.total_remaining_balance = totalRemaining;
            summary.total_received_entered = enteredReceivedVal;
            syncFooterWithDatabase();
        }
    }
}

// ============================================================================
// 3. FOOTER SYNC & WEEK SWITCHER
// ============================================================================

let saveFooterDebounce = null;

function doSyncFooter() {
    if (isClientLedgerMode) return;
    const inputTotalReceived = document.getElementById('inputTotalReceived');
    const reportSummary = window.APP_CONFIG ? window.APP_CONFIG.activeReportSummary : null;
    if (!reportSummary || !reportSummary.id) return;

    const clients = getCombinedReportClients();
    const totalApprovalDue = clients.reduce((sum, c) => sum + (parseFloat(c.approvalPayment) || 0), 0);
    const totalResidualDue = clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);
    const thisWeekReceiving = totalApprovalDue + totalResidualDue;

    const totalTarget = thisWeekReceiving;

    const enteredVal = inputTotalReceived && inputTotalReceived.value !== '' ? parseFloat(inputTotalReceived.value) || 0 : 0;
    const remaining = Math.max(0, totalTarget - enteredVal);

    reportSummary.total_receiving_target = totalTarget;
    reportSummary.total_received_entered = enteredVal;
    reportSummary.total_remaining_balance = remaining;

    if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
        fetch(`${window.APP_CONFIG.baseUrl}/api/reports/footer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `report_id=${encodeURIComponent(reportSummary.id)}&total_target=${encodeURIComponent(totalTarget)}&total_received=${encodeURIComponent(enteredVal)}&total_remaining=${encodeURIComponent(remaining)}`
        }).catch(err => console.log('Footer offline sync', err));
    }
}

function syncFooterWithDatabase() {
    clearTimeout(saveFooterDebounce);
    saveFooterDebounce = setTimeout(() => {
        doSyncFooter();
    }, 400);
}

function switchWeeklyCycle(startDate) {
    if (!startDate) return;

    if (isClientLedgerMode) {
        exitClientLedger(false);
    }

    // Immediately flush any pending footer edits before switching
    if (saveFooterDebounce) {
        clearTimeout(saveFooterDebounce);
        saveFooterDebounce = null;
        doSyncFooter();
    }

    if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
        const formData = new URLSearchParams();
        formData.append('start_date', startDate);

        fetch(`${window.APP_CONFIG.baseUrl}/api/reports/switch-week`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.success) {
                window.APP_CONFIG.activeWeek = data.week;
                window.APP_CONFIG.databaseReports = data.records;
                window.APP_CONFIG.activeReportSummary = data.summary;
                if (data.previous_remaining_list !== undefined) {
                    window.APP_CONFIG.previousRemainingList = data.previous_remaining_list;
                }
                if (data.previous_remaining !== undefined) {
                    window.APP_CONFIG.previousRemaining = parseFloat(data.previous_remaining) || 0;
                }

                combinedReportClients = null;

                // Update UI Header and Banner
                const cleanDateText = data.week.date_range || (data.week.title ? data.week.title.replace(/^Week\s+\d+:\s*/i, '') : '');
                const reportHeaderDate = document.getElementById('reportHeaderDate');
                if (reportHeaderDate) reportHeaderDate.textContent = cleanDateText;

                const bannerWorkWeek = document.getElementById('bannerWorkWeek');
                if (bannerWorkWeek) bannerWorkWeek.textContent = cleanDateText;

                const bannerAuditDate = document.getElementById('bannerAuditDate');
                if (bannerAuditDate) bannerAuditDate.textContent = data.week.audit_formatted;

                const bannerDueDate = document.getElementById('bannerDueDate');
                if (bannerDueDate) bannerDueDate.textContent = data.week.due_formatted;

                // Update inputTotalReceived
                const inputTotalReceived = document.getElementById('inputTotalReceived');
                if (inputTotalReceived) {
                    inputTotalReceived.value = (data.summary && data.summary.total_received_entered) 
                        ? Number(data.summary.total_received_entered) 
                        : '';
                }

                // Sync select dropdown & custom dropdown UI
                const selectWeeklyCycle = document.getElementById('selectWeeklyCycle');
                if (selectWeeklyCycle) selectWeeklyCycle.value = data.week.start_date;

                const currentWeekTriggerText = document.getElementById('currentWeekTriggerText');
                if (currentWeekTriggerText) currentWeekTriggerText.textContent = data.week.title;

                document.querySelectorAll('.week-dropdown-item').forEach(el => {
                    if (el.getAttribute('data-date') === data.week.start_date) {
                        el.classList.add('selected');
                    } else {
                        el.classList.remove('selected');
                    }
                });

                renderCombinedReportsTable();
            }
        })
        .catch(err => {
            console.error('Error switching week:', err);
            if (typeof showToast === 'function') {
                showToast('error', 'Network Error', 'Failed to switch weekly cycle.');
            }
        });
    }
}

// ============================================================================
// 4. EXPORT HANDLER & INITIALIZATION
// ============================================================================

// ============================================================================
// 4. CLIENT STATEMENT / LEDGER FEATURE (IN-TABLE DRILLDOWN)
// ============================================================================

async function loadClientLedger(clientId) {
    if (!clientId) return;
    try {
        const response = await fetch(`${window.APP_CONFIG.baseUrl}/api/reports/client-ledger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `client_id=${encodeURIComponent(clientId)}`
        });
        const data = await response.json();
        if (data && data.success && data.records) {
            // Save currently active weekly records before switching
            if (!isClientLedgerMode) {
                const inputTotalReceived = document.getElementById('inputTotalReceived');
                savedWeeklyReportState = {
                    clients: [...getCombinedReportClients()],
                    totalReceivedVal: inputTotalReceived ? inputTotalReceived.value : '0'
                };
            }
            isClientLedgerMode = true;
            activeClientLedgerData = data;
            renderClientLedger(data);
        } else {
            console.error('Failed to load client ledger:', data.error);
        }
    } catch (err) {
        console.error('Error fetching client ledger:', err);
    }
}

function renderClientLedger(data) {
    const tbody = document.getElementById('combinedTableBody');
    if (!tbody || !data || !data.records) return;

    // Show top banner with client name only
    const banner = document.getElementById('clientLedgerBanner');
    const nameEl = document.getElementById('ledgerClientName');
    const btnExitText = document.getElementById('btnExitLedgerText');

    if (banner && nameEl) {
        banner.style.display = 'block';
        nameEl.textContent = data.client.name;
        const currentWeekText = document.getElementById('currentWeekTriggerText')?.textContent || 'Weekly Report';
        if (btnExitText) btnExitText.textContent = `Back to ${currentWeekText}`;
    }

    tbody.innerHTML = '';

    const records = data.records;
    if (records.length === 0) {
        const emptyTr = document.createElement('tr');
        emptyTr.innerHTML = `<td colspan="6" class="text-center text-muted" style="padding: 30px;">No statement records found for this client.</td>`;
        tbody.appendChild(emptyTr);
        return;
    }

    let totalApproval = 0;
    let totalResidual = 0;
    let totalReceived = 0;

    records.forEach(rec => {
        const tr = document.createElement('tr');

        const appAmount = rec.approval_payment ? parseFloat(rec.approval_payment) : 0;
        const resAmount = rec.residual_payment ? parseFloat(rec.residual_payment) : 0;

        totalApproval += appAmount;
        totalResidual += resAmount;

        if (rec.is_received) {
            totalReceived += (appAmount + resAmount);
        }

        const approvalDisplay = appAmount > 0 
            ? formatCurrency(appAmount) 
            : `<span class="text-muted-dash">-</span>`;

        const residualDisplay = resAmount > 0 
            ? formatCurrency(resAmount) 
            : `<span class="text-muted-dash">-</span>`;

        tr.innerHTML = `
            <td class="cell-rep-date font-mono">${formatDateDisplay(rec.date)}</td>
            <td class="cell-rep-name font-bold">${escapeHtml(data.client.name)}</td>
            <td class="cell-rep-plan font-bold text-center">${rec.plan} Months</td>
            <td class="currency-val cell-rep-initial font-bold">${approvalDisplay}</td>
            <td class="currency-val cell-rep-residual font-bold text-primary">${residualDisplay}</td>
            <td class="cell-rep-checkbox text-center">
                <label class="crm-custom-chk" title="Status: ${escapeHtml(rec.receiving)}">
                    <input type="checkbox" 
                        class="crm-chk-native" 
                        ${rec.is_received ? 'checked' : ''} 
                        disabled>
                    <span class="crm-chk-box">
                        <i class="fa-solid fa-check"></i>
                    </span>
                </label>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Hide table footer when viewing single client ledger
    const tfoot = document.getElementById('combinedTableFoot');
    if (tfoot) {
        tfoot.style.display = 'none';
    }
}

function exitClientLedger(shouldReRender = true) {
    if (!isClientLedgerMode) return;
    isClientLedgerMode = false;
    activeClientLedgerData = null;

    const banner = document.getElementById('clientLedgerBanner');
    if (banner) banner.style.display = 'none';

    const tfoot = document.getElementById('combinedTableFoot');
    if (tfoot) {
        tfoot.style.display = '';
    }

    const inputTotalReceived = document.getElementById('inputTotalReceived');
    if (inputTotalReceived) inputTotalReceived.readOnly = false;

    if (shouldReRender && savedWeeklyReportState) {
        renderCombinedReportsTable();
        if (inputTotalReceived) {
            inputTotalReceived.value = savedWeeklyReportState.totalReceivedVal;
        }
        updateCombinedTotals();
    }
}

function updateReportLiveHeaderDate() {
    const el = document.getElementById('reportHeaderDate');
    if (!el) return;
    
    if (window.APP_CONFIG && window.APP_CONFIG.activeWeek) {
        const w = window.APP_CONFIG.activeWeek;
        el.textContent = w.date_range || (w.title ? w.title.replace(/^Week\s+\d+:\s*/i, '') : '');
        return;
    }

    if (window.APP_CONFIG && window.APP_CONFIG.activeReportSummary && window.APP_CONFIG.activeReportSummary.title) {
        el.textContent = window.APP_CONFIG.activeReportSummary.title.replace(/^Week\s+\d+:\s*/i, '');
        return;
    }
}

function initReportsPage() {
    updateReportLiveHeaderDate();

    // Set initial total received value from database if present
    const inputTotalReceived = document.getElementById('inputTotalReceived');
    if (inputTotalReceived && window.APP_CONFIG && window.APP_CONFIG.activeReportSummary) {
        const summary = window.APP_CONFIG.activeReportSummary;
        if (summary.total_received_entered !== null && summary.total_received_entered !== undefined) {
            inputTotalReceived.value = Number(summary.total_received_entered);
        }
    }

    renderCombinedReportsTable();

    // Custom Week Dropdown Trigger and Item handlers
    const dropdownWrapper = document.getElementById('reportWeekCustomDropdown');
    const btnTrigger = document.getElementById('btnWeekDropdownTrigger');

    if (btnTrigger && dropdownWrapper) {
        btnTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownWrapper.classList.toggle('open');
        });
    }

    document.querySelectorAll('.week-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const dateVal = item.getAttribute('data-date');
            const titleVal = item.getAttribute('data-title');
            
            const currentWeekTriggerText = document.getElementById('currentWeekTriggerText');
            if (currentWeekTriggerText && titleVal) currentWeekTriggerText.textContent = titleVal;

            const selectWeeklyCycle = document.getElementById('selectWeeklyCycle');
            if (selectWeeklyCycle) selectWeeklyCycle.value = dateVal;

            if (dropdownWrapper) dropdownWrapper.classList.remove('open');

            switchWeeklyCycle(dateVal);
        });
    });

    document.addEventListener('click', (e) => {
        if (dropdownWrapper && !dropdownWrapper.contains(e.target)) {
            dropdownWrapper.classList.remove('open');
        }
    });

    // Weekly Cycle Dropdown Change Listener (native fallback)
    const selectWeeklyCycle = document.getElementById('selectWeeklyCycle');
    if (selectWeeklyCycle) {
        selectWeeklyCycle.addEventListener('change', (e) => {
            switchWeeklyCycle(e.target.value);
        });
    }

    // Previous / Next Week Navigation Buttons
    const btnPrevWeek = document.getElementById('btnPrevWeek');
    const btnNextWeek = document.getElementById('btnNextWeek');
    if (btnPrevWeek && selectWeeklyCycle) {
        btnPrevWeek.addEventListener('click', () => {
            if (selectWeeklyCycle.selectedIndex < selectWeeklyCycle.options.length - 1) {
                selectWeeklyCycle.selectedIndex++;
                switchWeeklyCycle(selectWeeklyCycle.value);
            }
        });
    }
    if (btnNextWeek && selectWeeklyCycle) {
        btnNextWeek.addEventListener('click', () => {
            if (selectWeeklyCycle.selectedIndex > 0) {
                selectWeeklyCycle.selectedIndex--;
                switchWeeklyCycle(selectWeeklyCycle.value);
            }
        });
    }

    // Event listener for manual Total Received input box
    if (inputTotalReceived) {
        inputTotalReceived.addEventListener('input', () => {
            updateCombinedTotals();
            syncFooterWithDatabase();
        });
    }

    // Exit Client Ledger Button Handler
    const btnExitLedger = document.getElementById('btnExitLedger');
    if (btnExitLedger) {
        btnExitLedger.addEventListener('click', () => {
            exitClientLedger(true);
        });
    }

    // Export Master Report
    const btnExportCombinedReport = document.getElementById('btnExportCombinedReport');
    if (btnExportCombinedReport) {
        btnExportCombinedReport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getCombinedReportClients(), null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            const weekTitle = (window.APP_CONFIG && window.APP_CONFIG.activeWeek && window.APP_CONFIG.activeWeek.title) 
                ? window.APP_CONFIG.activeWeek.title.replace(/[^a-zA-Z0-9]/g, '_') 
                : 'weekly_report';
            downloadAnchor.setAttribute("download", `report_${weekTitle}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            if (typeof showToast === 'function') {
                showToast('info', 'Report Exported', 'Weekly report downloaded.');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const viewReports = document.getElementById('viewReports');
    if (viewReports) {
        initReportsPage();
    }
});
