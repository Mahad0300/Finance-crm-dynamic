<?php
$pageTitle = $pageTitle ?? 'Client Data Management - Finance Portal';
$activeNav = 'clients';
$pageScript = 'clients.js';
require VIEWS_PATH . '/admin/layouts/header.php';
?>

<section class="view-section active" id="viewClients">
    <!-- Header with Title & Action Buttons -->
    <div class="page-header-row">
        <div class="title-with-meta">
            <h1 class="page-main-title">Clients</h1>
        </div>

        <div class="header-action-buttons">
            <button class="btn-header-export" id="btnExportHeader">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
                <span>Export</span>
            </button>
            <button class="btn-header-add" id="btnOpenAddModal">
                <i class="fa-solid fa-plus"></i>
                <span>Add New Client</span>
            </button>
        </div>
    </div>

    <!-- Clean Toolbar: Search, Filter Dropdowns, Pagination Controls -->
    <div class="crm-toolbar" id="clientsToolbar">
        <div class="toolbar-left">
            <!-- Search Input -->
            <div class="search-box-pill">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="searchInput" class="search-input-pill" placeholder="Search by Client, Connector, Agent, Closer...">
                <button class="search-clear-pill" id="searchClearBtn" aria-label="Clear search">
                    <i class="fa-solid fa-circle-xmark"></i>
                </button>
            </div>

            <!-- Filter: Status -->
            <div class="filter-select-wrapper">
                <i class="fa-solid fa-filter filter-icon-left"></i>
                <select id="filterStatus" class="filter-select-pill">
                    <option value="">All Status</option>
                    <option value="Submit">Submit</option>
                    <option value="Charged">Charged</option>
                    <option value="Kick Back">Kick Back</option>
                </select>
                <i class="fa-solid fa-chevron-down filter-icon-right"></i>
            </div>

            <!-- Filter: Plan -->
            <div class="filter-select-wrapper">
                <i class="fa-solid fa-calendar-days filter-icon-left"></i>
                <select id="filterPlan" class="filter-select-pill">
                    <option value="">All Plans</option>
                </select>
                <i class="fa-solid fa-chevron-down filter-icon-right"></i>
            </div>

            <!-- Filter: Receiving -->
            <div class="filter-select-wrapper">
                <i class="fa-solid fa-money-check-dollar filter-icon-left"></i>
                <select id="filterReceiving" class="filter-select-pill">
                    <option value="">All Receiving</option>
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                </select>
                <i class="fa-solid fa-chevron-down filter-icon-right"></i>
            </div>

            <!-- Reset Filters Button -->
            <button class="btn-toolbar-reset" id="btnResetFilters" title="Reset All Filters">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Reset</span>
            </button>
        </div>
    </div>

    <!-- Client Data Table Outer Card -->
    <div class="table-outer-wrapper" id="clientsTableWrapper">
        <div class="table-scroll-container">
            <table class="crm-data-table" id="clientsTable">
                <thead>
                    <tr>
                        <th>
                            <div class="th-wrap">
                                <span>Date</span>
                                <button type="button" class="th-filter-btn" data-col="date" title="Filter Date" onclick="openThFilterPopover(this, 'date', 'Date')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Client Name</span>
                                <button type="button" class="th-filter-btn" data-col="clientName" title="Filter Client Name" onclick="openThFilterPopover(this, 'clientName', 'Client Name')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Connector</span>
                                <button type="button" class="th-filter-btn" data-col="connector" title="Filter Connector" onclick="openThFilterPopover(this, 'connector', 'Connector')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Smart Agent</span>
                                <button type="button" class="th-filter-btn" data-col="smartAgent" title="Filter Smart Agent" onclick="openThFilterPopover(this, 'smartAgent', 'Smart Agent')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Super Agent</span>
                                <button type="button" class="th-filter-btn" data-col="superAgent" title="Filter Super Agent" onclick="openThFilterPopover(this, 'superAgent', 'Super Agent')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Closer</span>
                                <button type="button" class="th-filter-btn" data-col="closer" title="Filter Closer" onclick="openThFilterPopover(this, 'closer', 'Closer')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Status</span>
                                <button type="button" class="th-filter-btn" data-col="status" title="Filter Status" onclick="openThFilterPopover(this, 'status', 'Status')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Plan</span>
                                <button type="button" class="th-filter-btn" data-col="plan" title="Filter Plan" onclick="openThFilterPopover(this, 'plan', 'Plan')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Monthly</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Initial <br> Payment</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Initial Payment <br> Date</span>
                                <button type="button" class="th-filter-btn" data-col="initialPaymentDate" title="Filter Payment Date" onclick="openThFilterPopover(this, 'initialPaymentDate', 'Initial Payment Date')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Residual</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Approval <br> Amount</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-wrap">
                                <span>Receiving</span>
                                <button type="button" class="th-filter-btn" data-col="receiving" title="Filter Receiving" onclick="openThFilterPopover(this, 'receiving', 'Receiving')">
                                    <i class="fa-solid fa-filter"></i>
                                </button>
                            </div>
                        </th>
                    </tr>
                    <!-- Inline Table Input Row (Shown on clicking Add New Client) -->
                    <tr class="inline-entry-row" id="inlineAddRow" title="Type client data and press Enter to save">
                        <td>
                            <input type="date" class="tbl-input" id="tblDate" value="<?= date('Y-m-d') ?>">
                        </td>
                        <td>
                            <input type="text" class="tbl-input font-bold" id="tblClientName" placeholder="Client Name...">
                        </td>
                        <td>
                            <input type="text" class="tbl-input" id="tblConnector" placeholder="Connector...">
                        </td>
                        <td>
                            <div class="agent-select-wrapper" data-role="smart" data-target="tblSmartAgent">
                                <input type="hidden" id="tblSmartAgent" value="">
                                <button type="button" class="btn-agent-select-trigger" id="btnTrigger_tblSmartAgent" onclick="openAgentPopover(this, 'smart', 'tblSmartAgent')">
                                    <span class="agent-select-label">-- Select --</span>
                                    <i class="fa-solid fa-chevron-down caret-icon"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <div class="agent-select-wrapper" data-role="super" data-target="tblSuperAgent">
                                <input type="hidden" id="tblSuperAgent" value="">
                                <button type="button" class="btn-agent-select-trigger" id="btnTrigger_tblSuperAgent" onclick="openAgentPopover(this, 'super', 'tblSuperAgent')">
                                    <span class="agent-select-label">-- Select --</span>
                                    <i class="fa-solid fa-chevron-down caret-icon"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <div class="agent-select-wrapper" data-role="closer" data-target="tblCloser">
                                <input type="hidden" id="tblCloser" value="">
                                <button type="button" class="btn-agent-select-trigger" id="btnTrigger_tblCloser" onclick="openAgentPopover(this, 'closer', 'tblCloser')">
                                    <span class="agent-select-label">-- Select --</span>
                                    <i class="fa-solid fa-chevron-down caret-icon"></i>
                                </button>
                            </div>
                        </td>
                        <td>
                            <select class="tbl-select" id="tblStatus">
                                <option value="">-- Status --</option>
                                <option value="Submit">Submit</option>
                                <option value="Charged">Charged</option>
                                <option value="Kick Back">Kick Back</option>
                            </select>
                        </td>
                        <td>
                            <select class="tbl-select" id="tblPlan"></select>
                        </td>
                        <td>
                            <input type="number" step="0.01" class="tbl-input" id="tblMonthly" placeholder="0.00">
                        </td>
                        <td>
                            <input type="number" step="0.01" class="tbl-input" id="tblInitialPayment" placeholder="0.00">
                        </td>
                        <td>
                            <input type="date" class="tbl-input" id="tblInitialPaymentDate">
                        </td>
                        <td>
                            <div class="tbl-calc-badge" id="tblResidual">-</div>
                        </td>
                        <td>
                            <div class="tbl-calc-badge text-main" id="tblApprovalAmount">-</div>
                        </td>
                        <td>
                            <span class="status-pill pill-pending">Pending</span>
                        </td>
                    </tr>
                </thead>
                <tbody id="clientsTableBody">
                    <!-- Populated dynamically via JS -->
                </tbody>
            </table>
        </div>

        <!-- Empty State -->
        <div class="empty-table-state" id="emptyState" style="display: none;">
            <div class="empty-icon-wrap">
                <i class="fa-solid fa-folder-open"></i>
            </div>
            <h3 class="empty-title">No clients found</h3>
            <p class="empty-desc">There are no client records matching your active search or filters.</p>
            <button class="btn-header-add" id="btnEmptyAddClient">
                <i class="fa-solid fa-plus"></i>
                <span>Add New Client</span>
            </button>
        </div>

        <!-- Table Bottom Pagination Footer (Always visible to keep Month tabs accessible) -->
        <div class="table-pagination-footer" id="tablePaginationFooter">
            <span class="pagination-range-text" id="tableResultsCount">Showing 0 clients</span>
            <div class="table-sheet-tabs-container" id="tableSheetTabsContainer">
                <!-- Dynamic Sheet Tabs populated by JS -->
            </div>
            <div class="pagination-arrow-group" id="paginationControls">
                <!-- Dynamic arrow & number buttons -->
            </div>
        </div>
    </div>

    <!-- Client Statement Ledger View (Shown when clicking a client name) -->
    <div class="table-outer-wrapper reports-table-wrapper" id="clientLedgerView" style="display: none;">
        <div class="client-ledger-banner" id="clientLedgerBanner">
            <div class="ledger-banner-content">
                <div class="ledger-banner-left">
                    <span class="ledger-banner-avatar"><i class="fa-solid fa-user-check"></i></span>
                    <div class="ledger-client-name" id="ledgerClientName">Client Name</div>
                </div>
                <div class="ledger-banner-right">
                    <button type="button" class="btn-exit-ledger" id="btnExitLedger" title="Return to client list">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Back to Client Data</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="table-scroll-container">
            <table class="crm-data-table" id="clientStatementTable">
                <thead>
                    <tr>
                        <th class="col-rep-date">
                            <div class="th-wrap"><span>Payment Date</span></div>
                        </th>
                        <th class="col-rep-name">
                            <div class="th-wrap"><span>Client Name</span></div>
                        </th>
                        <th class="col-rep-plan">
                            <div class="th-wrap"><span>Plan</span></div>
                        </th>
                        <th class="col-rep-initial">
                            <div class="th-wrap"><span>Approval Payment</span></div>
                        </th>
                        <th class="col-rep-residual">
                            <div class="th-wrap"><span>Residual</span></div>
                        </th>
                        <th class="col-rep-receiving">
                            <div class="th-wrap"><span>Receiving</span></div>
                        </th>
                    </tr>
                </thead>
                <tbody id="clientStatementTableBody">
                    <!-- Populated dynamically via JS -->
                </tbody>
            </table>
        </div>
    </div>
</section>

<!-- Agent Datalists for Combobox / Quick Custom Input -->
<datalist id="smartAgentDatalist"></datalist>
<datalist id="superAgentDatalist"></datalist>
<datalist id="closerDatalist"></datalist>

<?php require VIEWS_PATH . '/admin/layouts/footer.php'; ?>
