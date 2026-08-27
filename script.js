/**
 * Client Management CRM - Core Application Logic
 * Pure Vanilla JavaScript (ES6+) with localStorage persistence
 * Works across both index.html (Dashboard) and clients.html (Client List)
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

// Configurable Approval Rules
const approvalRules = [
    { min: 0, max: 100, approval: 500 },
    { min: 100.01, max: 200, approval: 700 },
    { min: 200.01, max: 300, approval: 900 },
    { min: 300.01, max: 400, approval: 1200 },
    { min: 401, max: 500, approval: 1500 },
    { min: 501, max: 1000, approval: 2000 },
    { min: 1001, max: 10000, approval: 3000 }
];

// Available Plans (1 to 120 Months)
const availablePlans = Array.from({ length: 120 }, (_, i) => i + 1);

// Default Agent Lists
const defaultSmartAgents = ['Hamza Khan', 'Ahad', 'Ali', 'Usman'];
const defaultSuperAgents = ['Zia Uddin', 'KK', 'Ali', 'Usman'];
const defaultClosers = ['shahab', 'Yasir', 'Ahmed', 'Ali'];

// Initial Sample Clients (12 Records for 10 per page pagination)
const sampleClients = [
    {
        id: 1,
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
        initialPaymentDate: "2026-09-01",
        residual: 60.00,
        approvalAmount: 1200.00,
        receiving: "Pending"
    },
    {
        id: 2,
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
        initialPaymentDate: "2026-09-02",
        residual: 75.00,
        approvalAmount: 1500.00,
        receiving: "Received"
    },
    {
        id: 3,
        date: "2026-08-15",
        clientName: "WOLNEY JACKSON",
        connector: "Sarah Connor",
        smartAgent: "Ali",
        superAgent: "Usman",
        closer: "Ahmed",
        status: "Kick Back",
        plan: 12,
        monthly: 180.50,
        initialPayment: 180.50,
        initialPaymentDate: "2026-08-20",
        residual: 35.00,
        approvalAmount: 700.00,
        receiving: "Pending"
    },
    {
        id: 4,
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
        initialPaymentDate: "2026-09-05",
        residual: 100.00,
        approvalAmount: 2000.00,
        receiving: "Received"
    },
    {
        id: 5,
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
        initialPaymentDate: "2026-09-10",
        residual: 45.00,
        approvalAmount: 900.00,
        receiving: "Pending"
    },
    {
        id: 6,
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
        initialPaymentDate: "2026-09-12",
        residual: 100.00,
        approvalAmount: 2000.00,
        receiving: "Received"
    },
    {
        id: 7,
        date: "2026-08-19",
        clientName: "SOPHIA RODRIGUEZ",
        connector: "Rachel Green",
        smartAgent: "Ali",
        superAgent: "KK",
        closer: "shahab",
        status: "Submit",
        plan: 12,
        monthly: 95.00,
        initialPayment: 95.00,
        initialPaymentDate: "2026-08-25",
        residual: 25.00,
        approvalAmount: 500.00,
        receiving: "Pending"
    },
    {
        id: 8,
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
        initialPaymentDate: "2026-09-15",
        residual: 60.00,
        approvalAmount: 1200.00,
        receiving: "Received"
    },
    {
        id: 9,
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
        initialPaymentDate: "2026-08-28",
        residual: 45.00,
        approvalAmount: 900.00,
        receiving: "Pending"
    },
    {
        id: 10,
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
        initialPaymentDate: "2026-09-18",
        residual: 75.00,
        approvalAmount: 1500.00,
        receiving: "Received"
    },
    {
        id: 11,
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
        initialPaymentDate: "2026-09-20",
        residual: 35.00,
        approvalAmount: 700.00,
        receiving: "Pending"
    },
    {
        id: 12,
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
        initialPaymentDate: "2026-09-25",
        residual: 150.00,
        approvalAmount: 3000.00,
        receiving: "Received"
    }
];

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================

const state = {
    clients: [],
    smartAgents: [],
    superAgents: [],
    closers: [],
    currentPageType: 'dashboard', // 'dashboard' | 'clients'
    filters: {
        search: '',
        status: '',
        plan: '',
        receiving: ''
    },
    sorting: {
        column: 'date',
        order: 'desc' // 'asc' | 'desc'
    },
    pagination: {
        currentPage: 1,
        rowsPerPage: 10
    },
    clientToDeleteId: null,
    editingClientId: null,
    agentTargetRole: null // 'smart' | 'super' | 'closer'
};

// ============================================================================
// 3. STORAGE & INITIALIZATION HELPERS
// ============================================================================

function initStorage() {
    // 1. Clients
    const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!storedClients) {
        state.clients = [...sampleClients];
        saveClients();
    } else {
        try {
            const parsed = JSON.parse(storedClients);
            if (Array.isArray(parsed) && parsed.length < 12 && parsed.length <= 4) {
                state.clients = [...sampleClients];
                saveClients();
            } else {
                state.clients = parsed;
            }
        } catch (e) {
            console.error('Error parsing stored clients, resetting to sample data', e);
            state.clients = [...sampleClients];
            saveClients();
        }
    }

    // 2. Agents
    state.smartAgents = getStoredList(STORAGE_KEYS.SMART_AGENTS, defaultSmartAgents);
    state.superAgents = getStoredList(STORAGE_KEYS.SUPER_AGENTS, defaultSuperAgents);
    state.closers = getStoredList(STORAGE_KEYS.CLOSERS, defaultClosers);
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
        return { approval: 0, residual: 0, matched: false, ruleText: 'Enter initial payment' };
    }

    const num = parseFloat(paymentVal);
    if (num < 0) {
        return { approval: 0, residual: 0, matched: false, ruleText: 'Payment cannot be negative' };
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
            approval: 0,
            residual: 0,
            matched: false,
            ruleText: 'No approval rule matched for this range'
        };
    }
}

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined || amount === '') return '$0';
    const num = Number(amount);
    if (num % 1 === 0) {
        return '$' + num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
    // If it has decimal places (like 180.5 or 359.49), display exact decimals without forced trailing zeros
    return '$' + num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '-';
    try {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

// ============================================================================
// 5. DOM ELEMENTS GETTER
// ============================================================================

function getDOM() {
    return {
        // Navigation
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
        mobileToggleBtn: document.getElementById('mobileToggleBtn'),
        navDashboard: document.getElementById('navDashboard'),
        navClients: document.getElementById('navClients'),
        navClientCount: document.getElementById('navClientCount'),
        currentDateDisplay: document.getElementById('currentDateDisplay'),
        headerAddBtn: document.getElementById('headerAddBtn'),
        btnQuickAddClient: document.getElementById('btnQuickAddClient'),
        btnExportData: document.getElementById('btnExportData'),
        btnResetSampleData: document.getElementById('btnResetSampleData'),

        // Dashboard Elements (Present on index.html)
        viewDashboard: document.getElementById('viewDashboard'),
        btnRefreshStats: document.getElementById('btnRefreshStats'),
        btnDashboardAddClient: document.getElementById('btnDashboardAddClient'),
        btnViewAllClients: document.getElementById('btnViewAllClients'),
        statTotalClients: document.getElementById('statTotalClients'),
        statSubmitted: document.getElementById('statSubmitted'),
        statSubmittedPercent: document.getElementById('statSubmittedPercent'),
        statCharged: document.getElementById('statCharged'),
        statChargedPercent: document.getElementById('statChargedPercent'),
        statKickBack: document.getElementById('statKickBack'),
        statKickBackPercent: document.getElementById('statKickBackPercent'),
        statTotalApproval: document.getElementById('statTotalApproval'),
        statTotalMonthly: document.getElementById('statTotalMonthly'),
        statTotalInitial: document.getElementById('statTotalInitial'),
        statReceivedCount: document.getElementById('statReceivedCount'),
        statPendingCount: document.getElementById('statPendingCount'),
        distSubmitVal: document.getElementById('distSubmitVal'),
        distSubmitBar: document.getElementById('distSubmitBar'),
        distChargedVal: document.getElementById('distChargedVal'),
        distChargedBar: document.getElementById('distChargedBar'),
        distKickBackVal: document.getElementById('distKickBackVal'),
        distKickBackBar: document.getElementById('distKickBackBar'),
        distReceivedBadge: document.getElementById('distReceivedBadge'),
        distPendingBadge: document.getElementById('distPendingBadge'),
        distTotalResidual: document.getElementById('distTotalResidual'),
        approvalRulesTableBody: document.getElementById('approvalRulesTableBody'),
        recentClientsTableBody: document.getElementById('recentClientsTableBody'),

        // Client List Elements (Present on clients.html)
        viewClients: document.getElementById('viewClients'),
        btnOpenAddModal: document.getElementById('btnOpenAddModal'),
        searchInput: document.getElementById('searchInput'),
        searchClearBtn: document.getElementById('searchClearBtn'),
        filterStatus: document.getElementById('filterStatus'),
        filterPlan: document.getElementById('filterPlan'),
        filterReceiving: document.getElementById('filterReceiving'),
        btnResetFilters: document.getElementById('btnResetFilters'),
        tableResultsCount: document.getElementById('tableResultsCount'),
        clientsTable: document.getElementById('clientsTable'),
        clientsTableBody: document.getElementById('clientsTableBody'),
        emptyState: document.getElementById('emptyState'),
        btnEmptyAddClient: document.getElementById('btnEmptyAddClient'),
        paginationFooter: document.getElementById('paginationFooter'),
        paginationInfo: document.getElementById('paginationInfo'),
        paginationControls: document.getElementById('paginationControls'),
        selectRowsPerPage: document.getElementById('selectRowsPerPage'),

        // Add/Edit Modal
        clientModal: document.getElementById('clientModal'),
        clientForm: document.getElementById('clientForm'),
        modalTitle: document.getElementById('modalTitle'),
        modalSubtitle: document.getElementById('modalSubtitle'),
        modalHeaderIcon: document.getElementById('modalHeaderIcon'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),
        modalCancelBtn: document.getElementById('modalCancelBtn'),
        modalSaveBtn: document.getElementById('modalSaveBtn'),
        modalSaveBtnText: document.getElementById('modalSaveBtnText'),
        clientId: document.getElementById('clientId'),
        formDate: document.getElementById('formDate'),
        formClientName: document.getElementById('formClientName'),
        formConnector: document.getElementById('formConnector'),
        formSmartAgent: document.getElementById('formSmartAgent'),
        formSuperAgent: document.getElementById('formSuperAgent'),
        formCloser: document.getElementById('formCloser'),
        formStatus: document.getElementById('formStatus'),
        formPlan: document.getElementById('formPlan'),
        formReceiving: document.getElementById('formReceiving'),
        formMonthly: document.getElementById('formMonthly'),
        formInitialPayment: document.getElementById('formInitialPayment'),
        formInitialPaymentDate: document.getElementById('formInitialPaymentDate'),
        formApprovalAmount: document.getElementById('formApprovalAmount'),
        formResidual: document.getElementById('formResidual'),
        displayApprovalAmount: document.getElementById('displayApprovalAmount'),
        displayResidual: document.getElementById('displayResidual'),
        approvalRuleMatchText: document.getElementById('approvalRuleMatchText'),
        btnAddNewSmartAgent: document.getElementById('btnAddNewSmartAgent'),
        btnAddNewSuperAgent: document.getElementById('btnAddNewSuperAgent'),
        btnAddNewCloser: document.getElementById('btnAddNewCloser'),

        // View Modal
        viewModal: document.getElementById('viewModal'),
        viewModalBody: document.getElementById('viewModalBody'),
        viewModalCloseBtn: document.getElementById('viewModalCloseBtn'),
        viewModalCloseBtn2: document.getElementById('viewModalCloseBtn2'),
        viewModalEditBtn: document.getElementById('viewModalEditBtn'),
        viewModalDeleteBtn: document.getElementById('viewModalDeleteBtn'),

        // Delete Modal
        deleteModal: document.getElementById('deleteModal'),
        deleteClientName: document.getElementById('deleteClientName'),
        deleteModalCloseBtn: document.getElementById('deleteModalCloseBtn'),
        deleteCancelBtn: document.getElementById('deleteCancelBtn'),
        deleteConfirmBtn: document.getElementById('deleteConfirmBtn'),

        // Agent Modal
        agentModal: document.getElementById('agentModal'),
        agentForm: document.getElementById('agentForm'),
        agentModalTitle: document.getElementById('agentModalTitle'),
        agentModalSubtitle: document.getElementById('agentModalSubtitle'),
        agentNameInput: document.getElementById('agentNameInput'),
        agentNameError: document.getElementById('agentNameError'),
        agentModalCloseBtn: document.getElementById('agentModalCloseBtn'),
        agentCancelBtn: document.getElementById('agentCancelBtn'),

        // Inline Table Inputs
        tblDate: document.getElementById('tblDate'),
        tblClientName: document.getElementById('tblClientName'),
        tblConnector: document.getElementById('tblConnector'),
        tblSmartAgent: document.getElementById('tblSmartAgent'),
        tblSuperAgent: document.getElementById('tblSuperAgent'),
        tblCloser: document.getElementById('tblCloser'),
        tblStatus: document.getElementById('tblStatus'),
        tblPlan: document.getElementById('tblPlan'),
        tblMonthly: document.getElementById('tblMonthly'),
        tblInitialPayment: document.getElementById('tblInitialPayment'),
        tblInitialPaymentDate: document.getElementById('tblInitialPaymentDate'),
        tblResidual: document.getElementById('tblResidual'),
        tblApprovalAmount: document.getElementById('tblApprovalAmount'),
        tblReceiving: document.getElementById('tblReceiving'),
        btnTblSaveClient: document.getElementById('btnTblSaveClient'),

        // Toast Container
        toastContainer: document.getElementById('toastContainer')
    };
}

let DOM = {};

// ============================================================================
// 6. UI POPULATION & BADGES
// ============================================================================

function populateSelectOptions() {
    // 1. Form Plans
    if (DOM.formPlan) {
        DOM.formPlan.innerHTML = '';
        availablePlans.forEach(months => {
            const optionForm = document.createElement('option');
            optionForm.value = months;
            optionForm.textContent = `${months} Months`;
            DOM.formPlan.appendChild(optionForm);
        });
    }

    // 2. Inline Table Plans
    if (DOM.tblPlan) {
        DOM.tblPlan.innerHTML = '';
        availablePlans.forEach(months => {
            const optionTbl = document.createElement('option');
            optionTbl.value = months;
            optionTbl.textContent = `${months} ${months === 1 ? 'Month' : 'Months'}`;
            if (months === 12) optionTbl.selected = true;
            DOM.tblPlan.appendChild(optionTbl);
        });
    }

    // Set Default Today Date for Inline Entry
    if (DOM.tblDate && !DOM.tblDate.value) {
        DOM.tblDate.value = new Date().toISOString().split('T')[0];
    }

    // 3. Filter Plans (on client list page)
    if (DOM.filterPlan) {
        DOM.filterPlan.innerHTML = '<option value="">All Plans</option>';
        availablePlans.forEach(months => {
            const optionFilter = document.createElement('option');
            optionFilter.value = months;
            optionFilter.textContent = `${months} ${months === 1 ? 'Month' : 'Months'}`;
            DOM.filterPlan.appendChild(optionFilter);
        });
    }

    // 4. Agents (Form Dropdowns & Datalists for Combobox Inputs)
    populateAgentDatalist('smartAgentDatalist', state.smartAgents);
    populateAgentDatalist('superAgentDatalist', state.superAgents);
    populateAgentDatalist('closerDatalist', state.closers);

    if (DOM.formSmartAgent) populateAgentDropdown(DOM.formSmartAgent, state.smartAgents);
    if (DOM.formSuperAgent) populateAgentDropdown(DOM.formSuperAgent, state.superAgents);
    if (DOM.formCloser) populateAgentDropdown(DOM.formCloser, state.closers);

    if (DOM.tblSmartAgent && DOM.tblSmartAgent.tagName === 'SELECT') populateAgentDropdown(DOM.tblSmartAgent, state.smartAgents);
    if (DOM.tblSuperAgent && DOM.tblSuperAgent.tagName === 'SELECT') populateAgentDropdown(DOM.tblSuperAgent, state.superAgents);
    if (DOM.tblCloser && DOM.tblCloser.tagName === 'SELECT') populateAgentDropdown(DOM.tblCloser, state.closers);
}

function populateAgentDatalist(listId, list) {
    let dl = document.getElementById(listId);
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = listId;
        document.body.appendChild(dl);
    }
    dl.innerHTML = '';
    list.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        dl.appendChild(opt);
    });
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
    populateSelectOptions();
}

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
        return; // Don't close when scrolling inside the dropdown popover itself!
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
    const list = roleType === 'smart' ? state.smartAgents : roleType === 'super' ? state.superAgents : state.closers;
    const currentVal = targetInput.value || '';

    const popover = document.createElement('div');
    popover.className = 'agent-popover-dropdown';
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${rect.left}px`;
    popover.style.width = `${Math.max(rect.width, 185)}px`;

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

        // 1. None / Clear option
        if (!q) {
            const noneItem = document.createElement('div');
            noneItem.className = `agent-popover-item ${!currentVal ? 'selected' : ''}`;
            noneItem.innerHTML = `<span style="color: var(--text-muted);">-- None / Clear --</span>`;
            noneItem.addEventListener('click', () => {
                selectAgentValue('');
            });
            optionsContainer.appendChild(noneItem);
        }

        // 2. Filtered Agent list
        const filtered = list.filter(name => name.toLowerCase().includes(q));
        filtered.forEach(name => {
            const item = document.createElement('div');
            item.className = `agent-popover-item ${name === currentVal ? 'selected' : ''}`;
            item.innerHTML = `<span>${escapeHtml(name)}</span>${name === currentVal ? '<i class="fa-solid fa-check" style="font-size: 0.75rem;"></i>' : ''}`;
            item.addEventListener('click', () => {
                selectAgentValue(name);
            });
            optionsContainer.appendChild(item);
        });

        // 3. If typed name is not in list, show "+ Add [name]" item
        if (q && !list.some(n => n.toLowerCase() === q)) {
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
                const matched = list.find(n => n.toLowerCase() === text.toLowerCase());
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

function updateNavBadgeCount() {
    if (DOM.navClientCount) {
        DOM.navClientCount.textContent = state.clients.length;
    }
}

// ============================================================================
// 7. DASHBOARD RENDERING
// ============================================================================

function renderDashboard() {
    if (!DOM.viewDashboard) return;

    const total = state.clients.length;
    const submittedCount = state.clients.filter(c => c.status === 'Submit').length;
    const chargedCount = state.clients.filter(c => c.status === 'Charged').length;
    const kickBackCount = state.clients.filter(c => c.status === 'Kick Back').length;

    const totalApproval = state.clients.reduce((sum, c) => sum + (parseFloat(c.approvalAmount) || 0), 0);
    const totalMonthly = state.clients.reduce((sum, c) => sum + (parseFloat(c.monthly) || 0), 0);
    const totalInitial = state.clients.reduce((sum, c) => sum + (parseFloat(c.initialPayment) || 0), 0);
    const totalResidual = state.clients.reduce((sum, c) => sum + (parseFloat(c.residual) || 0), 0);

    const receivedCount = state.clients.filter(c => c.receiving === 'Received').length;
    const pendingCount = state.clients.filter(c => c.receiving === 'Pending').length;

    const submitPct = total > 0 ? Math.round((submittedCount / total) * 100) : 0;
    const chargedPct = total > 0 ? Math.round((chargedCount / total) * 100) : 0;
    const kickBackPct = total > 0 ? Math.round((kickBackCount / total) * 100) : 0;

    if (DOM.statTotalClients) DOM.statTotalClients.textContent = total;
    if (DOM.statSubmitted) DOM.statSubmitted.textContent = submittedCount;
    if (DOM.statSubmittedPercent) DOM.statSubmittedPercent.textContent = `${submitPct}% of total`;
    if (DOM.statCharged) DOM.statCharged.textContent = chargedCount;
    if (DOM.statChargedPercent) DOM.statChargedPercent.textContent = `${chargedPct}% conversion`;
    if (DOM.statKickBack) DOM.statKickBack.textContent = kickBackCount;
    if (DOM.statKickBackPercent) DOM.statKickBackPercent.textContent = `${kickBackPct}% rate`;

    if (DOM.statTotalApproval) DOM.statTotalApproval.textContent = formatCurrency(totalApproval);
    if (DOM.statTotalMonthly) DOM.statTotalMonthly.textContent = formatCurrency(totalMonthly);
    if (DOM.statTotalInitial) DOM.statTotalInitial.textContent = formatCurrency(totalInitial);
    if (DOM.statReceivedCount) DOM.statReceivedCount.textContent = receivedCount;
    if (DOM.statPendingCount) DOM.statPendingCount.textContent = `${pendingCount} Pending settlement`;

    if (DOM.distSubmitVal) DOM.distSubmitVal.textContent = `${submittedCount} (${submitPct}%)`;
    if (DOM.distSubmitBar) DOM.distSubmitBar.style.width = `${submitPct}%`;

    if (DOM.distChargedVal) DOM.distChargedVal.textContent = `${chargedCount} (${chargedPct}%)`;
    if (DOM.distChargedBar) DOM.distChargedBar.style.width = `${chargedPct}%`;

    if (DOM.distKickBackVal) DOM.distKickBackVal.textContent = `${kickBackCount} (${kickBackPct}%)`;
    if (DOM.distKickBackBar) DOM.distKickBackBar.style.width = `${kickBackPct}%`;

    if (DOM.distReceivedBadge) DOM.distReceivedBadge.textContent = `Received: ${receivedCount}`;
    if (DOM.distPendingBadge) DOM.distPendingBadge.textContent = `Pending: ${pendingCount}`;
    if (DOM.distTotalResidual) DOM.distTotalResidual.textContent = formatCurrency(totalResidual);

    renderApprovalRulesMatrix();
    renderRecentClientsTable();
}

function renderApprovalRulesMatrix() {
    if (!DOM.approvalRulesTableBody) return;
    DOM.approvalRulesTableBody.innerHTML = '';
    approvalRules.forEach(r => {
        const row = document.createElement('tr');
        const res = (r.approval * 0.05).toFixed(2);
        row.innerHTML = `
            <td><strong>$${r.min.toFixed(2)} - $${r.max.toFixed(2)}</strong></td>
            <td><span class="badge badge-submit">$${r.approval.toFixed(2)}</span></td>
            <td><strong class="text-primary">$${res}</strong></td>
        `;
        DOM.approvalRulesTableBody.appendChild(row);
    });
}

function renderRecentClientsTable() {
    if (!DOM.recentClientsTableBody) return;
    DOM.recentClientsTableBody.innerHTML = '';
    const recent = [...state.clients].slice(0, 5);

    if (recent.length === 0) {
        DOM.recentClientsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 2rem; color: var(--text-muted);">
                    No client records yet. Click "+ Add Client" to create the first record.
                </td>
            </tr>
        `;
        return;
    }

    recent.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateDisplay(client.date)}</td>
            <td>
                <strong>${escapeHtml(client.clientName)}</strong>
            </td>
            <td>${escapeHtml(client.connector || '-')}</td>
            <td>${getCloserBadgeHtml(client.closer)}</td>
            <td>${getStatusBadgeHtml(client.status)}</td>
            <td>${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}</td>
            <td class="currency-cell">${formatCurrency(client.initialPayment)}</td>
            <td class="currency-cell">${formatCurrency(client.approvalAmount)}</td>
            <td>${getReceivingBadgeHtml(client.receiving)}</td>
        `;
        DOM.recentClientsTableBody.appendChild(row);
    });
}

// ============================================================================
// 8. CLIENT LIST RENDERING, FILTERING, SORTING & PAGINATION
// ============================================================================

function getFilteredAndSortedClients() {
    const { search, status, plan, receiving } = state.filters;
    const query = search.trim().toLowerCase();

    let filtered = state.clients.filter(c => {
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

        if (status && c.status !== status) return false;
        if (plan && String(c.plan) !== String(plan)) return false;
        if (receiving && c.receiving !== receiving) return false;

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
    if (!DOM.clientsTableBody) return;

    const filteredClients = getFilteredAndSortedClients();
    const totalRecords = filteredClients.length;
    const { currentPage, rowsPerPage } = state.pagination;

    const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    state.pagination.currentPage = safePage;

    const startIndex = (safePage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
    const paginatedItems = filteredClients.slice(startIndex, endIndex);

    if (DOM.tableResultsCount) {
        DOM.tableResultsCount.textContent = `Showing ${totalRecords === 0 ? 0 : startIndex + 1} to ${endIndex} of ${totalRecords} client${totalRecords === 1 ? '' : 's'}`;
    }

    if (totalRecords === 0) {
        DOM.clientsTable.style.display = 'none';
        if (DOM.emptyState) DOM.emptyState.style.display = 'flex';
        if (DOM.paginationFooter) DOM.paginationFooter.style.display = 'none';
    } else {
        DOM.clientsTable.style.display = 'table';
        if (DOM.emptyState) DOM.emptyState.style.display = 'none';
        if (DOM.paginationFooter) DOM.paginationFooter.style.display = 'flex';

        DOM.clientsTableBody.innerHTML = '';
        paginatedItems.forEach(client => {
            if (state.editingClientId === client.id) {
                // Inline Editing Row for Double-Clicked Client
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
                        <input type="number" step="0.01" class="tbl-input text-right" id="editMonthly_${client.id}" value="${client.monthly || 0}">
                    </td>
                    <td>
                        <input type="number" step="0.01" class="tbl-input text-right" id="editInitial_${client.id}" value="${client.initialPayment || 0}">
                    </td>
                    <td>
                        <input type="date" class="tbl-input" id="editInitialDate_${client.id}" value="${client.initialPaymentDate || ''}">
                    </td>
                    <td>
                        <div class="tbl-calc-badge" id="editResidual_${client.id}">${formatCurrency(client.residual)}</div>
                    </td>
                    <td>
                        <div class="tbl-calc-badge" id="editApproval_${client.id}" style="color: var(--text-main);">${formatCurrency(client.approvalAmount)}</div>
                    </td>
                    <td>
                        <select class="tbl-select" id="editReceiving_${client.id}">
                            <option value="Pending" ${client.receiving === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Received" ${client.receiving === 'Received' ? 'selected' : ''}>Received</option>
                        </select>
                    </td>
                `;
                DOM.clientsTableBody.appendChild(tr);

                const initialInp = tr.querySelector(`#editInitial_${client.id}`);
                if (initialInp) {
                    initialInp.addEventListener('input', (e) => {
                        const val = e.target.value;
                        const calc = calculateApprovalAndResidual(val);
                        const apprEl = tr.querySelector(`#editApproval_${client.id}`);
                        const resEl = tr.querySelector(`#editResidual_${client.id}`);
                        if (apprEl) apprEl.textContent = formatCurrency(calc.approval);
                        if (resEl) resEl.textContent = formatCurrency(calc.residual);
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
                    <td>${client.plan} ${parseInt(client.plan) === 1 ? 'Month' : 'Months'}</td>
                    <td class="currency-cell text-right">${formatCurrency(client.monthly)}</td>
                    <td class="currency-cell text-right">${formatCurrency(client.initialPayment)}</td>
                    <td>${formatDateDisplay(client.initialPaymentDate)}</td>
                    <td class="currency-cell text-right" style="color: var(--primary); font-weight: 700;">${formatCurrency(client.residual)}</td>
                    <td class="currency-cell text-right" style="font-weight: 800;">${formatCurrency(client.approvalAmount)}</td>
                    <td class="text-center">${getReceivingBadgeHtml(client.receiving)}</td>
                `;
                DOM.clientsTableBody.appendChild(tr);
            }
        });

        renderPagination(totalPages, safePage, startIndex, endIndex, totalRecords);
    }

    updateHeaderSortIndicators();
}

function startInlineEdit(clientId, targetColIndex) {
    state.editingClientId = clientId;
    renderClientTable();

    // Focus only the exact cell that was double clicked, without scrolling page or forcing focus on client name
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

    const monthlyNum = parseFloat(monthlyInp ? monthlyInp.value : 0) || 0;
    const initialNum = parseFloat(initialInp ? initialInp.value : 0) || 0;
    const calc = calculateApprovalAndResidual(initialNum);

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
            status: statusInp ? statusInp.value : 'Submit',
            plan: planInp ? parseInt(planInp.value) || 12 : 12,
            monthly: monthlyNum,
            initialPayment: initialNum,
            initialPaymentDate: initialDateInp ? initialDateInp.value : '',
            approvalAmount: calc.approval,
            residual: calc.residual,
            receiving: receivingInp ? receivingInp.value : 'Pending'
        };

        ensureAgentExists('smart', smartInp ? smartInp.value : '');
        ensureAgentExists('super', superInp ? superInp.value : '');
        ensureAgentExists('closer', closerInp ? closerInp.value : '');

        saveClients();
        renderDashboard();
    }

    state.editingClientId = null;
    renderClientTable();
    showToast('success', 'Changes Saved', `"${nameVal.toUpperCase()}" updated successfully.`);
}

function renderPagination(totalPages, currentPage, startIndex, endIndex, totalRecords) {
    if (DOM.tableResultsCount) {
        DOM.tableResultsCount.innerHTML = `Showing <strong>${totalRecords === 0 ? 0 : startIndex + 1} &ndash; ${endIndex}</strong> of <strong>${totalRecords}</strong> clients`;
    }
    if (!DOM.paginationControls) return;

    DOM.paginationControls.innerHTML = '';

    // Previous Page Button <
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
    DOM.paginationControls.appendChild(prevBtn);

    // Numbered Page Buttons [1] [2] ...
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
            DOM.paginationControls.appendChild(pageBtn);
        }
    }

    // Next Page Button >
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
    DOM.paginationControls.appendChild(nextBtn);
}

function updateHeaderSortIndicators() {
    if (!DOM.clientsTable) return;
    const ths = DOM.clientsTable.querySelectorAll('th.sortable');
    ths.forEach(th => {
        const col = th.getAttribute('data-sort');
        const icon = th.querySelector('.sort-icon');
        th.classList.remove('sort-asc', 'sort-desc');

        if (col === state.sorting.column) {
            if (state.sorting.order === 'asc') {
                th.classList.add('sort-asc');
                if (icon) icon.className = 'fa-solid fa-sort-up sort-icon';
            } else {
                th.classList.add('sort-desc');
                if (icon) icon.className = 'fa-solid fa-sort-down sort-icon';
            }
        } else {
            if (icon) icon.className = 'fa-solid fa-sort sort-icon';
        }
    });
}

// ============================================================================
// 9. CLIENT CRUD OPERATIONS
// ============================================================================

function showInlineAddRow() {
    const inlineRow = document.getElementById('inlineAddRow');
    if (inlineRow) {
        // Always bring user to Page 1 (Front page) so the top add row and table header are right in front of them
        if (state.pagination.currentPage !== 1) {
            state.pagination.currentPage = 1;
            renderClientTable();
        }

        inlineRow.style.display = 'table-row';
        if (DOM.clientsTable) DOM.clientsTable.style.display = 'table';
        if (DOM.emptyState) DOM.emptyState.style.display = 'none';

        if (DOM.tblDate && !DOM.tblDate.value) {
            DOM.tblDate.value = new Date().toISOString().split('T')[0];
        }

        setTimeout(() => {
            if (DOM.tblClientName) {
                DOM.tblClientName.focus();
                DOM.tblClientName.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 60);
    } else {
        // If on dashboard, navigate to client list to add inline
        window.location.href = 'clients.html?action=add';
    }
}

function hideInlineAddRow() {
    const inlineRow = document.getElementById('inlineAddRow');
    if (inlineRow) {
        inlineRow.style.display = 'none';
    }
}

function openAddModal() {
    // If inline table is present on this page, use inline row instead of popup modal
    if (document.getElementById('inlineAddRow')) {
        showInlineAddRow();
        return;
    }

    resetForm();
    if (DOM.modalTitle) DOM.modalTitle.textContent = 'Add New Client';
    if (DOM.modalSubtitle) DOM.modalSubtitle.textContent = 'Fill in client details and contract payment structure';
    if (DOM.modalHeaderIcon) DOM.modalHeaderIcon.className = 'fa-solid fa-user-plus';
    if (DOM.modalSaveBtnText) DOM.modalSaveBtnText.textContent = 'Save Client';

    const today = new Date().toISOString().split('T')[0];
    if (DOM.formDate) DOM.formDate.value = today;

    updateFormCalculations();
    openModal(DOM.clientModal);
    setTimeout(() => { if (DOM.formClientName) DOM.formClientName.focus(); }, 100);
}

function handleEditClient(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) {
        showToast('error', 'Client Not Found', 'The requested client could not be located.');
        return;
    }

    resetForm();
    if (DOM.modalTitle) DOM.modalTitle.textContent = 'Edit Client Record';
    if (DOM.modalSubtitle) DOM.modalSubtitle.textContent = `Update information for ${client.clientName}`;
    if (DOM.modalHeaderIcon) DOM.modalHeaderIcon.className = 'fa-solid fa-user-pen';
    if (DOM.modalSaveBtnText) DOM.modalSaveBtnText.textContent = 'Update Client';

    if (DOM.clientId) DOM.clientId.value = client.id;
    if (DOM.formDate) DOM.formDate.value = client.date || '';
    if (DOM.formClientName) DOM.formClientName.value = client.clientName || '';
    if (DOM.formConnector) DOM.formConnector.value = client.connector || '';
    
    ensureAgentInSelect(DOM.formSmartAgent, client.smartAgent, state.smartAgents);
    ensureAgentInSelect(DOM.formSuperAgent, client.superAgent, state.superAgents);
    ensureAgentInSelect(DOM.formCloser, client.closer, state.closers);

    if (DOM.formSmartAgent) DOM.formSmartAgent.value = client.smartAgent || '';
    if (DOM.formSuperAgent) DOM.formSuperAgent.value = client.superAgent || '';
    if (DOM.formCloser) DOM.formCloser.value = client.closer || '';

    if (DOM.formStatus) DOM.formStatus.value = client.status || 'Submit';
    if (DOM.formPlan) DOM.formPlan.value = client.plan || 24;
    if (DOM.formReceiving) DOM.formReceiving.value = client.receiving || 'Pending';
    if (DOM.formMonthly) DOM.formMonthly.value = client.monthly !== undefined ? client.monthly : '';
    if (DOM.formInitialPayment) DOM.formInitialPayment.value = client.initialPayment !== undefined ? client.initialPayment : '';
    if (DOM.formInitialPaymentDate) DOM.formInitialPaymentDate.value = client.initialPaymentDate || '';

    updateFormCalculations();
    closeModal(DOM.viewModal);
    openModal(DOM.clientModal);
}

function ensureAgentInSelect(selectEl, name, list) {
    if (name && !list.includes(name)) {
        list.push(name);
        populateSelectOptions();
    }
}

function handleViewClient(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) {
        showToast('error', 'Client Not Found', 'The requested client could not be located.');
        return;
    }

    if (DOM.viewModalBody) {
        DOM.viewModalBody.innerHTML = `
            <div class="view-card-banner">
                <div>
                    <div class="banner-client-name">${escapeHtml(client.clientName)}</div>
                    <div class="banner-meta">Enrolled: ${formatDateDisplay(client.date)} &bull; Plan: ${client.plan} Months</div>
                </div>
                <div>
                    ${getStatusBadgeHtml(client.status)}
                </div>
            </div>

            <div class="view-details-grid">
                <div class="detail-item">
                    <span class="detail-label">Application Date</span>
                    <span class="detail-value">${formatDateDisplay(client.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Receiving Status</span>
                    <span class="detail-value">${getReceivingBadgeHtml(client.receiving)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Connector</span>
                    <span class="detail-value">${escapeHtml(client.connector || 'N/A')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Smart Agent</span>
                    <span class="detail-value">${escapeHtml(client.smartAgent || 'N/A')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Super Agent</span>
                    <span class="detail-value">${escapeHtml(client.superAgent || 'N/A')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Closer</span>
                    <span class="detail-value">${escapeHtml(client.closer || 'N/A')}</span>
                </div>
            </div>

            <div class="view-financial-box">
                <div class="financial-grid-4">
                    <div>
                        <div class="fin-item-lbl">Monthly</div>
                        <div class="fin-item-val">${formatCurrency(client.monthly)}</div>
                    </div>
                    <div>
                        <div class="fin-item-lbl">Initial Payment</div>
                        <div class="fin-item-val">${formatCurrency(client.initialPayment)}</div>
                    </div>
                    <div>
                        <div class="fin-item-lbl">Approval Amount</div>
                        <div class="fin-item-val" style="color: var(--success);">${formatCurrency(client.approvalAmount)}</div>
                    </div>
                    <div>
                        <div class="fin-item-lbl">Residual (5%)</div>
                        <div class="fin-item-val" style="color: var(--purple);">${formatCurrency(client.residual)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    if (DOM.viewModalEditBtn) {
        DOM.viewModalEditBtn.onclick = () => handleEditClient(client.id);
    }
    if (DOM.viewModalDeleteBtn) {
        DOM.viewModalDeleteBtn.onclick = () => {
            closeModal(DOM.viewModal);
            handleDeletePrompt(client.id);
        };
    }
    openModal(DOM.viewModal);
}

function handleDeletePrompt(clientId) {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;

    state.clientToDeleteId = clientId;
    if (DOM.deleteClientName) DOM.deleteClientName.textContent = `"${client.clientName}"`;
    openModal(DOM.deleteModal);
}

function confirmDeleteClient() {
    if (!state.clientToDeleteId) return;

    const index = state.clients.findIndex(c => c.id === state.clientToDeleteId);
    if (index !== -1) {
        const deleted = state.clients.splice(index, 1)[0];
        saveClients();
        renderDashboard();
        renderClientTable();
        showToast('success', 'Client Deleted', `${deleted.clientName} was successfully removed.`);
    }

    closeModal(DOM.deleteModal);
    state.clientToDeleteId = null;
}

function handleClientFormSubmit(e) {
    e.preventDefault();

    const dateVal = DOM.formDate ? DOM.formDate.value.trim() : '';
    const nameVal = DOM.formClientName ? DOM.formClientName.value.trim() : '';
    const monthlyVal = DOM.formMonthly ? DOM.formMonthly.value.trim() : '';
    const initialPaymentVal = DOM.formInitialPayment ? DOM.formInitialPayment.value.trim() : '';

    let hasError = false;
    clearFormErrors();

    if (!dateVal) {
        setFieldError('formDate', 'errorDate', 'Application date is required');
        hasError = true;
    }

    if (!nameVal) {
        setFieldError('formClientName', 'errorClientName', 'Client name is required');
        hasError = true;
    }

    if (monthlyVal === '' || isNaN(monthlyVal) || parseFloat(monthlyVal) < 0) {
        setFieldError('formMonthly', 'errorMonthly', 'Please enter a valid monthly payment');
        hasError = true;
    }

    if (initialPaymentVal === '' || isNaN(initialPaymentVal) || parseFloat(initialPaymentVal) < 0) {
        setFieldError('formInitialPayment', 'errorInitialPayment', 'Please enter a valid initial payment');
        hasError = true;
    }

    if (hasError) return;

    const calc = calculateApprovalAndResidual(initialPaymentVal);
    const monthlyNum = parseFloat(monthlyVal);
    const initialNum = parseFloat(initialPaymentVal);
    const approvalNum = calc.approval;
    const residualNum = calc.residual;

    const editingId = DOM.clientId && DOM.clientId.value ? parseInt(DOM.clientId.value, 10) : null;

    if (editingId) {
        const existingIndex = state.clients.findIndex(c => c.id === editingId);
        if (existingIndex !== -1) {
            state.clients[existingIndex] = {
                id: editingId,
                date: dateVal,
                clientName: nameVal.toUpperCase(),
                connector: DOM.formConnector ? DOM.formConnector.value.trim() : '',
                smartAgent: DOM.formSmartAgent ? DOM.formSmartAgent.value : '',
                superAgent: DOM.formSuperAgent ? DOM.formSuperAgent.value : '',
                closer: DOM.formCloser ? DOM.formCloser.value : '',
                status: DOM.formStatus ? DOM.formStatus.value : 'Submit',
                plan: DOM.formPlan ? parseInt(DOM.formPlan.value, 10) : 24,
                monthly: monthlyNum,
                initialPayment: initialNum,
                initialPaymentDate: DOM.formInitialPaymentDate ? DOM.formInitialPaymentDate.value : '',
                approvalAmount: approvalNum,
                residual: residualNum,
                receiving: DOM.formReceiving ? DOM.formReceiving.value : 'Pending'
            };
            saveClients();
            showToast('success', 'Client Updated', 'Client record updated successfully.');
        }
    } else {
        const newId = state.clients.length > 0 ? Math.max(...state.clients.map(c => c.id)) + 1 : 1;
        const newClient = {
            id: newId,
            date: dateVal,
            clientName: nameVal.toUpperCase(),
            connector: DOM.formConnector ? DOM.formConnector.value.trim() : '',
            smartAgent: DOM.formSmartAgent ? DOM.formSmartAgent.value : '',
            superAgent: DOM.formSuperAgent ? DOM.formSuperAgent.value : '',
            closer: DOM.formCloser ? DOM.formCloser.value : '',
            status: DOM.formStatus ? DOM.formStatus.value : 'Submit',
            plan: DOM.formPlan ? parseInt(DOM.formPlan.value, 10) : 24,
            monthly: monthlyNum,
            initialPayment: initialNum,
            initialPaymentDate: DOM.formInitialPaymentDate ? DOM.formInitialPaymentDate.value : '',
            approvalAmount: approvalNum,
            residual: residualNum,
            receiving: DOM.formReceiving ? DOM.formReceiving.value : 'Pending'
        };
        state.clients.unshift(newClient);
        saveClients();
        showToast('success', 'Client Added', 'New client application registered successfully.');
    }

    renderDashboard();
    renderClientTable();
    closeModal(DOM.clientModal);
}

function updateFormCalculations() {
    if (!DOM.formInitialPayment) return;
    const paymentVal = DOM.formInitialPayment.value;
    const calc = calculateApprovalAndResidual(paymentVal);

    if (DOM.formApprovalAmount) DOM.formApprovalAmount.value = calc.approval;
    if (DOM.formResidual) DOM.formResidual.value = calc.residual;

    if (DOM.displayApprovalAmount) DOM.displayApprovalAmount.textContent = formatCurrency(calc.approval);
    if (DOM.displayResidual) DOM.displayResidual.textContent = formatCurrency(calc.residual);
    if (DOM.approvalRuleMatchText) {
        DOM.approvalRuleMatchText.textContent = calc.ruleText;
        DOM.approvalRuleMatchText.style.color = calc.matched ? '#4338CA' : '#DC2626';
    }
}

function updateInlineTableCalculations() {
    if (!DOM.tblInitialPayment) return;
    const paymentVal = DOM.tblInitialPayment.value;
    const calc = calculateApprovalAndResidual(paymentVal);

    if (DOM.tblApprovalAmount) DOM.tblApprovalAmount.textContent = formatCurrency(calc.approval);
    if (DOM.tblResidual) DOM.tblResidual.textContent = formatCurrency(calc.residual);
}

function handleInlineSaveClient() {
    if (!DOM.tblClientName) return;
    const nameVal = DOM.tblClientName.value.trim();

    if (!nameVal) {
        DOM.tblClientName.classList.add('is-invalid');
        DOM.tblClientName.focus();
        showToast('error', 'Validation Error', 'Please enter a Client Name.');
        return;
    }
    DOM.tblClientName.classList.remove('is-invalid');

    const dateVal = DOM.tblDate && DOM.tblDate.value ? DOM.tblDate.value : new Date().toISOString().split('T')[0];
    const connectorVal = DOM.tblConnector ? DOM.tblConnector.value.trim() : '';
    const smartAgentVal = DOM.tblSmartAgent ? DOM.tblSmartAgent.value : '';
    const superAgentVal = DOM.tblSuperAgent ? DOM.tblSuperAgent.value : '';
    const closerVal = DOM.tblCloser ? DOM.tblCloser.value : '';
    const statusVal = DOM.tblStatus ? DOM.tblStatus.value : 'Submit';
    const planVal = DOM.tblPlan ? parseInt(DOM.tblPlan.value) || 12 : 12;
    const monthlyVal = parseFloat(DOM.tblMonthly ? DOM.tblMonthly.value : 0) || 0;
    const initialPaymentVal = parseFloat(DOM.tblInitialPayment ? DOM.tblInitialPayment.value : 0) || 0;
    const initialPaymentDateVal = DOM.tblInitialPaymentDate ? DOM.tblInitialPaymentDate.value : '';

    const calc = calculateApprovalAndResidual(initialPaymentVal);
    const receivingVal = DOM.tblReceiving ? DOM.tblReceiving.value : 'Pending';

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
    state.pagination.currentPage = 1; // Always show Page 1 so new record is at the top!
    saveClients();
    renderDashboard();
    renderClientTable();
    updateNavBadgeCount();

    // Reset inline inputs for next entry
    DOM.tblClientName.value = '';
    if (DOM.tblConnector) DOM.tblConnector.value = '';
    if (DOM.tblSmartAgent) DOM.tblSmartAgent.value = '';
    if (DOM.tblSuperAgent) DOM.tblSuperAgent.value = '';
    if (DOM.tblCloser) DOM.tblCloser.value = '';

    const smartLabel = document.querySelector('#btnTrigger_tblSmartAgent .agent-select-label');
    const superLabel = document.querySelector('#btnTrigger_tblSuperAgent .agent-select-label');
    const closerLabel = document.querySelector('#btnTrigger_tblCloser .agent-select-label');
    if (smartLabel) smartLabel.textContent = '-- Select --';
    if (superLabel) superLabel.textContent = '-- Select --';
    if (closerLabel) closerLabel.textContent = '-- Select --';

    if (DOM.tblMonthly) DOM.tblMonthly.value = '';
    if (DOM.tblInitialPayment) DOM.tblInitialPayment.value = '';
    if (DOM.tblInitialPaymentDate) DOM.tblInitialPaymentDate.value = '';
    if (DOM.tblApprovalAmount) DOM.tblApprovalAmount.textContent = '$0';
    if (DOM.tblResidual) DOM.tblResidual.textContent = '$0';

    hideInlineAddRow();
    showToast('success', 'Client Saved', `"${newClient.clientName}" registered into table.`);
}

function resetForm() {
    if (!DOM.clientForm) return;
    DOM.clientForm.reset();
    if (DOM.clientId) DOM.clientId.value = '';
    clearFormErrors();
    updateFormCalculations();
}

function clearFormErrors() {
    if (!DOM.clientForm) return;
    const inputs = DOM.clientForm.querySelectorAll('.form-input, .form-select');
    inputs.forEach(el => el.classList.remove('is-invalid'));
    const errors = DOM.clientForm.querySelectorAll('.form-error');
    errors.forEach(el => el.textContent = '');
}

function setFieldError(inputId, errorId, msg) {
    const inputEl = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (inputEl) inputEl.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = msg;
}

// ============================================================================
// 10. CUSTOM AGENT REGISTRATION
// ============================================================================

function openAddAgentModal(roleType) {
    state.agentTargetRole = roleType;
    if (DOM.agentForm) DOM.agentForm.reset();
    if (DOM.agentNameError) DOM.agentNameError.textContent = '';
    if (DOM.agentNameInput) DOM.agentNameInput.classList.remove('is-invalid');

    let title = 'Add New Agent';
    let subtitle = 'Add new agent to persistent options';

    if (roleType === 'smart') {
        title = 'Add New Smart Agent';
        subtitle = 'Will be available in all Smart Agent selectors';
    } else if (roleType === 'super') {
        title = 'Add New Super Agent';
        subtitle = 'Will be available in all Super Agent selectors';
    } else if (roleType === 'closer') {
        title = 'Add New Closer';
        subtitle = 'Will be available in all Closer selectors';
    }

    if (DOM.agentModalTitle) DOM.agentModalTitle.textContent = title;
    if (DOM.agentModalSubtitle) DOM.agentModalSubtitle.textContent = subtitle;

    openModal(DOM.agentModal);
    setTimeout(() => { if (DOM.agentNameInput) DOM.agentNameInput.focus(); }, 100);
}

function handleAgentFormSubmit(e) {
    e.preventDefault();
    if (!DOM.agentNameInput) return;
    const name = DOM.agentNameInput.value.trim();

    if (!name) {
        DOM.agentNameInput.classList.add('is-invalid');
        if (DOM.agentNameError) DOM.agentNameError.textContent = 'Agent name is required';
        return;
    }

    if (state.agentTargetRole === 'smart') {
        if (!state.smartAgents.includes(name)) {
            state.smartAgents.push(name);
            saveAgents(STORAGE_KEYS.SMART_AGENTS, state.smartAgents);
        }
        populateAgentDropdown(DOM.formSmartAgent, state.smartAgents);
        if (DOM.formSmartAgent) DOM.formSmartAgent.value = name;
    } else if (state.agentTargetRole === 'super') {
        if (!state.superAgents.includes(name)) {
            state.superAgents.push(name);
            saveAgents(STORAGE_KEYS.SUPER_AGENTS, state.superAgents);
        }
        populateAgentDropdown(DOM.formSuperAgent, state.superAgents);
        if (DOM.formSuperAgent) DOM.formSuperAgent.value = name;
    } else if (state.agentTargetRole === 'closer') {
        if (!state.closers.includes(name)) {
            state.closers.push(name);
            saveAgents(STORAGE_KEYS.CLOSERS, state.closers);
        }
        populateAgentDropdown(DOM.formCloser, state.closers);
        if (DOM.formCloser) DOM.formCloser.value = name;
    }

    closeModal(DOM.agentModal);
    showToast('success', 'Agent Saved', `"${name}" added and selected.`);
}

// ============================================================================
// 11. MODAL HELPERS & ACCESSIBILITY
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

function toggleMobileSidebar() {
    if (DOM.sidebar) DOM.sidebar.classList.toggle('open');
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.toggle('open');
}

function closeMobileSidebar() {
    if (DOM.sidebar) DOM.sidebar.classList.remove('open');
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.classList.remove('open');
}

// ============================================================================
// 12. TOAST NOTIFICATIONS
// ============================================================================

function showToast(type, title, message) {
    if (!DOM.toastContainer) return;

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

    DOM.toastContainer.appendChild(toast);
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

// ============================================================================
// 13. UTILITIES & HTML HELPERS
// ============================================================================

function getStatusBadgeHtml(status) {
    if (status === 'Submit') {
        return `<span class="status-pill pill-submit">Submit</span>`;
    } else if (status === 'Charged') {
        return `<span class="status-pill pill-charged">Charged</span>`;
    } else if (status === 'Kick Back') {
        return `<span class="status-pill pill-kickback">Kick Back</span>`;
    }
    return `<span class="status-pill pill-pending">${escapeHtml(status || 'N/A')}</span>`;
}

function getReceivingBadgeHtml(receiving) {
    if (receiving === 'Received') {
        return `<span class="status-pill pill-received">Received</span>`;
    }
    return `<span class="status-pill pill-pending">Pending</span>`;
}

function getSmartAgentBadgeHtml(name) {
    if (!name || name === '-') return `<span style="color: var(--text-muted); font-weight: 600;">-</span>`;
    return `<span class="badge-agent badge-smart-agent">${escapeHtml(name)}</span>`;
}

function getSuperAgentBadgeHtml(name) {
    if (!name || name === '-') return `<span style="color: var(--text-muted); font-weight: 600;">-</span>`;
    return `<span class="badge-agent badge-super-agent">${escapeHtml(name)}</span>`;
}

function getCloserBadgeHtml(name) {
    if (!name || name === '-') return `<span style="color: var(--text-muted); font-weight: 600;">-</span>`;
    return `<span class="badge-agent badge-closer">${escapeHtml(name)}</span>`;
}

function getInitials(name) {
    if (!name) return 'CL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
    if (confirm('Are you sure you want to reset the client database to default sample records? All custom entries will be replaced.')) {
        state.clients = JSON.parse(JSON.stringify(sampleClients));
        state.smartAgents = [...defaultSmartAgents];
        state.superAgents = [...defaultSuperAgents];
        state.closers = [...defaultClosers];

        saveClients();
        saveAgents(STORAGE_KEYS.SMART_AGENTS, state.smartAgents);
        saveAgents(STORAGE_KEYS.SUPER_AGENTS, state.superAgents);
        saveAgents(STORAGE_KEYS.CLOSERS, state.closers);

        populateSelectOptions();
        renderDashboard();
        renderClientTable();
        showToast('success', 'Reset Successful', 'Sample client records restored.');
    }
}

// ============================================================================
// 14. EVENT LISTENERS SETUP
// ============================================================================

function setupEventListeners() {
    // Mobile Sidebar
    if (DOM.mobileToggleBtn) DOM.mobileToggleBtn.addEventListener('click', toggleMobileSidebar);
    if (DOM.sidebarCloseBtn) DOM.sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    if (DOM.sidebarOverlay) DOM.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // Quick Add & Actions
    if (DOM.btnQuickAddClient) DOM.btnQuickAddClient.addEventListener('click', openAddModal);
    if (DOM.headerAddBtn) DOM.headerAddBtn.addEventListener('click', openAddModal);
    if (DOM.btnDashboardAddClient) DOM.btnDashboardAddClient.addEventListener('click', openAddModal);
    if (DOM.btnOpenAddModal) DOM.btnOpenAddModal.addEventListener('click', openAddModal);
    if (DOM.btnEmptyAddClient) DOM.btnEmptyAddClient.addEventListener('click', openAddModal);

    if (DOM.btnRefreshStats) {
        DOM.btnRefreshStats.addEventListener('click', () => {
            renderDashboard();
            showToast('info', 'Data Refreshed', 'Dashboard metrics synchronized.');
        });
    }

    if (DOM.btnExportData) DOM.btnExportData.addEventListener('click', exportData);
    const btnExportHeader = document.getElementById('btnExportHeader');
    if (btnExportHeader) btnExportHeader.addEventListener('click', exportData);

    const btnRefreshTime = document.getElementById('btnRefreshTime');
    if (btnRefreshTime) {
        btnRefreshTime.addEventListener('click', () => {
            updateLastUpdatedTime();
            showToast('info', 'Updated', 'Timestamp refreshed.');
        });
    }

    if (DOM.btnResetSampleData) DOM.btnResetSampleData.addEventListener('click', resetSampleData);

    // Search & Filters on Client List page
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = e.target.value ? 'block' : 'none';
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    if (DOM.searchClearBtn) {
        DOM.searchClearBtn.addEventListener('click', () => {
            if (DOM.searchInput) DOM.searchInput.value = '';
            state.filters.search = '';
            DOM.searchClearBtn.style.display = 'none';
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    if (DOM.filterStatus) {
        DOM.filterStatus.addEventListener('change', (e) => {
            state.filters.status = e.target.value;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    if (DOM.filterPlan) {
        DOM.filterPlan.addEventListener('change', (e) => {
            state.filters.plan = e.target.value;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    if (DOM.filterReceiving) {
        DOM.filterReceiving.addEventListener('change', (e) => {
            state.filters.receiving = e.target.value;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    if (DOM.btnResetFilters) {
        DOM.btnResetFilters.addEventListener('click', () => {
            if (DOM.searchInput) DOM.searchInput.value = '';
            if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = 'none';
            if (DOM.filterStatus) DOM.filterStatus.value = '';
            if (DOM.filterPlan) DOM.filterPlan.value = '';
            if (DOM.filterReceiving) DOM.filterReceiving.value = '';
            state.filters = { search: '', status: '', plan: '', receiving: '' };
            state.pagination.currentPage = 1;
            renderClientTable();
            showToast('info', 'Filters Reset', 'Showing all client records.');
        });
    }

    // Rows Per Page Selector Event
    if (DOM.selectRowsPerPage) {
        DOM.selectRowsPerPage.addEventListener('change', (e) => {
            state.pagination.rowsPerPage = parseInt(e.target.value) || 10;
            state.pagination.currentPage = 1;
            renderClientTable();
        });
    }

    // Table Column Sorting
    if (DOM.clientsTable) {
        DOM.clientsTable.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.getAttribute('data-sort');
                if (state.sorting.column === col) {
                    state.sorting.order = state.sorting.order === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sorting.column = col;
                    state.sorting.order = 'asc';
                }
                renderClientTable();
            });
        });
    }

    // Modal Events
    if (DOM.modalCloseBtn) DOM.modalCloseBtn.addEventListener('click', () => closeModal(DOM.clientModal));
    if (DOM.modalCancelBtn) DOM.modalCancelBtn.addEventListener('click', () => closeModal(DOM.clientModal));
    if (DOM.clientForm) DOM.clientForm.addEventListener('submit', handleClientFormSubmit);

    // Initial Payment Calculation trigger
    if (DOM.formInitialPayment) DOM.formInitialPayment.addEventListener('input', updateFormCalculations);

    // View Modal Close
    if (DOM.viewModalCloseBtn) DOM.viewModalCloseBtn.addEventListener('click', () => closeModal(DOM.viewModal));
    if (DOM.viewModalCloseBtn2) DOM.viewModalCloseBtn2.addEventListener('click', () => closeModal(DOM.viewModal));

    // Delete Modal Events
    if (DOM.deleteModalCloseBtn) DOM.deleteModalCloseBtn.addEventListener('click', () => closeModal(DOM.deleteModal));
    if (DOM.deleteCancelBtn) DOM.deleteCancelBtn.addEventListener('click', () => closeModal(DOM.deleteModal));
    if (DOM.deleteConfirmBtn) DOM.deleteConfirmBtn.addEventListener('click', confirmDeleteClient);

    // Add Custom Agent Modal Events
    if (DOM.btnAddNewSmartAgent) DOM.btnAddNewSmartAgent.addEventListener('click', () => openAddAgentModal('smart'));
    if (DOM.btnAddNewSuperAgent) DOM.btnAddNewSuperAgent.addEventListener('click', () => openAddAgentModal('super'));
    if (DOM.btnAddNewCloser) DOM.btnAddNewCloser.addEventListener('click', () => openAddAgentModal('closer'));

    // Inline Table Events
    if (DOM.tblInitialPayment) {
        DOM.tblInitialPayment.addEventListener('input', updateInlineTableCalculations);
    }
    if (DOM.btnTblSaveClient) {
        DOM.btnTblSaveClient.addEventListener('click', handleInlineSaveClient);
    }

    if (DOM.tblSmartAgent) DOM.tblSmartAgent.addEventListener('change', (e) => handleAgentSelectChange(e.target, 'smart'));
    if (DOM.tblSuperAgent) DOM.tblSuperAgent.addEventListener('change', (e) => handleAgentSelectChange(e.target, 'super'));
    if (DOM.tblCloser) DOM.tblCloser.addEventListener('change', (e) => handleAgentSelectChange(e.target, 'closer'));

    // Allow pressing Enter in any inline field to save immediately
    const inlineInputs = [
        DOM.tblDate, DOM.tblClientName, DOM.tblConnector, DOM.tblSmartAgent, 
        DOM.tblSuperAgent, DOM.tblCloser, DOM.tblStatus, DOM.tblPlan, 
        DOM.tblMonthly, DOM.tblInitialPayment, DOM.tblInitialPaymentDate, DOM.tblReceiving
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

    if (DOM.agentModalCloseBtn) DOM.agentModalCloseBtn.addEventListener('click', () => closeModal(DOM.agentModal));
    if (DOM.agentCancelBtn) DOM.agentCancelBtn.addEventListener('click', () => closeModal(DOM.agentModal));
    if (DOM.agentForm) DOM.agentForm.addEventListener('submit', handleAgentFormSubmit);

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

    // Helper to detect if click/drag is on any scrollbar or table scroll container
    function isClickOnScrollbar(e) {
        // 1. Table Scroll Container
        const tableScroll = document.querySelector('.table-scroll-container');
        if (tableScroll) {
            const rect = tableScroll.getBoundingClientRect();
            // Horizontal scrollbar area at the bottom of table
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= (rect.top + tableScroll.clientHeight - 8) && e.clientY <= (rect.bottom + 8)) {
                return true;
            }
            // Vertical scrollbar area at right of table
            if (e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= (rect.left + tableScroll.clientWidth - 8) && e.clientX <= (rect.right + 8)) {
                return true;
            }
        }

        // 2. Page Content Scroll Container
        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
            const rect = pageContent.getBoundingClientRect();
            if (e.clientX >= (rect.left + pageContent.clientWidth - 8) && e.clientX <= (rect.right + 8)) {
                return true;
            }
            if (e.clientY >= (rect.top + pageContent.clientHeight - 8) && e.clientY <= (rect.bottom + 8)) {
                return true;
            }
        }

        // 3. Direct click on scroll container wrapper element
        if (e.target === tableScroll || (e.target && (e.target.classList.contains('table-outer-wrapper') || e.target.classList.contains('table-scroll-container')))) {
            return true;
        }

        return false;
    }

    // Auto-save on click-outside (blur / click away) for both inline edit row and inline add row
    document.addEventListener('mousedown', (e) => {
        // 1. If clicking inside an open agent popover or on its trigger button, don't auto-save yet
        if (currentOpenPopover) {
            if (currentOpenPopover.element && currentOpenPopover.element.contains(e.target)) return;
            if (currentOpenPopover.triggerBtn && currentOpenPopover.triggerBtn.contains(e.target)) return;
        }

        // 2. If clicking inside any open modal or toast, ignore
        if (e.target.closest('.modal-container') || e.target.closest('.modal-backdrop.active') || e.target.closest('.toast-container')) {
            return;
        }

        // 3. If clicking or dragging ANY scrollbar, or table headers, DO NOT close/cancel!
        if (isClickOnScrollbar(e) || e.target.closest('thead')) {
            return;
        }

        // 4. Auto-save for Inline Double-Click Editing Row
        if (state.editingClientId) {
            const editRow = document.getElementById(`editRow_${state.editingClientId}`);
            if (editRow && !editRow.contains(e.target)) {
                const currentId = state.editingClientId;
                saveInlineEdit(currentId);
            }
        }

        // 5. Auto-save for Inline Add Row
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
}

// ============================================================================
// 15. INITIAL STARTUP
// ============================================================================

function updateLastUpdatedTime() {
    const el = document.getElementById('lastUpdatedTime');
    if (el) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `Today at ${hours}:${minutes}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    DOM = getDOM();

    // Set Header Date
    const today = new Date();
    if (DOM.currentDateDisplay) {
        DOM.currentDateDisplay.textContent = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    updateLastUpdatedTime();

    // Initialize Storage & UI
    initStorage();
    populateSelectOptions();
    updateNavBadgeCount();
    setupEventListeners();

    // Render corresponding page content
    if (DOM.viewDashboard) {
        renderDashboard();
    }
    if (DOM.clientsTableBody) {
        renderClientTable();

        // Check if navigated with ?action=add
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'add') {
            showInlineAddRow();
        }
    }
});
