<?php
$pageTitle = $pageTitle ?? 'Weekly Reports & Balance - Finance Portal';
$activeNav = 'reports';
$pageScript = 'reports.js';
require VIEWS_PATH . '/report_user/layouts/header.php';
?>

<section class="view-section active" id="viewReports">
    <!-- Page Top Main Header with Live Current Date & Export Action -->
    <div class="page-header-row">
        <div class="title-with-meta">
            <h1 class="page-main-title">
                Approval & Residual Payments <span class="header-date-plain" id="reportHeaderDate"><?= e($activeWeek['date_range'] ?? preg_replace('/^Week\s+\d+:\s*/i', '', $activeWeek['title'] ?? '') ?: 'Aug 31 - Sep 06, 2026') ?></span>
            </h1>
        </div>

        <div class="header-action-buttons">
            <!-- Sleek Date / Week Navigation & Custom Dropdown -->
            <div class="report-week-nav-group">
                <button type="button" class="btn-report-nav" id="btnPrevWeek" title="Previous Week">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>

                <!-- Custom Elegant Dropdown Wrapper -->
                <div class="report-week-custom-dropdown" id="reportWeekCustomDropdown">
                    <button type="button" class="btn-week-dropdown-trigger" id="btnWeekDropdownTrigger" aria-expanded="false" aria-haspopup="true">
                        <i class="fa-regular fa-calendar-days text-brand"></i>
                        <span id="currentWeekTriggerText" class="week-trigger-label"><?= e($activeWeek['title'] ?? 'Select Week') ?></span>
                        <i class="fa-solid fa-chevron-down week-trigger-caret"></i>
                    </button>

                    <!-- Hidden native select for form & code compatibility -->
                    <select id="selectWeeklyCycle" style="display: none;" aria-label="Select Report Week">
                        <?php if (!empty($availableWeeks)): ?>
                            <?php foreach ($availableWeeks as $w): ?>
                                <option value="<?= $w['start_date'] ?>" <?= ($activeWeek && $activeWeek['start_date'] === $w['start_date']) ? 'selected' : '' ?>>
                                    <?= e($w['title']) ?>
                                </option>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <option value="<?= $activeWeek['start_date'] ?? date('Y-m-d') ?>">
                                <?= e($activeWeek['title'] ?? 'Current Week') ?>
                            </option>
                        <?php endif; ?>
                    </select>

                    <!-- Custom Floating Dropdown Menu -->
                    <div class="week-dropdown-menu" id="weekDropdownMenu">
                        <div class="week-dropdown-scroll">
                            <?php if (!empty($availableWeeks)): ?>
                                <?php foreach ($availableWeeks as $w): ?>
                                    <?php $isSelected = ($activeWeek && $activeWeek['start_date'] === $w['start_date']); ?>
                                    <div class="week-dropdown-item <?= $isSelected ? 'selected' : '' ?>" data-date="<?= $w['start_date'] ?>" data-title="<?= e($w['title']) ?>">
                                        <div class="week-item-info">
                                            <span class="week-pill-badge"><?= e($w['week_label'] ?? 'Week') ?></span>
                                            <span class="week-item-title"><?= e($w['date_range'] ?? $w['title']) ?></span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn-report-nav" id="btnNextWeek" title="Next Week">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            <button class="btn-header-export" id="btnExportCombinedReport">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
                <span>Export</span>
            </button>  
        </div>
    </div>

    <!-- ==================== APPROVAL & RESIDUAL PAYMENTS MASTER TABLE ==================== -->
    <div class="table-outer-wrapper reports-table-wrapper">
        <!-- Client Statement Header Banner (Shown when viewing a specific client's ledger) -->
        <div class="client-ledger-banner" id="clientLedgerBanner" style="display: none;">
            <div class="ledger-banner-content">
                <div class="ledger-banner-left">
                    <span class="ledger-banner-avatar"><i class="fa-solid fa-user-check"></i></span>
                    <div class="ledger-client-name" id="ledgerClientName">Client Ledger</div>
                </div>
                <div class="ledger-banner-right">
                    <button type="button" class="btn-exit-ledger" id="btnExitLedger" title="Return to weekly report">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span id="btnExitLedgerText">Back to Weekly Report</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="table-scroll-container">
            <table class="crm-data-table" id="combinedTable">
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
                <tbody id="combinedTableBody">
                    <!-- Populated dynamically via JS -->
                </tbody>
                <tfoot id="combinedTableFoot" class="crm-table-tfoot excel-table-tfoot">
                    <!-- Row 1: Column Totals -->
                    <tr class="tfoot-summary-row excel-summary-row">
                        <td colspan="3" class="excel-total-label font-bold">
                            <div class="tfoot-summary-title">
                                <i class="fa-solid fa-calculator"></i>
                                <span>Total Summary (<span id="tfootCombinedClientCount">0 Clients</span>)</span>
                            </div>
                        </td>
                        <td class="currency-val excel-cell-val font-bold" id="tfootCombinedInitial">
                            $0.00
                        </td>
                        <td class="currency-val excel-cell-val font-bold" id="tfootCombinedResidual">
                            $0.00
                        </td>
                        <td class="excel-cell-blank text-center text-muted">-</td>
                    </tr>

                    <!-- Row 2: Total Receiving -->
                    <tr class="excel-calc-row">
                        <td colspan="3" class="excel-left-cell"></td>
                        <td colspan="2" class="excel-label-box font-bold">
                            <span>Total Receiving</span>
                        </td>
                        <td class="currency-val excel-val-box font-bold" id="tfootTotalReceivingTarget">
                            $0.00
                        </td>
                    </tr>

                    <!-- Row 3: Total Received (Editable Input) -->
                    <tr class="excel-calc-row">
                        <td colspan="3" class="excel-left-cell"></td>
                        <td colspan="2" class="excel-label-box excel-label-received font-bold">
                            <span>Total Received</span>
                        </td>
                        <td class="excel-input-cell">
                            <input type="number" step="0.01" min="0" class="tbl-input excel-received-input" id="inputTotalReceived" placeholder="0">
                        </td>
                    </tr>

                    <!-- Row 4: Remaining -->
                    <tr class="excel-calc-row excel-row-remaining">
                        <td colspan="3" class="excel-left-cell"></td>
                        <td colspan="2" class="excel-label-box excel-label-remaining font-bold">
                            <span>Remaining</span>
                        </td>
                        <td class="currency-val excel-val-box excel-val-remaining font-bold" id="tfootTotalRemaining">
                            $0.00
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</section>

<!-- ==================== MODAL: VIEW CLIENT STATEMENT & LEDGER ==================== -->
<div class="modal-backdrop" id="viewModal" role="dialog" aria-modal="true" aria-labelledby="viewModalTitle">
    <div class="modal-dialog modal-dialog-lg">
        <div class="modal-card">
            <div class="modal-top-header">
                <div>
                    <h2 class="modal-heading-title" id="viewModalTitle">Client Statement & Ledger</h2>
                    <p class="modal-heading-sub">Official schedule, residual forecast, and ledger breakdown</p>
                </div>
                <button class="modal-close-icon" id="viewModalCloseBtn" aria-label="Close modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-scroll-body" id="viewModalBody">
                <!-- Populated dynamically via JS -->
            </div>
            <div class="modal-action-footer">
                <button type="button" class="btn-header-export" id="viewModalCloseActionBtn">Close</button>
            </div>
        </div>
    </div>
</div>

<?php require VIEWS_PATH . '/report_user/layouts/footer.php'; ?>
