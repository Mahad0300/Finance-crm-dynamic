/**
 * Client Management CRM - Shared Common Engine
 * Contains shared state, localStorage management, calculation rules,
 * popover systems (Agents & Filters), badges, modals, and toasts.
 */

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
    CLIENTS: 'clientRecords',
    SMART_AGENTS: 'crm_smartAgents',
    SUPER_AGENTS: 'crm_superAgents',
    CLOSERS: 'crm_closers'
};

// Configurable Approval Rules (Applies when Initial Payment >= $250)
const approvalRules = [
    { min: 250, max: 400, approval: 900 },
    { min: 400.01, max: 500, approval: 1000 },
    { min: 500.01, max: 100000, approval: 1100 }
];

// Available Plans (1 to 120 Months)
const availablePlans = Array.from({ length: 120 }, (_, i) => i + 1);

// Dynamic Agent Default Lists (Loaded from Database via APP_CONFIG)
const defaultSmartAgents = [];
const defaultSuperAgents = [];
const defaultClosers = [];
const sampleClients = [];

// ============================================================================
// 2. APPLICATION GLOBAL STATE
// ============================================================================

const state = {
    clients: [],
    smartAgents: [],
    superAgents: [],
    closers: [],
    currentPageType: 'dashboard',
    filters: {
        search: '',
        status: '',
        plan: '',
        receiving: '',
        columnFilters: {},
        selectedMonth: 'all'
    },
    sorting: {
        column: null,
        order: 'asc'
    },
    pagination: {
        currentPage: 1,
        rowsPerPage: 10
    },
    clientToDeleteId: null,
    editingClientId: null,
    agentTargetRole: null
};

// ============================================================================
// 3. STORAGE & INITIALIZATION HELPERS
// ============================================================================

function initStorage() {
    // 1. Clients Live Sync from Database
    if (window.APP_CONFIG && Array.isArray(window.APP_CONFIG.databaseClients)) {
        state.clients = window.APP_CONFIG.databaseClients.map(c => ({
            id: Number(c.id),
            date: c.date || '',
            clientName: c.client_name || c.clientName || '',
            connector: c.connector_name || c.connector || '',
            smartAgent: c.smart_agent_name || c.smartAgent || '',
            superAgent: c.super_agent_name || c.superAgent || '',
            closer: c.closer_name || c.closer || '',
            status: c.status || '',
            plan: c.plan ? Number(c.plan) : null,
            monthly: (c.monthly !== null && c.monthly !== undefined && c.monthly !== '') ? Number(c.monthly) : null,
            initialPayment: (c.initial_payment !== null && c.initial_payment !== undefined && c.initial_payment !== '') ? Number(c.initial_payment) : null,
            initialPaymentDate: c.initial_payment_date || c.initialPaymentDate || null,
            residual: (c.residual !== null && c.residual !== undefined && c.residual !== '') ? Number(c.residual) : null,
            approvalAmount: (c.approval_amount !== null && c.approval_amount !== undefined && c.approval_amount !== '') ? Number(c.approval_amount) : null,
            receiving: c.receiving || ''
        }));
        saveClients();
    } else {
        const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        if (storedClients) {
            try {
                state.clients = JSON.parse(storedClients);
            } catch (e) {
                state.clients = [];
            }
        } else {
            state.clients = [];
        }
    }

    // 2. Agents Live Sync from Database
    if (window.APP_CONFIG && window.APP_CONFIG.databaseAgents) {
        state.smartAgents = Array.isArray(window.APP_CONFIG.databaseAgents.smart) && window.APP_CONFIG.databaseAgents.smart.length > 0
            ? window.APP_CONFIG.databaseAgents.smart
            : getStoredList(STORAGE_KEYS.SMART_AGENTS, []);
        state.superAgents = Array.isArray(window.APP_CONFIG.databaseAgents.super) && window.APP_CONFIG.databaseAgents.super.length > 0
            ? window.APP_CONFIG.databaseAgents.super
            : getStoredList(STORAGE_KEYS.SUPER_AGENTS, []);
        state.closers = Array.isArray(window.APP_CONFIG.databaseAgents.closer) && window.APP_CONFIG.databaseAgents.closer.length > 0
            ? window.APP_CONFIG.databaseAgents.closer
            : getStoredList(STORAGE_KEYS.CLOSERS, []);
    } else {
        state.smartAgents = getStoredList(STORAGE_KEYS.SMART_AGENTS, []);
        state.superAgents = getStoredList(STORAGE_KEYS.SUPER_AGENTS, []);
        state.closers = getStoredList(STORAGE_KEYS.CLOSERS, []);
    }
}

function getStoredList(key, defaultList) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        localStorage.setItem(key, JSON.stringify(defaultList));
        return [...defaultList];
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [...defaultList];
    }
}

function saveClients() {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(state.clients));
    updateNavBadgeCount();
}

function saveAgents(roleKey, list) {
    localStorage.setItem(roleKey, JSON.stringify(list));
}

// ============================================================================
// 4. FINANCIAL & RULE CALCULATION ENGINE
// ============================================================================

function calculateApprovalAndResidual(paymentVal) {
    if (paymentVal === '' || paymentVal === null || paymentVal === undefined || isNaN(paymentVal)) {
        return { approval: null, residual: null, matched: false, ruleText: 'Enter initial payment' };
    }

    const num = parseFloat(paymentVal);
    if (num < 250) {
        return { approval: null, residual: null, matched: false, ruleText: 'Payment below $250 has no approval slab' };
    }

    // Match configurable approvalRules
    const rule = approvalRules.find(r => num >= r.min && num <= r.max);

    if (rule) {
        const approval = rule.approval;
        const residual = Number((approval * 0.05).toFixed(2));
        return {
            approval: approval,
            residual: residual,
            matched: true,
            ruleText: `Matched rule ($${rule.min} - $${rule.max}) → $${formatCurrency(approval)}`
        };
    } else {
        return {
            approval: null,
            residual: null,
            matched: false,
            ruleText: 'No approval rule matched for this range'
        };
    }
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '' || isNaN(amount)) return '<span class="text-muted-dash">-</span>';
    const num = Number(amount);
    if (num <= 0) return '<span class="text-muted-dash">-</span>';
    if (num % 1 === 0) {
        return '$' + num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
    return '$' + num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '<span class="text-muted-dash">-</span>';
    try {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return escapeHtml(dateStr);
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return escapeHtml(dateStr);
    }
}

function getInitials(name) {
    if (!name || name === '-') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

// ============================================================================
// 5. STATUS & AGENT BADGES
// ============================================================================

function getStatusBadgeHtml(status) {
    if (!status || status === '-' || status === '') {
        return `<span class="text-muted-dash">-</span>`;
    }
    if (status === 'Submit') {
        return `<span class="status-pill pill-submit">Submit</span>`;
    } else if (status === 'Charged') {
        return `<span class="status-pill pill-charged">Charged</span>`;
    } else if (status === 'Kick Back') {
        return `<span class="status-pill pill-kickback">Kick Back</span>`;
    }
    return `<span class="status-pill pill-pending">${escapeHtml(status)}</span>`;
}

function getReceivingBadgeHtml(receiving) {
    if (!receiving || receiving === '-' || receiving === '') {
        return `<span class="text-muted-dash">-</span>`;
    }
    if (receiving === 'Received') {
        return `<span class="status-pill pill-received">Received</span>`;
    }
    if (receiving === 'Pending') {
        return `<span class="status-pill pill-pending">Pending</span>`;
    }
    return `<span class="status-pill pill-pending">${escapeHtml(receiving)}</span>`;
}

function getSmartAgentBadgeHtml(name) {
    if (!name || name === '-') return `<span class="text-muted-dash">-</span>`;
    return `<span class="badge-agent badge-smart-agent">${escapeHtml(name)}</span>`;
}

function getSuperAgentBadgeHtml(name) {
    if (!name || name === '-') return `<span class="text-muted-dash">-</span>`;
    return `<span class="badge-agent badge-super-agent">${escapeHtml(name)}</span>`;
}

function getCloserBadgeHtml(name) {
    if (!name || name === '-') return `<span class="text-muted-dash">-</span>`;
    return `<span class="badge-agent badge-closer">${escapeHtml(name)}</span>`;
}

// ============================================================================
// 6. DYNAMIC AGENT POPOVER CONTROLLER
// ============================================================================

let currentOpenPopover = null;

function closeAgentPopover() {
    if (currentOpenPopover) {
        if (currentOpenPopover.element && currentOpenPopover.element.parentElement) {
            currentOpenPopover.element.parentElement.removeChild(currentOpenPopover.element);
        }
        if (currentOpenPopover.triggerBtn) {
            currentOpenPopover.triggerBtn.classList.remove('active');
        }
        currentOpenPopover = null;
    }
}

document.addEventListener('click', (e) => {
    if (currentOpenPopover) {
        if (!currentOpenPopover.element.contains(e.target) && !currentOpenPopover.triggerBtn.contains(e.target)) {
            closeAgentPopover();
        }
    }
});

window.addEventListener('resize', closeAgentPopover);
window.addEventListener('scroll', (e) => {
    if (currentOpenPopover && currentOpenPopover.element && currentOpenPopover.element.contains(e.target)) {
        return;
    }
    closeAgentPopover();
}, true);

function openAgentPopover(triggerBtn, roleType, targetInputId) {
    if (currentOpenPopover && currentOpenPopover.targetInputId === targetInputId) {
        closeAgentPopover();
        return;
    }
    closeAgentPopover();

    const targetInput = document.getElementById(targetInputId);
    if (!targetInput) return;

    const rect = triggerBtn.getBoundingClientRect();

    const popover = document.createElement('div');
    popover.className = 'agent-popover-dropdown';
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${rect.left}px`;
    popover.style.width = `${Math.max(rect.width, 210)}px`;

    popover.innerHTML = `
        <input type="text" class="agent-popover-search" placeholder="Type to filter or add..." autofocus>
        <div class="agent-popover-options"></div>
    `;

    document.body.appendChild(popover);
    triggerBtn.classList.add('active');

    const searchInput = popover.querySelector('.agent-popover-search');
    const optionsContainer = popover.querySelector('.agent-popover-options');

    function renderOptions(filterText = '') {
        optionsContainer.innerHTML = '';
        const q = filterText.trim().toLowerCase();
        const activeList = roleType === 'smart' ? state.smartAgents : roleType === 'super' ? state.superAgents : state.closers;

        // 1. None / Clear option
        if (!q) {
            const noneItem = document.createElement('div');
            const isNoneSelected = !targetInput.value;
            noneItem.className = `agent-popover-item ${isNoneSelected ? 'selected' : ''}`;
            noneItem.innerHTML = `
                <div class="agent-item-left">
                    <span class="agent-check-icon">${isNoneSelected ? '<i class="fa-solid fa-check"></i>' : ''}</span>
                    <span class="agent-item-name agent-clear-item">-- None / Clear --</span>
                </div>
            `;
            noneItem.addEventListener('click', () => {
                selectAgentValue('');
            });
            optionsContainer.appendChild(noneItem);
        }

        // 2. Filtered Agent list
        const filtered = activeList.filter(name => name.toLowerCase().includes(q));
        filtered.forEach(name => {
            const item = document.createElement('div');
            const isSelected = name.toLowerCase() === (targetInput.value || '').toLowerCase();
            item.className = `agent-popover-item ${isSelected ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="agent-item-left">
                    <span class="agent-check-icon">${isSelected ? '<i class="fa-solid fa-check"></i>' : ''}</span>
                    <span class="agent-item-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
                </div>
                <button type="button" class="agent-item-del-btn" title="Delete &quot;${escapeHtml(name)}&quot;" aria-label="Delete agent">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;

            item.addEventListener('click', (e) => {
                if (e.target.closest('.agent-item-del-btn')) return;
                selectAgentValue(name);
            });

            const delBtn = item.querySelector('.agent-item-del-btn');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteAgentFromList(roleType, name);
                    if ((targetInput.value || '').toLowerCase() === name.toLowerCase()) {
                        targetInput.value = '';
                        const labelSpan = triggerBtn.querySelector('.agent-select-label');
                        if (labelSpan) labelSpan.textContent = '-- Select --';
                    }
                    renderOptions(searchInput.value);
                });
            }

            optionsContainer.appendChild(item);
        });

        // 3. If typed name is not in list, show "+ Add [name]" item
        if (q && !activeList.some(n => n.toLowerCase() === q)) {
            const addBtn = document.createElement('div');
            addBtn.className = 'agent-popover-add-btn';
            addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> <span>Add "<strong>${escapeHtml(filterText.trim())}</strong>"</span>`;
            addBtn.addEventListener('click', () => {
                createAndSelectAgent(filterText.trim());
            });
            optionsContainer.appendChild(addBtn);
        }
    }

    function selectAgentValue(val) {
        targetInput.value = val;
        const labelSpan = triggerBtn.querySelector('.agent-select-label');
        if (labelSpan) labelSpan.textContent = val || '-- Select --';
        closeAgentPopover();
    }

    function createAndSelectAgent(name) {
        const clean = name.trim();
        if (!clean) return;
        ensureAgentExists(roleType, clean);
        selectAgentValue(clean);
        showToast('success', 'Agent Added', `"${clean}" added to ${roleType} agent options.`);
    }

    searchInput.addEventListener('input', (e) => {
        renderOptions(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const text = searchInput.value.trim();
            if (text) {
                const activeList = roleType === 'smart' ? state.smartAgents : roleType === 'super' ? state.superAgents : state.closers;
                const matched = activeList.find(n => n.toLowerCase() === text.toLowerCase());
                if (matched) {
                    selectAgentValue(matched);
                } else {
                    createAndSelectAgent(text);
                }
            } else {
                closeAgentPopover();
            }
        } else if (e.key === 'Escape') {
            closeAgentPopover();
        }
    });

    renderOptions('');
    setTimeout(() => searchInput.focus(), 25);

    currentOpenPopover = {
        element: popover,
        triggerBtn: triggerBtn,
        targetInputId: targetInputId
    };
}

function ensureAgentExists(role, name) {
    if (!name || typeof name !== 'string') return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === '-') return;

    if (role === 'smart' && !state.smartAgents.includes(trimmed)) {
        state.smartAgents.push(trimmed);
        saveAgents(STORAGE_KEYS.SMART_AGENTS, state.smartAgents);
    } else if (role === 'super' && !state.superAgents.includes(trimmed)) {
        state.superAgents.push(trimmed);
        saveAgents(STORAGE_KEYS.SUPER_AGENTS, state.superAgents);
    } else if (role === 'closer' && !state.closers.includes(trimmed)) {
        state.closers.push(trimmed);
        saveAgents(STORAGE_KEYS.CLOSERS, state.closers);
    }
}

function deleteAgentFromList(role, name) {
    if (!name || typeof name !== 'string') return;
    const trimmed = name.trim();
    if (!trimmed) return;

    if (role === 'smart') {
        state.smartAgents = state.smartAgents.filter(n => n.toLowerCase() !== trimmed.toLowerCase());
        saveAgents(STORAGE_KEYS.SMART_AGENTS, state.smartAgents);
    } else if (role === 'super') {
        state.superAgents = state.superAgents.filter(n => n.toLowerCase() !== trimmed.toLowerCase());
        saveAgents(STORAGE_KEYS.SUPER_AGENTS, state.superAgents);
    } else if (role === 'closer') {
        state.closers = state.closers.filter(n => n.toLowerCase() !== trimmed.toLowerCase());
        saveAgents(STORAGE_KEYS.CLOSERS, state.closers);
    }
    showToast('info', 'Agent Deleted', `"${trimmed}" removed from ${role} agent options.`);
}

function populateAgentDropdown(selectEl, list, selectedValue = '') {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select --';
    selectEl.appendChild(defaultOpt);

    list.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        if (name === selectedValue) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

// ============================================================================
// 7. FLOATING TABLE HEADER FILTER POPOVER SYSTEM
// ============================================================================

let currentOpenFilterPopover = null;

function closeThFilterPopover() {
    if (currentOpenFilterPopover) {
        if (currentOpenFilterPopover.element && currentOpenFilterPopover.element.parentElement) {
            currentOpenFilterPopover.element.parentElement.removeChild(currentOpenFilterPopover.element);
        }
        currentOpenFilterPopover = null;
    }
}

document.addEventListener('click', (e) => {
    if (currentOpenFilterPopover) {
        if (!currentOpenFilterPopover.element.contains(e.target) && !currentOpenFilterPopover.triggerBtn.contains(e.target)) {
            closeThFilterPopover();
        }
    }
});

window.addEventListener('resize', closeThFilterPopover);
window.addEventListener('scroll', (e) => {
    if (currentOpenFilterPopover && currentOpenFilterPopover.element && currentOpenFilterPopover.element.contains(e.target)) {
        return;
    }
    closeThFilterPopover();
}, true);

function openThFilterPopover(triggerBtn, colKey, colTitle) {
    if (currentOpenFilterPopover && currentOpenFilterPopover.colKey === colKey) {
        closeThFilterPopover();
        return;
    }
    closeThFilterPopover();
    closeAgentPopover();

    const rect = triggerBtn.getBoundingClientRect();
    const isReportsPage = !!document.getElementById('reportTable');
    const activeFilters = isReportsPage 
        ? ((typeof reportsState !== 'undefined' && reportsState.columnFilters) ? reportsState.columnFilters : {})
        : (state.filters.columnFilters = state.filters.columnFilters || {});

    const rawVal = activeFilters[colKey];
    
    // Normalize into array for multi-select
    let selectedValues = [];
    if (Array.isArray(rawVal)) {
        selectedValues = [...rawVal];
    } else if (typeof rawVal === 'string' && rawVal.trim()) {
        selectedValues = [rawVal.trim()];
    }

    const isCategory = ['status', 'plan', 'receiving', 'smartAgent', 'superAgent', 'closer', 'connector'].includes(colKey);
    const isDate = ['date', 'initialPaymentDate'].includes(colKey);

    const popover = document.createElement('div');
    popover.className = 'th-filter-popover';
    popover.style.top = `${rect.bottom + 4}px`;
    
    const popoverWidth = isDate ? 250 : 220;
    let leftPos = rect.left - 20;
    if (leftPos + popoverWidth > window.innerWidth - 10) {
        leftPos = window.innerWidth - popoverWidth - 10;
    }
    popover.style.left = `${Math.max(10, leftPos)}px`;
    popover.style.width = `${popoverWidth}px`;
    if (isDate) popover.classList.add('th-date-popover');

    let hasActiveFilter = false;
    if (Array.isArray(rawVal)) {
        hasActiveFilter = rawVal.length > 0;
    } else if (rawVal && typeof rawVal === 'object') {
        hasActiveFilter = (rawVal.mode === 'single' && !!rawVal.date) || 
                          (rawVal.mode === 'range' && (!!rawVal.from || !!rawVal.to));
    } else if (typeof rawVal === 'string') {
        hasActiveFilter = rawVal.trim().length > 0;
    }

    let contentHtml = `
        <div class="th-filter-header">
            <span class="th-filter-title"><i class="fa-solid fa-filter th-filter-icon"></i> Filter ${escapeHtml(colTitle)}</span>
            ${hasActiveFilter ? `<button type="button" class="th-filter-clear-btn" id="btnThClearFilter">Clear</button>` : ''}
        </div>
    `;

    let dateMode = 'single';
    if (isCategory) {
        contentHtml += `
            <input type="text" class="th-filter-input" placeholder="Search values..." id="thFilterSearch">
            <div class="th-filter-quick-bar">
                <button type="button" class="th-filter-quick-btn" id="btnThSelectAll">Select All</button>
                <button type="button" class="th-filter-quick-btn" id="btnThDeselectAll">Deselect All</button>
            </div>
            <div class="th-filter-list" id="thFilterList"></div>
            <div class="th-filter-footer">
                <button type="button" class="th-filter-action-btn primary" id="btnThApplyMultiFilter">Apply</button>
                <button type="button" class="th-filter-action-btn secondary" id="btnThCancelMultiFilter">Cancel</button>
            </div>
        `;
    } else if (isDate) {
        let singleVal = '';
        let fromVal = '';
        let toVal = '';

        if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
            singleVal = rawVal.date || '';
            fromVal = rawVal.from || '';
            toVal = rawVal.to || '';
            dateMode = rawVal.mode || (fromVal || toVal ? 'range' : 'single');
        } else if (typeof rawVal === 'string' && rawVal.trim()) {
            singleVal = rawVal.trim();
        }

        contentHtml += `
            <div class="th-date-tabs">
                <button type="button" class="th-date-tab-btn ${dateMode === 'single' ? 'active' : ''}" data-tab="single">Single Date</button>
                <button type="button" class="th-date-tab-btn ${dateMode === 'range' ? 'active' : ''}" data-tab="range">Date Range</button>
            </div>
            <div class="th-date-pane ${dateMode === 'single' ? 'active' : ''}" id="thDatePaneSingle">
                <label class="th-date-label">Select Date</label>
                <input type="date" class="th-filter-input" id="thFilterDateSingle" value="${escapeHtml(singleVal)}">
            </div>
            <div class="th-date-pane ${dateMode === 'range' ? 'active' : ''}" id="thDatePaneRange">
                <div class="th-date-range-row">
                    <div class="th-date-field">
                        <label class="th-date-label">From Date</label>
                        <input type="date" class="th-filter-input" id="thFilterDateFrom" value="${escapeHtml(fromVal)}">
                    </div>
                    <div class="th-date-field">
                        <label class="th-date-label">To Date</label>
                        <input type="date" class="th-filter-input" id="thFilterDateTo" value="${escapeHtml(toVal)}">
                    </div>
                </div>
            </div>
            <div class="th-filter-btn-row" style="margin-top: 0.35rem;">
                <button type="button" class="th-filter-action-btn primary" id="btnThApplyDateFilter">Apply</button>
                <button type="button" class="th-filter-action-btn secondary" id="btnThResetDateFilter">Clear</button>
            </div>
        `;
    } else {
        const textVal = typeof rawVal === 'string' ? rawVal : '';
        contentHtml += `
            <div class="th-filter-form">
                <input type="text" class="th-filter-input" placeholder="Search ${colTitle}..." id="thFilterInput" value="${escapeHtml(textVal)}" autofocus>
                <div class="th-filter-btn-row">
                    <button type="button" class="th-filter-action-btn primary" id="btnThApplyFilter">Apply</button>
                    <button type="button" class="th-filter-action-btn secondary" id="btnThResetFilter">Clear</button>
                </div>
            </div>
        `;
    }

    popover.innerHTML = contentHtml;
    document.body.appendChild(popover);

    const btnClear = popover.querySelector('#btnThClearFilter');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            applyColumnFilter(colKey, []);
            closeThFilterPopover();
        });
    }

    if (isCategory) {
        const searchInput = popover.querySelector('#thFilterSearch');
        const listContainer = popover.querySelector('#thFilterList');
        const btnSelectAll = popover.querySelector('#btnThSelectAll');
        const btnDeselectAll = popover.querySelector('#btnThDeselectAll');
        const btnApplyMulti = popover.querySelector('#btnThApplyMultiFilter');
        const btnCancelMulti = popover.querySelector('#btnThCancelMultiFilter');

        // Dynamic unique values list
        let uniqueValues = [];
        if (isReportsPage && typeof getStaticReportClients === 'function') {
            const reportData = getStaticReportClients();
            if (colKey === 'plan') {
                uniqueValues = Array.from(new Set(reportData.map(c => String(c.plan)))).sort((a,b) => parseInt(a) - parseInt(b));
            } else if (colKey === 'receiving') {
                uniqueValues = ['Pending', 'Received'];
            } else if (colKey === 'smartAgent') {
                uniqueValues = Array.from(new Set(reportData.map(c => c.smartAgent).filter(Boolean)));
            } else if (colKey === 'superAgent') {
                uniqueValues = Array.from(new Set(reportData.map(c => c.superAgent).filter(Boolean)));
            } else if (colKey === 'closer') {
                uniqueValues = Array.from(new Set(reportData.map(c => c.closer).filter(Boolean)));
            } else if (colKey === 'connector') {
                uniqueValues = Array.from(new Set(reportData.map(c => c.connector).filter(Boolean)));
            }
        } else {
            if (colKey === 'status') {
                uniqueValues = ['Submit', 'Charged', 'Kick Back'];
            } else if (colKey === 'plan') {
                uniqueValues = availablePlans.map(p => String(p));
            } else if (colKey === 'receiving') {
                uniqueValues = ['Pending', 'Received'];
            } else if (colKey === 'smartAgent') {
                uniqueValues = Array.from(new Set([...state.smartAgents, ...state.clients.map(c => c.smartAgent).filter(Boolean)]));
            } else if (colKey === 'superAgent') {
                uniqueValues = Array.from(new Set([...state.superAgents, ...state.clients.map(c => c.superAgent).filter(Boolean)]));
            } else if (colKey === 'closer') {
                uniqueValues = Array.from(new Set([...state.closers, ...state.clients.map(c => c.closer).filter(Boolean)]));
            } else if (colKey === 'connector') {
                uniqueValues = Array.from(new Set(state.clients.map(c => c.connector).filter(Boolean)));
            }
        }

        let currentSelectedSet = new Set(selectedValues.map(v => String(v).toLowerCase()));

        function updateApplyButtonLabel() {
            if (btnApplyMulti) {
                btnApplyMulti.textContent = currentSelectedSet.size > 0 ? `Apply (${currentSelectedSet.size})` : 'Apply';
            }
        }

        function renderCategoryList(q = '') {
            listContainer.innerHTML = '';
            const filteredVals = uniqueValues.filter(v => (v || '').toLowerCase().includes(q.toLowerCase()));

            if (filteredVals.length === 0) {
                listContainer.innerHTML = `<div class="th-filter-no-match">No matching options</div>`;
                return;
            }

            filteredVals.forEach(val => {
                const isChecked = currentSelectedSet.has(String(val).toLowerCase());
                const item = document.createElement('label');
                item.className = `th-filter-checkbox-item ${isChecked ? 'checked-item' : ''}`;
                
                let displayLabel = val;
                if (colKey === 'plan') displayLabel = `${val} ${val == 1 ? 'Month' : 'Months'}`;

                item.innerHTML = `
                    <input type="checkbox" value="${escapeHtml(val)}" ${isChecked ? 'checked' : ''}>
                    <span>${escapeHtml(displayLabel)}</span>
                `;

                const chk = item.querySelector('input[type="checkbox"]');
                chk.addEventListener('change', (e) => {
                    const norm = String(val).toLowerCase();
                    if (e.target.checked) {
                        currentSelectedSet.add(norm);
                        item.classList.add('checked-item');
                    } else {
                        currentSelectedSet.delete(norm);
                        item.classList.remove('checked-item');
                    }
                    updateApplyButtonLabel();
                });

                listContainer.appendChild(item);
            });
        }

        if (btnSelectAll) {
            btnSelectAll.addEventListener('click', () => {
                uniqueValues.forEach(v => currentSelectedSet.add(String(v).toLowerCase()));
                renderCategoryList(searchInput ? searchInput.value : '');
                updateApplyButtonLabel();
            });
        }

        if (btnDeselectAll) {
            btnDeselectAll.addEventListener('click', () => {
                currentSelectedSet.clear();
                renderCategoryList(searchInput ? searchInput.value : '');
                updateApplyButtonLabel();
            });
        }

        if (btnApplyMulti) {
            btnApplyMulti.addEventListener('click', () => {
                const finalSelected = uniqueValues.filter(v => currentSelectedSet.has(String(v).toLowerCase()));
                applyColumnFilter(colKey, finalSelected);
                closeThFilterPopover();
            });
        }

        if (btnCancelMulti) {
            btnCancelMulti.addEventListener('click', closeThFilterPopover);
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => renderCategoryList(e.target.value));
            setTimeout(() => searchInput.focus(), 25);
        }

        renderCategoryList('');
        updateApplyButtonLabel();
    } else if (isDate) {
        let activeTab = dateMode;
        const tabBtns = popover.querySelectorAll('.th-date-tab-btn');
        const paneSingle = popover.querySelector('#thDatePaneSingle');
        const paneRange = popover.querySelector('#thDatePaneRange');
        const inpSingle = popover.querySelector('#thFilterDateSingle');
        const inpFrom = popover.querySelector('#thFilterDateFrom');
        const inpTo = popover.querySelector('#thFilterDateTo');
        const btnApplyDate = popover.querySelector('#btnThApplyDateFilter');
        const btnResetDate = popover.querySelector('#btnThResetDateFilter');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.getAttribute('data-tab');
                tabBtns.forEach(b => b.classList.toggle('active', b === btn));
                if (paneSingle) paneSingle.classList.toggle('active', activeTab === 'single');
                if (paneRange) paneRange.classList.toggle('active', activeTab === 'range');
            });
        });

        const doApplyDate = () => {
            if (activeTab === 'single') {
                const sDate = inpSingle ? inpSingle.value.trim() : '';
                if (sDate) {
                    applyColumnFilter(colKey, { mode: 'single', date: sDate });
                } else {
                    applyColumnFilter(colKey, null);
                }
            } else {
                const f = inpFrom ? inpFrom.value.trim() : '';
                const t = inpTo ? inpTo.value.trim() : '';
                if (f || t) {
                    applyColumnFilter(colKey, { mode: 'range', from: f, to: t });
                } else {
                    applyColumnFilter(colKey, null);
                }
            }
            closeThFilterPopover();
        };

        if (btnApplyDate) btnApplyDate.addEventListener('click', doApplyDate);
        if (btnResetDate) {
            btnResetDate.addEventListener('click', () => {
                applyColumnFilter(colKey, null);
                closeThFilterPopover();
            });
        }
    } else {
        const inp = popover.querySelector('#thFilterInput');
        const btnApply = popover.querySelector('#btnThApplyFilter');
        const btnReset = popover.querySelector('#btnThResetFilter');

        const doApply = () => {
            const val = inp ? inp.value.trim() : '';
            applyColumnFilter(colKey, val);
            closeThFilterPopover();
        };

        if (btnApply) btnApply.addEventListener('click', doApply);
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                applyColumnFilter(colKey, '');
                closeThFilterPopover();
            });
        }
        if (inp) {
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    doApply();
                } else if (e.key === 'Escape') {
                    closeThFilterPopover();
                }
            });
            setTimeout(() => inp.focus(), 25);
        }
    }

    currentOpenFilterPopover = {
        element: popover,
        triggerBtn: triggerBtn,
        colKey: colKey
    };
}

function applyColumnFilter(colKey, value) {
    const isReportsPage = !!document.getElementById('reportTable');

    if (isReportsPage && typeof reportsState !== 'undefined') {
        if (!reportsState.columnFilters) reportsState.columnFilters = {};
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if ((value.mode === 'single' && value.date) || (value.mode === 'range' && (value.from || value.to))) {
                reportsState.columnFilters[colKey] = value;
            } else {
                delete reportsState.columnFilters[colKey];
            }
        } else if (Array.isArray(value)) {
            if (value.length > 0) {
                reportsState.columnFilters[colKey] = value;
                if (colKey === 'receiving') {
                    const statusSel = document.getElementById('repStatusFilter');
                    if (statusSel) statusSel.value = value.length === 1 ? value[0] : 'all';
                }
            } else {
                delete reportsState.columnFilters[colKey];
                if (colKey === 'receiving') {
                    const statusSel = document.getElementById('repStatusFilter');
                    if (statusSel) statusSel.value = 'all';
                }
            }
        } else if (typeof value === 'string') {
            if (value.trim()) {
                reportsState.columnFilters[colKey] = value.trim();
                if (colKey === 'initialPaymentDate') {
                    reportsState.selectedDate = value.trim();
                    const dateInp = document.getElementById('repDateInput');
                    if (dateInp) dateInp.value = value.trim();
                    if (typeof updateReportsQuickPills === 'function') updateReportsQuickPills();
                }
            } else {
                delete reportsState.columnFilters[colKey];
            }
        } else {
            delete reportsState.columnFilters[colKey];
        }
        if (typeof renderReportsPage === 'function') renderReportsPage();
        updateThFilterIndicators();
        return;
    }

    if (!state.filters.columnFilters) state.filters.columnFilters = {};
    const filterStatus = document.getElementById('filterStatus');
    const filterPlan = document.getElementById('filterPlan');
    const filterReceiving = document.getElementById('filterReceiving');

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ((value.mode === 'single' && value.date) || (value.mode === 'range' && (value.from || value.to))) {
            state.filters.columnFilters[colKey] = value;
        } else {
            delete state.filters.columnFilters[colKey];
        }
    } else if (Array.isArray(value)) {
        if (value.length > 0) {
            state.filters.columnFilters[colKey] = value;
            if (colKey === 'status' && filterStatus) filterStatus.value = value.length === 1 ? value[0] : '';
            if (colKey === 'plan' && filterPlan) filterPlan.value = value.length === 1 ? value[0] : '';
            if (colKey === 'receiving' && filterReceiving) filterReceiving.value = value.length === 1 ? value[0] : '';
        } else {
            delete state.filters.columnFilters[colKey];
            if (colKey === 'status' && filterStatus) filterStatus.value = '';
            if (colKey === 'plan' && filterPlan) filterPlan.value = '';
            if (colKey === 'receiving' && filterReceiving) filterReceiving.value = '';
        }
    } else if (typeof value === 'string') {
        if (value.trim()) {
            state.filters.columnFilters[colKey] = value.trim();
            if (colKey === 'status' && filterStatus) filterStatus.value = value.trim();
            if (colKey === 'plan' && filterPlan) filterPlan.value = value.trim();
            if (colKey === 'receiving' && filterReceiving) filterReceiving.value = value.trim();
        } else {
            delete state.filters.columnFilters[colKey];
            if (colKey === 'status' && filterStatus) filterStatus.value = '';
            if (colKey === 'plan' && filterPlan) filterPlan.value = '';
            if (colKey === 'receiving' && filterReceiving) filterReceiving.value = '';
        }
    } else {
        delete state.filters.columnFilters[colKey];
    }

    state.pagination.currentPage = 1;
    if (typeof renderClientTable === 'function') renderClientTable();
    updateThFilterIndicators();
}

function updateThFilterIndicators() {
    const isReportsPage = !!document.getElementById('reportTable');
    const colFilters = isReportsPage 
        ? ((typeof reportsState !== 'undefined' && reportsState.columnFilters) ? reportsState.columnFilters : {}) 
        : (state.filters.columnFilters || {});

    document.querySelectorAll('.th-filter-btn').forEach(btn => {
        const col = btn.getAttribute('data-col');
        const filterVal = colFilters[col];

        if (Array.isArray(filterVal) && filterVal.length > 0) {
            btn.classList.add('active');
            btn.title = `Filtered (${filterVal.length} selected): ${filterVal.join(', ')}`;
        } else if (filterVal && typeof filterVal === 'object') {
            if (filterVal.mode === 'single' && filterVal.date) {
                btn.classList.add('active');
                btn.title = `Filtered by Date: ${filterVal.date}`;
            } else if (filterVal.mode === 'range' && (filterVal.from || filterVal.to)) {
                btn.classList.add('active');
                btn.title = `Filtered by Range: ${filterVal.from || 'Start'} to ${filterVal.to || 'End'}`;
            } else {
                btn.classList.remove('active');
                btn.title = `Filter by ${col}`;
            }
        } else if (typeof filterVal === 'string' && filterVal.trim()) {
            btn.classList.add('active');
            btn.title = `Filtered by: ${filterVal}`;
        } else {
            btn.classList.remove('active');
            btn.title = `Filter by ${col}`;
        }
    });
}

// ============================================================================
// 8. MODALS & ACCESSORY HELPERS
// ============================================================================

function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    const activeModals = document.querySelectorAll('.modal-backdrop.active');
    if (activeModals.length === 0) {
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) closeModal(activeModal);
    }
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop);
    });
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    const isMobile = window.innerWidth <= 860;
    if (isMobile) {
        sidebar.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('crm_sidebar_collapsed', isCollapsed ? '1' : '0');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    const isMobile = window.innerWidth <= 860;
    if (isMobile) {
        sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('open');
    } else {
        sidebar.classList.add('collapsed');
        localStorage.setItem('crm_sidebar_collapsed', '1');
    }
}

function updateNavBadgeCount() {
    const count = (state.clients && state.clients.length) || 0;
    const navClientCount = document.getElementById('navClientCount');
    if (navClientCount) {
        navClientCount.textContent = count;
        navClientCount.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    const navClients = document.getElementById('navClients');
    if (navClients) {
        navClients.removeAttribute('data-tooltip');
    }
}

function updateLastUpdatedTime() {
    const el = document.getElementById('lastUpdatedTime');
    if (el) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `Today at ${hours}:${minutes}`;
    }
}

// Toast Notifications
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);
    setTimeout(() => removeToast(toast), 3500);
}

function removeToast(toast) {
    if (!toast || toast.classList.contains('toast-hide')) return;
    toast.classList.add('toast-hide');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

// Client Statement & Ledger Modal
function handleViewClient(clientId) {
    const client = state.clients.find(c => Number(c.id) === Number(clientId));
    if (!client) {
        showToast('error', 'Client Not Found', 'Could not locate client record in database.');
        return;
    }

    const viewModalBody = document.getElementById('viewModalBody');
    const viewModal = document.getElementById('viewModal');

    if (viewModalBody) {
        const totalMonths = 4;
        let baseDate = client.initialPaymentDate 
            ? new Date(client.initialPaymentDate + 'T00:00:00') 
            : (client.date ? new Date(client.date + 'T00:00:00') : new Date());
        
        let scheduleRowsHtml = '';
        for (let i = 1; i <= totalMonths; i++) {
            const installmentDate = new Date(baseDate);
            installmentDate.setMonth(baseDate.getMonth() + (i - 1));
            
            const dateStr = installmentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            let rowStatus = 'Pending';
            if (i === 1) {
                rowStatus = client.receiving || 'Pending';
            }
            
            scheduleRowsHtml += `
                <tr>
                    <td class="text-center font-bold text-secondary">${String(i).padStart(2, '0')}</td>
                    <td class="font-bold">${dateStr}</td>
                    <td class="text-right currency-val">${formatCurrency(client.monthly)}</td>
                    <td class="text-right currency-val text-primary font-bold">${formatCurrency(client.residual)}</td>
                    <td class="text-center">${getReceivingBadgeHtml(rowStatus)}</td>
                </tr>
            `;
        }

        viewModalBody.innerHTML = `
            <div class="premium-report-wrap">
                <div class="report-header">
                    <div class="report-brand">
                        <span class="report-title-label">Statement of Account</span>
                        <div class="report-brand-name">
                            <i class="fa-solid fa-asterisk"></i>
                            <span>Financial Advisor</span>
                        </div>
                    </div>
                    <div class="report-meta">
                        <div class="report-date-tag">Date: ${new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                        <div class="report-date-tag">Account Status: <strong class="text-primary">${client.status.toUpperCase()}</strong></div>
                    </div>
                </div>
                
                <div class="report-client-info">
                    <h2 class="report-client-name">${escapeHtml(client.clientName)}</h2>
                    <div class="report-meta-grid">
                        <div class="report-meta-item">
                            <span class="lbl">App Date</span>
                            <span class="val">${formatDateDisplay(client.date)}</span>
                        </div>
                        <div class="report-meta-item">
                            <span class="lbl">Plan Term</span>
                            <span class="val">${client.plan} Months</span>
                        </div>
                        <div class="report-meta-item">
                            <span class="lbl">Receiving</span>
                            <span class="val font-bold ${client.receiving === 'Received' ? 'text-primary' : 'text-secondary'}">${client.receiving.toUpperCase()}</span>
                        </div>
                        <div class="report-meta-item">
                            <span class="lbl">Connector</span>
                            <span class="val">${escapeHtml(client.connector || 'N/A')}</span>
                        </div>
                        <div class="report-meta-item">
                            <span class="lbl">Smart Agent</span>
                            <span class="val">${escapeHtml(client.smartAgent || 'N/A')}</span>
                        </div>
                        <div class="report-meta-item">
                            <span class="lbl">Super Agent</span>
                            <span class="val">${escapeHtml(client.superAgent || 'N/A')}</span>
                        </div>
                        <div class="report-meta-item">
                            <span class="lbl">Closer</span>
                            <span class="val">${escapeHtml(client.closer || 'N/A')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="report-kpi-bar">
                    <div class="report-kpi-bar-item">
                        <div class="kpi-label">Contract Value</div>
                        <div class="kpi-value">${formatCurrency((client.monthly || 0) * totalMonths)}</div>
                        <div class="kpi-sub">Monthly x ${totalMonths} Months</div>
                    </div>
                    <div class="report-kpi-bar-item">
                        <div class="kpi-label">Initial Paid</div>
                        <div class="kpi-value">${formatCurrency(client.initialPayment)}</div>
                        <div class="kpi-sub">Upfront collected</div>
                    </div>
                    <div class="report-kpi-bar-item">
                        <div class="kpi-label">Projected Residuals</div>
                        <div class="kpi-value kpi-purple">${formatCurrency((client.residual || 0) * totalMonths)}</div>
                        <div class="kpi-sub">5% of Approval x ${totalMonths}</div>
                    </div>
                </div>
                
                <h3 class="report-section-title">Installment & Residual Schedule Ledger</h3>
                
                <div class="report-ledger-table-wrap">
                    <table class="report-ledger-table">
                        <thead>
                            <tr>
                                <th class="text-center">Installment</th>
                                <th>Due Date</th>
                                <th class="text-right">Monthly Payment</th>
                                <th class="text-right">Residual Amount</th>
                                <th class="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${scheduleRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    const editBtn = document.getElementById('viewModalEditBtn');
    if (editBtn && typeof handleEditClient === 'function') {
        editBtn.onclick = () => handleEditClient(client.id);
    }
    const deleteBtn = document.getElementById('viewModalDeleteBtn');
    if (deleteBtn && typeof handleDeletePrompt === 'function') {
        deleteBtn.onclick = () => {
            if (viewModal) closeModal(viewModal);
            handleDeletePrompt(client.id);
        };
    }
    if (viewModal) {
        openModal(viewModal);
    }
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.clients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `client_management_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('info', 'Export Complete', 'Client database downloaded as JSON.');
}

function resetSampleData() {
    window.location.reload();
}

function adjustTableHeight() {
    const tableScrollContainers = document.querySelectorAll('.table-scroll-container');
    tableScrollContainers.forEach(container => {
        const outerWrapper = container.closest('.table-outer-wrapper');
        const footer = outerWrapper ? outerWrapper.querySelector('.table-pagination-footer') : null;
        const footerHeight = footer ? footer.offsetHeight : 38;
        
        const rect = container.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - footerHeight - 35;
        
        if (availableHeight > 180) {
            container.style.maxHeight = `${Math.floor(availableHeight)}px`;
        }
    });
}

window.addEventListener('resize', adjustTableHeight);

// ============================================================================
// 9. COMMON INITIALIZATION ON DOM LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    updateNavBadgeCount();
    updateLastUpdatedTime();

    // Top Header Date
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    if (currentDateDisplay) {
        const today = new Date();
        currentDateDisplay.textContent = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Sidebar bindings
    const mobileToggleBtn = document.getElementById('mobileToggleBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', toggleSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Restore desktop collapsed sidebar preference
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 860 && localStorage.getItem('crm_sidebar_collapsed') === '1') {
        if (sidebar) sidebar.classList.add('collapsed');
    }

    // Export & Refresh bindings
    const btnExportData = document.getElementById('btnExportData');
    const btnExportHeader = document.getElementById('btnExportHeader');
    const btnResetSampleData = document.getElementById('btnResetSampleData');
    const btnRefreshTime = document.getElementById('btnRefreshTime');

    if (btnExportData) btnExportData.addEventListener('click', exportData);
    if (btnExportHeader) btnExportHeader.addEventListener('click', exportData);
    if (btnResetSampleData) btnResetSampleData.addEventListener('click', resetSampleData);
    if (btnRefreshTime) {
        btnRefreshTime.addEventListener('click', () => {
            updateLastUpdatedTime();
            showToast('info', 'Updated', 'Timestamp refreshed.');
        });
    }

    // Statement Modal Close bindings
    const viewModal = document.getElementById('viewModal');
    const viewModalCloseBtn = document.getElementById('viewModalCloseBtn');
    const viewModalCloseFooterBtn = document.getElementById('viewModalCloseFooterBtn');
    if (viewModalCloseBtn) viewModalCloseBtn.addEventListener('click', () => closeModal(viewModal));
    if (viewModalCloseFooterBtn) viewModalCloseFooterBtn.addEventListener('click', () => closeModal(viewModal));

    // User Profile Dropdown Toggle
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    
    if (userProfileBtn && userProfileDropdown) {
        userProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = userProfileDropdown.classList.contains('active');
            userProfileDropdown.classList.toggle('active', !isOpen);
            userProfileBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (e) => {
            if (!userProfileDropdown.contains(e.target)) {
                userProfileDropdown.classList.remove('active');
                userProfileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Logout Action
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            showToast('info', 'Logged Out', 'You have been logged out successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 800);
        });
    }

    adjustTableHeight();
    setTimeout(adjustTableHeight, 50);
});
