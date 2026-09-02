/**
 * Client Management CRM - Clients Page Logic
 * Handles client directory table, live filtering & search, inline double-click editing,
 * inline row entry, 6-month spreadsheet tabs, pagination, and client CRUD modals.
 */

// ============================================================================
// 1. SELECT OPTIONS & AGENT INITIALIZATION
// ============================================================================

function populateSelectOptions() {
    const formPlan = document.getElementById('formPlan');
    const tblPlan = document.getElementById('tblPlan');
    const filterPlan = document.getElementById('filterPlan');
    const tblDate = document.getElementById('tblDate');

    // 1. Form Plans
    if (formPlan) {
        formPlan.innerHTML = '';
        availablePlans.forEach(months => {
            const optionForm = document.createElement('option');
            optionForm.value = months;
            optionForm.textContent = `${months} Months`;
            formPlan.appendChild(optionForm);
        });
    }

    // 2. Inline Table Plans
    if (tblPlan) {
        tblPlan.innerHTML = '<option value="">-- Plan --</option>';
        availablePlans.forEach(months => {
            const optionTbl = document.createElement('option');
            optionTbl.value = months;
            optionTbl.textContent = `${months} ${months === 1 ? 'Month' : 'Months'}`;
            tblPlan.appendChild(optionTbl);
        });
    }

    // Set Default Today Date for Inline Entry
    if (tblDate && !tblDate.value) {
        tblDate.value = new Date().toISOString().split('T')[0];
    }

    // 3. Filter Plans (on client list page)
    if (filterPlan) {
        filterPlan.innerHTML = '<option value="">All Plans</option>';
        availablePlans.forEach(months => {
            const optionFilter = document.createElement('option');
            optionFilter.value = months;
            optionFilter.textContent = `${months} ${months === 1 ? 'Month' : 'Months'}`;
            filterPlan.appendChild(optionFilter);
        });
    }

    // 4. Agents (Form Dropdowns & Datalists)
    const formSmartAgent = document.getElementById('formSmartAgent');
    const formSuperAgent = document.getElementById('formSuperAgent');
    const formCloser = document.getElementById('formCloser');

    if (formSmartAgent) populateAgentDropdown(formSmartAgent, state.smartAgents);
    if (formSuperAgent) populateAgentDropdown(formSuperAgent, state.superAgents);
    if (formCloser) populateAgentDropdown(formCloser, state.closers);
}

// ============================================================================
// 2. CLIENT FILTERING, SORTING & RENDERING
// ============================================================================

function getFilteredAndSortedClients() {
    const { search, status, plan, receiving, columnFilters = {}, selectedMonth = 'all' } = state.filters;
    const query = search ? search.trim().toLowerCase() : '';

    let filtered = state.clients.filter(c => {
        // 0. Spreadsheet Month Tab Filter
        if (selectedMonth && selectedMonth !== 'all') {
            if (!c.date || !c.date.startsWith(selectedMonth)) {
                return false;
            }
        }

        // 1. Global top search query
        if (query) {
            const name = (c.clientName || '').toLowerCase();
            const connector = (c.connector || '').toLowerCase();
            const smart = (c.smartAgent || '').toLowerCase();
            const superA = (c.superAgent || '').toLowerCase();
            const closer = (c.closer || '').toLowerCase();

            const matchSearch = name.includes(query) ||
                connector.includes(query) ||
                smart.includes(query) ||
                superA.includes(query) ||
                closer.includes(query);

            if (!matchSearch) return false;
        }

        // 2. Top toolbar filters
        if (status && c.status !== status) return false;
        if (plan && String(c.plan) !== String(plan)) return false;
        if (receiving && c.receiving !== receiving) return false;

        // 3. Header column filters
        for (const [colKey, filterVal] of Object.entries(columnFilters)) {
            if (!filterVal) continue;

            // Multi-Select Array Filter
            if (Array.isArray(filterVal)) {
                if (filterVal.length === 0) continue;
                const normalizedSet = filterVal.map(v => String(v).toLowerCase());

                if (colKey === 'plan') {
                    if (!normalizedSet.includes(String(c.plan).toLowerCase())) return false;
                } else if (colKey === 'status') {
                    if (!normalizedSet.includes((c.status || '').toLowerCase())) return false;
                } else if (colKey === 'receiving') {
                    if (!normalizedSet.includes((c.receiving || '').toLowerCase())) return false;
                } else if (colKey === 'smartAgent') {
                    if (!normalizedSet.includes((c.smartAgent || '').toLowerCase())) return false;
                } else if (colKey === 'superAgent') {
                    if (!normalizedSet.includes((c.superAgent || '').toLowerCase())) return false;
                } else if (colKey === 'closer') {
                    if (!normalizedSet.includes((c.closer || '').toLowerCase())) return false;
                } else if (colKey === 'connector') {
                    if (!normalizedSet.includes((c.connector || '').toLowerCase())) return false;
                }
                continue;
            }

            // Text/Date/Number String Filter
            const fVal = String(filterVal).trim().toLowerCase();
            if (!fVal) continue;

            if (colKey === 'date') {
                if (!c.date || !c.date.toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'clientName') {
                if (!c.clientName || !c.clientName.toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'connector') {
                if (!c.connector || !c.connector.toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'smartAgent') {
                if (!c.smartAgent || c.smartAgent.toLowerCase() !== fVal) return false;
            } else if (colKey === 'superAgent') {
                if (!c.superAgent || c.superAgent.toLowerCase() !== fVal) return false;
            } else if (colKey === 'closer') {
                if (!c.closer || c.closer.toLowerCase() !== fVal) return false;
            } else if (colKey === 'status') {
                if (!c.status || c.status.toLowerCase() !== fVal) return false;
            } else if (colKey === 'plan') {
                if (String(c.plan).toLowerCase() !== fVal) return false;
            } else if (colKey === 'monthly') {
                if (!String(c.monthly || '').toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'initialPayment') {
                if (!String(c.initialPayment || '').toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'initialPaymentDate') {
                if (!c.initialPaymentDate || !c.initialPaymentDate.toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'residual') {
                if (!String(c.residual || '').toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'approvalAmount') {
                if (!String(c.approvalAmount || '').toLowerCase().includes(fVal)) return false;
            } else if (colKey === 'receiving') {
                if (!c.receiving || c.receiving.toLowerCase() !== fVal) return false;
            }
        }

        return true;
    });

    const { column, order } = state.sorting;
    if (column) {
        filtered.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            if (['monthly', 'initialPayment', 'residual', 'approvalAmount', 'plan'].includes(column)) {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
                return order === 'asc' ? valA - valB : valB - valA;
            }

            valA = (valA || '').toString().toLowerCase();
            valB = (valB || '').toString().toLowerCase();

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
}

function renderClientTable() {
    const clientsTableBody = document.getElementById('clientsTableBody');
    const clientsTable = document.getElementById('clientsTable');
    const emptyState = document.getElementById('emptyState');
    const paginationFooter = document.getElementById('tablePaginationFooter');
    const tableResultsCount = document.getElementById('tableResultsCount');

    if (!clientsTableBody) return;

    const filteredClients = getFilteredAndSortedClients();
    const totalRecords = filteredClients.length;
    const { currentPage, rowsPerPage } = state.pagination;

    const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    state.pagination.currentPage = safePage;

    const startIndex = (safePage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
    const paginatedItems = filteredClients.slice(startIndex, endIndex);

    if (tableResultsCount) {
        tableResultsCount.textContent = `Showing ${totalRecords === 0 ? 0 : startIndex + 1} to ${endIndex} of ${totalRecords} client${totalRecords === 1 ? '' : 's'}`;
    }

    if (totalRecords === 0) {
        if (clientsTable) clientsTable.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        if (paginationFooter) paginationFooter.style.display = 'none';
    } else {
        if (clientsTable) clientsTable.style.display = 'table';
        if (emptyState) emptyState.style.display = 'none';
        if (paginationFooter) paginationFooter.style.display = 'flex';

        clientsTableBody.innerHTML = '';
        paginatedItems.forEach(client => {
            if (state.editingClientId === client.id) {
                // Inline Editing Row
                const tr = document.createElement('tr');
                tr.className = 'inline-editing-row';
                tr.id = `editRow_${client.id}`;
                tr.innerHTML = `
                    <td>
                        <input type="date" class="tbl-input" id="editDate_${client.id}" value="${client.date || ''}">
                    </td>
                    <td>
                        <input type="text" class="tbl-input" id="editName_${client.id}" value="${escapeHtml(client.clientName || '')}">
                    </td>
                    <td>
                        <input type="text" class="tbl-input" id="editConnector_${client.id}" value="${escapeHtml(client.connector || '')}">
                    </td>
                    <td>
                        <div class="agent-select-wrapper" data-role="smart" data-target="editSmart_${client.id}">
                            <input type="hidden" id="editSmart_${client.id}" value="${escapeHtml(client.smartAgent || '')}">
                            <button type="button" class="btn-agent-select-trigger" id="btnTrigger_editSmart_${client.id}" onclick="openAgentPopover(this, 'smart', 'editSmart_${client.id}')">
                                <span class="agent-select-label">${escapeHtml(client.smartAgent || '-- Select --')}</span>
                                <i class="fa-solid fa-chevron-down caret-icon"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="agent-select-wrapper" data-role="super" data-target="editSuper_${client.id}">
                            <input type="hidden" id="editSuper_${client.id}" value="${escapeHtml(client.superAgent || '')}">
                            <button type="button" class="btn-agent-select-trigger" id="btnTrigger_editSuper_${client.id}" onclick="openAgentPopover(this, 'super', 'editSuper_${client.id}')">
                                <span class="agent-select-label">${escapeHtml(client.superAgent || '-- Select --')}</span>
                                <i class="fa-solid fa-chevron-down caret-icon"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="agent-select-wrapper" data-role="closer" data-target="editCloser_${client.id}">
                            <input type="hidden" id="editCloser_${client.id}" value="${escapeHtml(client.closer || '')}">
                            <button type="button" class="btn-agent-select-trigger" id="btnTrigger_editCloser_${client.id}" onclick="openAgentPopover(this, 'closer', 'editCloser_${client.id}')">
                                <span class="agent-select-label">${escapeHtml(client.closer || '-- Select --')}</span>
                                <i class="fa-solid fa-chevron-down caret-icon"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <select class="tbl-select" id="editStatus_${client.id}">
                            <option value="Submit" ${client.status === 'Submit' ? 'selected' : ''}>Submit</option>
                            <option value="Charged" ${client.status === 'Charged' ? 'selected' : ''}>Charged</option>
                            <option value="Kick Back" ${client.status === 'Kick Back' ? 'selected' : ''}>Kick Back</option>
                        </select>
                    </td>
                    <td>
                        <select class="tbl-select" id="editPlan_${client.id}">
                            ${availablePlans.map(p => `<option value="${p}" ${p == client.plan ? 'selected' : ''}>${p} ${p === 1 ? 'Month' : 'Months'}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <input type="number" step="0.01" class="tbl-input" id="editMonthly_${client.id}" value="${client.monthly || 0}">
                    </td>
                    <td>
                        <input type="number" step="0.01" class="tbl-input" id="editInitial_${client.id}" value="${client.initialPayment || 0}">
                    </td>
                    <td>
                        <input type="date" class="tbl-input" id="editInitialDate_${client.id}" value="${client.initialPaymentDate || ''}">
                    </td>
                    <td>
                        <div class="tbl-calc-badge" id="editResidual_${client.id}">${formatCurrency(client.residual)}</div>
                    </td>
                    <td>
                        <div class="tbl-calc-badge text-main" id="editApproval_${client.id}">${formatCurrency(client.approvalAmount)}</div>
                    </td>
                    <td>
                        <select class="tbl-select" id="editReceiving_${client.id}">
                            <option value="Pending" ${client.receiving === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Received" ${client.receiving === 'Received' ? 'selected' : ''}>Received</option>
                        </select>
                    </td>
                `;
                clientsTableBody.appendChild(tr);

                const initialInp = tr.querySelector(`#editInitial_${client.id}`);
                if (initialInp) {
                    initialInp.addEventListener('input', (e) => {
                        const val = e.target.value;
                        const calc = calculateApprovalAndResidual(val);
                        const apprEl = tr.querySelector(`#editApproval_${client.id}`);
                        const resEl = tr.querySelector(`#editResidual_${client.id}`);
                        if (apprEl) apprEl.innerHTML = formatCurrency(calc.approval);
                        if (resEl) resEl.innerHTML = formatCurrency(calc.residual);
                    });
                }

                tr.querySelectorAll('input, select').forEach(inp => {
                    inp.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            saveInlineEdit(client.id);
                        } else if (e.key === 'Escape') {
                            cancelInlineEdit();
                        }
                    });
                });
            } else {
                // Normal Row with Double Click to Edit
                const tr = document.createElement('tr');
                tr.title = "Double-click to edit row";
                tr.ondblclick = (e) => {
                    const cell = e.target.closest('td');
                    const colIndex = cell ? Array.from(tr.children).indexOf(cell) : -1;
                    startInlineEdit(client.id, colIndex);
                };
                tr.innerHTML = `
                    <td>${formatDateDisplay(client.date)}</td>
                    <td>
                        <strong class="client-name-text">${escapeHtml(client.clientName)}</strong>
                    </td>
                    <td>${escapeHtml(client.connector || '-')}</td>
                    <td>${getSmartAgentBadgeHtml(client.smartAgent)}</td>
                    <td>${getSuperAgentBadgeHtml(client.superAgent)}</td>
                    <td>${getCloserBadgeHtml(client.closer)}</td>
                    <td>${getStatusBadgeHtml(client.status)}</td>
                    <td>${client.plan ? `${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}` : '<span class="text-muted-dash">-</span>'}</td>
                    <td class="currency-cell">${formatCurrency(client.monthly)}</td>
                    <td class="currency-cell">${formatCurrency(client.initialPayment)}</td>
                    <td>${formatDateDisplay(client.initialPaymentDate)}</td>
                    <td class="currency-cell text-primary">${formatCurrency(client.residual)}</td>
                    <td class="currency-cell">${formatCurrency(client.approvalAmount)}</td>
                    <td>${getReceivingBadgeHtml(client.receiving)}</td>
                `;
                clientsTableBody.appendChild(tr);
            }
        });

        renderPagination(totalPages, safePage, startIndex, endIndex, totalRecords);
    }

    updateHeaderSortIndicators();
    updateThFilterIndicators();
    renderMonthTabs();
}

function startInlineEdit(clientId, targetColIndex) {
    state.editingClientId = clientId;
    renderClientTable();

    if (typeof targetColIndex === 'number' && targetColIndex >= 0) {
        setTimeout(() => {
            const editRow = document.getElementById(`editRow_${clientId}`);
            if (editRow && editRow.children[targetColIndex]) {
                const targetInp = editRow.children[targetColIndex].querySelector('input, select, button');
                if (targetInp) {
                    targetInp.focus({ preventScroll: true });
                }
            }
        }, 30);
    }
}

function cancelInlineEdit() {
    state.editingClientId = null;
    renderClientTable();
}

function saveInlineEdit(clientId) {
    const nameInp = document.getElementById(`editName_${clientId}`);
    if (!nameInp) return;
    const nameVal = nameInp.value.trim();

    if (!nameVal) {
        nameInp.classList.add('is-invalid');
        nameInp.focus();
        showToast('error', 'Validation Error', 'Client name is required.');
        return;
    }

    const dateInp = document.getElementById(`editDate_${clientId}`);
    const connectorInp = document.getElementById(`editConnector_${clientId}`);
    const smartInp = document.getElementById(`editSmart_${clientId}`);
    const superInp = document.getElementById(`editSuper_${clientId}`);
    const closerInp = document.getElementById(`editCloser_${clientId}`);
    const statusInp = document.getElementById(`editStatus_${clientId}`);
    const planInp = document.getElementById(`editPlan_${clientId}`);
    const monthlyInp = document.getElementById(`editMonthly_${clientId}`);
    const initialInp = document.getElementById(`editInitial_${clientId}`);
    const initialDateInp = document.getElementById(`editInitialDate_${clientId}`);
    const receivingInp = document.getElementById(`editReceiving_${clientId}`);

    const monthlyNum = (monthlyInp && monthlyInp.value !== '') ? parseFloat(monthlyInp.value) : null;
    const initialNum = (initialInp && initialInp.value !== '') ? parseFloat(initialInp.value) : null;

    if (initialNum !== null && initialNum < 250) {
        if (initialInp) {
            initialInp.classList.add('is-invalid');
            initialInp.focus();
        }
        showToast('error', 'Validation Error', 'Initial Payment must be at least $250.');
        return;
    }
    if (initialInp) initialInp.classList.remove('is-invalid');

    const planVal = (planInp && planInp.value !== '') ? parseInt(planInp.value) : null;
    const calc = initialNum !== null ? calculateApprovalAndResidual(initialNum) : { approval: null, residual: null };

    const clientIdx = state.clients.findIndex(c => c.id === clientId);
    if (clientIdx !== -1) {
        state.clients[clientIdx] = {
            ...state.clients[clientIdx],
            date: dateInp ? dateInp.value : state.clients[clientIdx].date,
            clientName: nameVal.toUpperCase(),
            connector: connectorInp ? connectorInp.value.trim() : '',
            smartAgent: smartInp ? smartInp.value : '',
            superAgent: superInp ? superInp.value : '',
            closer: closerInp ? closerInp.value : '',
            status: statusInp ? statusInp.value : '',
            plan: planVal,
            monthly: monthlyNum,
            initialPayment: initialNum,
            initialPaymentDate: initialDateInp ? initialDateInp.value : '',
            approvalAmount: calc.approval,
            residual: calc.residual,
            receiving: receivingInp ? receivingInp.value : ''
        };

        ensureAgentExists('smart', smartInp ? smartInp.value : '');
        ensureAgentExists('super', superInp ? superInp.value : '');
        ensureAgentExists('closer', closerInp ? closerInp.value : '');

        saveClients();

        // AJAX update to database API
        if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
            const formData = new URLSearchParams();
            formData.append('id', clientId);
            formData.append('date', state.clients[clientIdx].date);
            formData.append('clientName', state.clients[clientIdx].clientName);
            formData.append('connector', state.clients[clientIdx].connector);
            formData.append('smartAgent', state.clients[clientIdx].smartAgent);
            formData.append('superAgent', state.clients[clientIdx].superAgent);
            formData.append('closer', state.clients[clientIdx].closer);
            formData.append('status', state.clients[clientIdx].status);
            formData.append('plan', state.clients[clientIdx].plan);
            formData.append('monthly', state.clients[clientIdx].monthly);
            formData.append('initialPayment', state.clients[clientIdx].initialPayment);
            formData.append('initialPaymentDate', state.clients[clientIdx].initialPaymentDate);
            formData.append('residual', state.clients[clientIdx].residual);
            formData.append('approvalAmount', state.clients[clientIdx].approvalAmount);
            formData.append('receiving', state.clients[clientIdx].receiving);

            fetch(`${window.APP_CONFIG.baseUrl}/api/clients/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            }).catch(err => console.log('Client update offline sync', err));
        }
    }

    state.editingClientId = null;
    renderClientTable();
    showToast('success', 'Changes Saved', `"${nameVal.toUpperCase()}" updated successfully.`);
}

// ============================================================================
// 3. PAGINATION & SPREADSHEET MONTH TABS
// ============================================================================

function renderPagination(totalPages, currentPage, startIndex, endIndex, totalRecords) {
    const tableResultsCount = document.getElementById('tableResultsCount');
    const paginationControls = document.getElementById('paginationControls');

    if (tableResultsCount) {
        tableResultsCount.innerHTML = `Showing <strong>${totalRecords === 0 ? 0 : startIndex + 1} &ndash; ${endIndex}</strong> of <strong>${totalRecords}</strong> clients`;
    }
    if (!paginationControls) return;

    paginationControls.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-arrow-page';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.title = 'Previous Page';
    prevBtn.addEventListener('click', () => {
        if (state.pagination.currentPage > 1) {
            state.pagination.currentPage--;
            renderClientTable();
        }
    });
    paginationControls.appendChild(prevBtn);

    if (totalPages > 1) {
        for (let p = 1; p <= totalPages; p++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-page-number ${p === currentPage ? 'active' : ''}`;
            pageBtn.textContent = p;
            pageBtn.title = `Page ${p}`;
            pageBtn.addEventListener('click', () => {
                if (state.pagination.currentPage !== p) {
                    state.pagination.currentPage = p;
                    renderClientTable();
                }
            });
            paginationControls.appendChild(pageBtn);
        }
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-arrow-page';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages || totalRecords === 0;
    nextBtn.title = 'Next Page';
    nextBtn.addEventListener('click', () => {
        if (state.pagination.currentPage < totalPages) {
            state.pagination.currentPage++;
            renderClientTable();
        }
    });
    paginationControls.appendChild(nextBtn);
}

function generateMonthTabsList() {
    let baseDate = new Date();
    if (state.clients && state.clients.length > 0) {
        const validDates = state.clients.map(c => c.date).filter(Boolean).sort();
        if (validDates.length > 0) {
            const latest = validDates[validDates.length - 1];
            const [y, m] = latest.split('-');
            if (y && m) {
                baseDate = new Date(parseInt(y), parseInt(m) - 1, 1);
            }
        }
    }

    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const monthKey = `${yyyy}-${mm}`;
        const monthName = d.toLocaleString('en-US', { month: 'short' });
        const label = `${monthName} ${yyyy}`;
        months.push({ key: monthKey, label: label });
    }

    return months;
}

function renderMonthTabs() {
    const container = document.getElementById('tableSheetTabsContainer');
    if (!container) return;

    container.innerHTML = '';
    const months = generateMonthTabsList();
    const activeKey = state.filters.selectedMonth || 'all';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `sheet-tab-btn ${activeKey === 'all' ? 'active' : ''}`;
    allBtn.innerHTML = `<i class="fa-solid fa-layer-group"></i><span>All</span>`;
    allBtn.addEventListener('click', () => {
        state.filters.selectedMonth = 'all';
        state.pagination.currentPage = 1;
        renderClientTable();
    });
    container.appendChild(allBtn);

    months.forEach(m => {
        const count = state.clients.filter(c => c.date && c.date.startsWith(m.key)).length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `sheet-tab-btn ${activeKey === m.key ? 'active' : ''}`;
        btn.innerHTML = `
            <i class="fa-regular fa-calendar"></i>
            <span>${escapeHtml(m.label)}</span>
            ${count > 0 ? `<span class="sheet-tab-count">${count}</span>` : ''}
        `;
        btn.addEventListener('click', () => {
            state.filters.selectedMonth = m.key;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
        container.appendChild(btn);
    });
}

function updateHeaderSortIndicators() {
    const clientsTable = document.getElementById('clientsTable');
    if (!clientsTable) return;
    const ths = clientsTable.querySelectorAll('th.sortable');
    ths.forEach(th => {
        const col = th.getAttribute('data-sort');
        const icon = th.querySelector('.sort-caret') || th.querySelector('.sort-icon');
        th.classList.remove('sort-asc', 'sort-desc');

        if (col === state.sorting.column) {
            if (state.sorting.order === 'asc') {
                th.classList.add('sort-asc');
                if (icon) icon.className = 'fa-solid fa-sort-up sort-caret';
            } else {
                th.classList.add('sort-desc');
                if (icon) icon.className = 'fa-solid fa-sort-down sort-caret';
            }
        } else {
            if (icon) icon.className = 'fa-solid fa-sort sort-caret';
        }
    });
}

// ============================================================================
// 4. INLINE ADD CLIENT ROW & CRUD OPERATIONS
// ============================================================================

function showInlineAddRow() {
    const inlineRow = document.getElementById('inlineAddRow');
    const clientsTable = document.getElementById('clientsTable');
    const emptyState = document.getElementById('emptyState');
    const tblDate = document.getElementById('tblDate');
    const tblClientName = document.getElementById('tblClientName');

    if (inlineRow) {
        if (state.pagination.currentPage !== 1) {
            state.pagination.currentPage = 1;
            renderClientTable();
        }

        inlineRow.classList.remove('d-none');
        inlineRow.style.display = 'table-row';
        if (clientsTable) clientsTable.style.display = 'table';
        if (emptyState) emptyState.style.display = 'none';

        if (tblDate && !tblDate.value) {
            tblDate.value = new Date().toISOString().split('T')[0];
        }

        setTimeout(() => {
            if (tblClientName) {
                tblClientName.focus();
                tblClientName.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 60);
    }
}

function hideInlineAddRow() {
    const inlineRow = document.getElementById('inlineAddRow');
    if (inlineRow) {
        inlineRow.style.display = 'none';
    }
}

function openAddModal() {
    if (document.getElementById('inlineAddRow')) {
        showInlineAddRow();
        return;
    }
}

function updateInlineTableCalculations() {
    const tblInitialPayment = document.getElementById('tblInitialPayment');
    const tblApprovalAmount = document.getElementById('tblApprovalAmount');
    const tblResidual = document.getElementById('tblResidual');

    if (!tblInitialPayment) return;
    const paymentVal = tblInitialPayment.value;
    const calc = calculateApprovalAndResidual(paymentVal);

    if (tblApprovalAmount) tblApprovalAmount.innerHTML = formatCurrency(calc.approval);
    if (tblResidual) tblResidual.innerHTML = formatCurrency(calc.residual);
}

function handleInlineSaveClient() {
    const tblClientName = document.getElementById('tblClientName');
    if (!tblClientName) return;
    const nameVal = tblClientName.value.trim();

    if (!nameVal) {
        tblClientName.classList.add('is-invalid');
        tblClientName.focus();
        showToast('error', 'Validation Error', 'Please enter a Client Name.');
        return;
    }
    tblClientName.classList.remove('is-invalid');

    const tblDate = document.getElementById('tblDate');
    const tblConnector = document.getElementById('tblConnector');
    const tblSmartAgent = document.getElementById('tblSmartAgent');
    const tblSuperAgent = document.getElementById('tblSuperAgent');
    const tblCloser = document.getElementById('tblCloser');
    const tblStatus = document.getElementById('tblStatus');
    const tblPlan = document.getElementById('tblPlan');
    const tblMonthly = document.getElementById('tblMonthly');
    const tblInitialPayment = document.getElementById('tblInitialPayment');
    const tblInitialPaymentDate = document.getElementById('tblInitialPaymentDate');
    const tblReceiving = document.getElementById('tblReceiving');

    const dateVal = tblDate && tblDate.value ? tblDate.value : new Date().toISOString().split('T')[0];
    const connectorVal = tblConnector ? tblConnector.value.trim() : '';
    const smartAgentVal = tblSmartAgent ? tblSmartAgent.value : '';
    const superAgentVal = tblSuperAgent ? tblSuperAgent.value : '';
    const closerVal = tblCloser ? tblCloser.value : '';
    const statusVal = tblStatus ? tblStatus.value : '';
    const planVal = tblPlan && tblPlan.value ? parseInt(tblPlan.value) : null;
    const monthlyVal = (tblMonthly && tblMonthly.value !== '') ? parseFloat(tblMonthly.value) : null;
    const initialPaymentVal = (tblInitialPayment && tblInitialPayment.value !== '') ? parseFloat(tblInitialPayment.value) : null;

    if (initialPaymentVal !== null && initialPaymentVal < 250) {
        if (tblInitialPayment) {
            tblInitialPayment.classList.add('is-invalid');
            tblInitialPayment.focus();
        }
        showToast('error', 'Validation Error', 'Initial Payment must be at least $250.');
        return;
    }
    if (tblInitialPayment) tblInitialPayment.classList.remove('is-invalid');

    const initialPaymentDateVal = tblInitialPaymentDate ? tblInitialPaymentDate.value : '';

    const calc = initialPaymentVal !== null ? calculateApprovalAndResidual(initialPaymentVal) : { approval: null, residual: null };
    const receivingVal = tblReceiving ? tblReceiving.value : '';

    const newClient = {
        id: Date.now(),
        date: dateVal,
        clientName: nameVal.toUpperCase(),
        connector: connectorVal,
        smartAgent: smartAgentVal,
        superAgent: superAgentVal,
        closer: closerVal,
        status: statusVal,
        plan: planVal,
        monthly: monthlyVal,
        initialPayment: initialPaymentVal,
        initialPaymentDate: initialPaymentDateVal,
        approvalAmount: calc.approval,
        residual: calc.residual,
        receiving: receivingVal
    };

    ensureAgentExists('smart', smartAgentVal);
    ensureAgentExists('super', superAgentVal);
    ensureAgentExists('closer', closerVal);

    state.clients.unshift(newClient);
    state.pagination.currentPage = 1;
    saveClients();
    renderClientTable();
    updateNavBadgeCount();

    // AJAX Create to Database API to get real MySQL ID
    if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
        const formData = new URLSearchParams();
        formData.append('date', newClient.date);
        formData.append('clientName', newClient.clientName);
        formData.append('connector', newClient.connector);
        formData.append('smartAgent', newClient.smartAgent);
        formData.append('superAgent', newClient.superAgent);
        formData.append('closer', newClient.closer);
        formData.append('status', newClient.status);
        formData.append('plan', newClient.plan);
        formData.append('monthly', newClient.monthly);
        formData.append('initialPayment', newClient.initialPayment);
        formData.append('initialPaymentDate', newClient.initialPaymentDate);
        formData.append('residual', newClient.residual);
        formData.append('approvalAmount', newClient.approvalAmount);
        formData.append('receiving', newClient.receiving);

        fetch(`${window.APP_CONFIG.baseUrl}/api/clients/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        })
        .then(res => res.json())
        .then(res => {
            if (res && res.id) {
                newClient.id = Number(res.id);
                saveClients();
                renderClientTable();
            }
        })
        .catch(err => console.log('Client create offline sync', err));
    }

    tblClientName.value = '';
    if (tblConnector) tblConnector.value = '';
    if (tblSmartAgent) tblSmartAgent.value = '';
    if (tblSuperAgent) tblSuperAgent.value = '';
    if (tblCloser) tblCloser.value = '';

    const smartLabel = document.querySelector('#btnTrigger_tblSmartAgent .agent-select-label');
    const superLabel = document.querySelector('#btnTrigger_tblSuperAgent .agent-select-label');
    const closerLabel = document.querySelector('#btnTrigger_tblCloser .agent-select-label');
    if (smartLabel) smartLabel.textContent = '-- Select --';
    if (superLabel) superLabel.textContent = '-- Select --';
    if (closerLabel) closerLabel.textContent = '-- Select --';

    if (tblMonthly) tblMonthly.value = '';
    if (tblInitialPayment) tblInitialPayment.value = '';
    if (tblInitialPaymentDate) tblInitialPaymentDate.value = '';
    const tblApprovalAmount = document.getElementById('tblApprovalAmount');
    const tblResidual = document.getElementById('tblResidual');
    if (tblApprovalAmount) tblApprovalAmount.textContent = '$0';
    if (tblResidual) tblResidual.textContent = '$0';

    hideInlineAddRow();
    showToast('success', 'Client Saved', `"${newClient.clientName}" registered into table.`);
}

function handleDeletePrompt(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;

    state.clientToDeleteId = clientId;
    const deleteClientName = document.getElementById('deleteClientName');
    const deleteModal = document.getElementById('deleteModal');
    if (deleteClientName) deleteClientName.textContent = `"${client.clientName}"`;
    openModal(deleteModal);
}

function confirmDeleteClient() {
    if (!state.clientToDeleteId) return;

    const delId = state.clientToDeleteId;
    const index = state.clients.findIndex(c => c.id === delId);
    if (index !== -1) {
        const deleted = state.clients.splice(index, 1)[0];
        saveClients();
        renderClientTable();
        showToast('success', 'Client Deleted', `${deleted.clientName} was successfully removed.`);

        // AJAX Delete from Database API
        if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
            fetch(`${window.APP_CONFIG.baseUrl}/api/clients/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${delId}`
            }).catch(err => console.log('Client delete offline sync', err));
        }
    }

    const deleteModal = document.getElementById('deleteModal');
    closeModal(deleteModal);
    state.clientToDeleteId = null;
}

// ============================================================================
// 5. CLIENTS PAGE EVENT BINDINGS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const clientsTableBody = document.getElementById('clientsTableBody');
    if (!clientsTableBody) return;

    populateSelectOptions();
    renderClientTable();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
        showInlineAddRow();
    }

    const btnOpenAddModal = document.getElementById('btnOpenAddModal');
    const btnEmptyAddClient = document.getElementById('btnEmptyAddClient');
    if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', showInlineAddRow);
    if (btnEmptyAddClient) btnEmptyAddClient.addEventListener('click', showInlineAddRow);

    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            if (searchClearBtn) searchClearBtn.style.display = e.target.value ? 'block' : 'none';
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            state.filters.search = '';
            searchClearBtn.style.display = 'none';
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', (e) => {
            state.filters.status = e.target.value;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    const filterPlan = document.getElementById('filterPlan');
    if (filterPlan) {
        filterPlan.addEventListener('change', (e) => {
            state.filters.plan = e.target.value;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    const filterReceiving = document.getElementById('filterReceiving');
    if (filterReceiving) {
        filterReceiving.addEventListener('change', (e) => {
            state.filters.receiving = e.target.value;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    const btnResetFilters = document.getElementById('btnResetFilters');
    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (searchClearBtn) searchClearBtn.style.display = 'none';
            if (filterStatus) filterStatus.value = '';
            if (filterPlan) filterPlan.value = '';
            if (filterReceiving) filterReceiving.value = '';
            state.filters = { search: '', status: '', plan: '', receiving: '', columnFilters: {}, selectedMonth: 'all' };
            state.pagination.currentPage = 1;
            renderClientTable();
            updateThFilterIndicators();
            renderMonthTabs();
            showToast('info', 'Filters Reset', 'Showing all client records.');
        });
    }

    const selectRowsPerPage = document.getElementById('selectRowsPerPage');
    if (selectRowsPerPage) {
        selectRowsPerPage.addEventListener('change', (e) => {
            state.pagination.rowsPerPage = parseInt(e.target.value) || 10;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    // Inline Table Events
    const tblInitialPayment = document.getElementById('tblInitialPayment');
    if (tblInitialPayment) {
        tblInitialPayment.addEventListener('input', updateInlineTableCalculations);
    }

    const inlineInputs = [
        document.getElementById('tblDate'),
        document.getElementById('tblClientName'),
        document.getElementById('tblConnector'),
        document.getElementById('tblSmartAgent'),
        document.getElementById('tblSuperAgent'),
        document.getElementById('tblCloser'),
        document.getElementById('tblStatus'),
        document.getElementById('tblPlan'),
        document.getElementById('tblMonthly'),
        document.getElementById('tblInitialPayment'),
        document.getElementById('tblInitialPaymentDate'),
        document.getElementById('tblReceiving')
    ];

    inlineInputs.forEach(inp => {
        if (inp) {
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInlineSaveClient();
                } else if (e.key === 'Escape') {
                    hideInlineAddRow();
                }
            });
        }
    });

    // Delete Modal Events
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalCloseBtn = document.getElementById('deleteModalCloseBtn');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

    if (deleteModalCloseBtn) deleteModalCloseBtn.addEventListener('click', () => closeModal(deleteModal));
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', () => closeModal(deleteModal));
    if (deleteConfirmBtn) deleteConfirmBtn.addEventListener('click', confirmDeleteClient);

    // Auto-save on click-outside
    document.addEventListener('mousedown', (e) => {
        if (currentOpenPopover) {
            if (currentOpenPopover.element && currentOpenPopover.element.contains(e.target)) return;
            if (currentOpenPopover.triggerBtn && currentOpenPopover.triggerBtn.contains(e.target)) return;
        }

        if (e.target.closest('.modal-container') || e.target.closest('.modal-backdrop.active') || e.target.closest('.toast-container')) {
            return;
        }

        const tableScroll = document.querySelector('.table-scroll-container');
        if (tableScroll) {
            const rect = tableScroll.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= (rect.top + tableScroll.clientHeight - 8) && e.clientY <= (rect.bottom + 8)) {
                return;
            }
            if (e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= (rect.left + tableScroll.clientWidth - 8) && e.clientX <= (rect.right + 8)) {
                return;
            }
        }

        if (e.target.closest('thead')) {
            return;
        }

        if (state.editingClientId) {
            const editRow = document.getElementById(`editRow_${state.editingClientId}`);
            if (editRow && !editRow.contains(e.target)) {
                const currentId = state.editingClientId;
                saveInlineEdit(currentId);
            }
        }

        const inlineRow = document.getElementById('inlineAddRow');
        const btnOpenModal = document.getElementById('btnOpenAddModal');
        const btnHeaderAdd = document.querySelector('.btn-header-add');

        if (inlineRow && inlineRow.style.display === 'table-row') {
            const isInsideAddRow = inlineRow.contains(e.target);
            const isAddButton = (btnOpenModal && btnOpenModal.contains(e.target)) ||
                                (btnHeaderAdd && btnHeaderAdd.contains(e.target));

            if (!isInsideAddRow && !isAddButton) {
                const clientNameInput = document.getElementById('tblClientName');
                const nameVal = clientNameInput ? clientNameInput.value.trim() : '';

                if (nameVal) {
                    handleInlineSaveClient();
                } else {
                    hideInlineAddRow();
                }
            }
        }
    });
});
