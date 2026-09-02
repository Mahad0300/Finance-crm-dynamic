<?php
$pageTitle = $pageTitle ?? 'Executive Dashboard - Finance Portal';
$activeNav = 'dashboard';
$pageScript = 'dashboard.js';
require VIEWS_PATH . '/admin/layouts/header.php';
?>

<section class="view-section active" id="viewDashboard">
    <!-- Page Top Header -->
    <div class="page-header-row page-header-row-mb">
        <div class="title-with-meta">
            <h1 class="page-main-title">Executive Dashboard</h1>
        </div>

        <div class="header-action-buttons">
            <!-- Flexible Date / Month Range Filter Component -->
            <div class="dash-date-filter-wrap" id="dashDateFilterWrap">
                <button type="button" class="btn-dash-date-trigger" id="dashDateTriggerBtn" aria-expanded="false" aria-haspopup="true">
                    <i class="fa-regular fa-calendar-days"></i>
                    <span id="dashDateLabel">Single Month</span>
                    <i class="fa-solid fa-chevron-down caret-icon"></i>
                </button>

                <!-- Date Filter Popover -->
                <div class="dash-date-popover" id="dashDatePopover">
                    <div class="date-popover-header">
                        <span class="date-popover-title">Date & Month Filter</span>
                        <button type="button" class="date-popover-reset" id="dashDateResetBtn">Reset to Current</button>
                    </div>

                    <!-- Mode Switcher Tabs -->
                    <div class="date-mode-tabs">
                        <button type="button" class="date-tab-btn active" data-mode="single-month">Single Month</button>
                        <button type="button" class="date-tab-btn" data-mode="month-range">Month Range</button>
                        <button type="button" class="date-tab-btn" data-mode="current-report">Current Report</button>
                    </div>

                    <!-- Pane 1: Single Month -->
                    <div class="date-tab-pane active" id="paneSingleMonth">
                        <label class="date-pane-label" for="inputSingleMonth">Select Month</label>
                        <input type="month" class="date-picker-input" id="inputSingleMonth">
                    </div>

                    <!-- Pane 2: Month Range -->
                    <div class="date-tab-pane" id="paneMonthRange">
                        <div class="range-inputs-row">
                            <div class="range-input-group">
                                <label class="date-pane-label" for="inputRangeFrom">From Month</label>
                                <input type="month" class="date-picker-input" id="inputRangeFrom">
                            </div>
                            <div class="range-input-group">
                                <label class="date-pane-label" for="inputRangeTo">To Month</label>
                                <input type="month" class="date-picker-input" id="inputRangeTo">
                            </div>
                        </div>
                    </div>

                    <!-- Pane 3: Current Report / Weekly Cycle -->
                    <div class="date-tab-pane" id="paneCurrentReport">
                        <label class="date-pane-label">Select Weekly Report</label>
                        <div class="dash-week-select-list" id="dashWeekSelectList">
                            <?php if (!empty($availableWeeks)): ?>
                                <?php foreach ($availableWeeks as $idx => $w): ?>
                                    <div class="dash-week-item" 
                                         data-start="<?= $w['start_date'] ?>" 
                                         data-end="<?= $w['end_date'] ?>" 
                                         data-title="<?= e($w['title']) ?>"
                                         data-label="<?= e($w['week_label'] ?? 'Week') ?>"
                                         data-range="<?= e($w['date_range'] ?? $w['title']) ?>">
                                        <div class="dash-week-item-left">
                                            <span class="week-pill-badge"><?= e($w['week_label'] ?? 'Week') ?></span>
                                            <span class="dash-week-date-text"><?= e($w['date_range'] ?? $w['title']) ?></span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <p class="text-muted text-center" style="padding: 12px; font-size: 0.8rem;">No weekly reports available.</p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="date-popover-footer">
                        <button type="button" class="btn-date-cancel" id="dashDateCancelBtn">Cancel</button>
                        <button type="button" class="btn-date-apply" id="dashDateApplyBtn">Apply Filter</button>
                    </div>
                </div>
            </div>

            <button class="btn-header-add" id="btnOpenAddModal">
                <i class="fa-solid fa-plus"></i>
                <span>Add New Client</span>
            </button>
        </div>
    </div>

    <!-- ==================== TOP ROW: 3 KPI CARDS ==================== -->
    <div class="fin-top-grid">
        <!-- Card 1: Total Submit -->
        <div class="fin-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-brand-light"><i class="fa-solid fa-bolt text-brand"></i></div>
                    <span>Total Submit</span>
                </div>
            </div>

            <div class="fin-balance-body">
                <div>
                    <div class="fin-amount-row">
                        <h2 class="fin-hero-amount" id="proTotalSubmit">$0</h2>
                    </div>
                </div>

                <!-- Pixel Staircase Art Box (Emerald/Lime Theme) -->
                <div class="fin-pixel-chart">
                    <div class="pixel-col pixel-col-20">
                        <div class="px-block px-green-1"></div>
                    </div>
                    <div class="pixel-col pixel-col-40">
                        <div class="px-block px-green-2"></div>
                        <div class="px-block px-green-1"></div>
                    </div>
                    <div class="pixel-col pixel-col-60">
                        <div class="px-block px-brand-dark"></div>
                        <div class="px-block px-green-2"></div>
                        <div class="px-block px-green-1"></div>
                    </div>
                    <div class="pixel-col pixel-col-80">
                        <div class="px-block px-lime"></div>
                        <div class="px-block px-brand-dark"></div>
                        <div class="px-block px-green-2"></div>
                    </div>
                    <div class="pixel-col pixel-col-100">
                        <div class="px-block px-brand-main"></div>
                        <div class="px-block px-lime"></div>
                        <div class="px-block px-brand-dark"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 2: Approval Amount -->
        <div class="fin-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-green-light"><i class="fa-solid fa-stamp text-green"></i></div>
                    <span>Approval Amount</span>
                </div>
            </div>

            <div class="fin-card-body-val">
                <div class="fin-amount-with-badge">
                    <h2 class="fin-hero-amount" id="proTotalApproval">$0</h2>
                    <span class="fin-badge-trend-green"><i class="fa-solid fa-arrow-trend-up"></i> <span id="proResidualTag">$0</span></span>
                </div>
            </div>
        </div>

        <!-- Card 3: Total Receiving -->
        <div class="fin-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-brand-light"><i class="fa-solid fa-circle-dollar-to-slot text-brand"></i></div>
                    <div class="fin-head-title-row">
                        <span class="fin-head-label">Total Receiving</span>
                        <span class="fin-head-main-val" id="proTotalReceiving">$0</span>
                    </div>
                </div>
                <span class="fin-badge-trend-green" id="proReceivedPctBadge"><i class="fa-solid fa-chart-pie"></i> <span id="proReceivedPctText">0%</span></span>
            </div>

            <div class="fin-card-body-val">
                <div class="fin-sub-metrics-column">
                    <div class="fin-sub-metric-row">
                        <div class="fin-icon-box bg-green-light"><i class="fa-solid fa-circle-check text-green"></i></div>
                        <span class="sub-metric-label">Total Received</span>
                        <span class="sub-metric-val val-received" id="proTotalReceived">$0</span>
                    </div>
                    <div class="fin-sub-metric-row">
                        <div class="fin-icon-box bg-slate-light"><i class="fa-solid fa-clock-rotate-left text-slate"></i></div>
                        <span class="sub-metric-label">Total Remaining</span>
                        <span class="sub-metric-val val-remaining" id="proTotalRemaining">$0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ==================== PERFORMANCE LEADERBOARDS: 4 BOXES ==================== -->
    <div class="fin-performance-grid">
        <!-- Box 1: Connector -->
        <div class="fin-card fin-perf-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-brand-light"><i class="fa-solid fa-people-arrows text-brand"></i></div>
                    <span>Connector</span>
                </div>
            </div>
            <div class="fin-perf-list" id="perfConnectorList">
                <!-- Populated dynamically via JS -->
            </div>
        </div>

        <!-- Box 2: Smart Agent -->
        <div class="fin-card fin-perf-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-blue-light"><i class="fa-solid fa-user-tie text-blue"></i></div>
                    <span>Smart Agent</span>
                </div>
            </div>
            <div class="fin-perf-list" id="perfSmartAgentList">
                <!-- Populated dynamically via JS -->
            </div>
        </div>

        <!-- Box 3: Super Agent -->
        <div class="fin-card fin-perf-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-purple-light"><i class="fa-solid fa-shield-halved text-purple"></i></div>
                    <span>Super Agent</span>
                </div>
            </div>
            <div class="fin-perf-list" id="perfSuperAgentList">
                <!-- Populated dynamically via JS -->
            </div>
        </div>

        <!-- Box 4: Closer -->
        <div class="fin-card fin-perf-card">
            <div class="fin-card-head">
                <div class="fin-card-brand-title">
                    <div class="fin-icon-box bg-amber-light"><i class="fa-solid fa-award text-amber"></i></div>
                    <span>Closer</span>
                </div>
            </div>
            <div class="fin-perf-list" id="perfCloserList">
                <!-- Populated dynamically via JS -->
            </div>
        </div>
    </div>
</section>

<?php require VIEWS_PATH . '/admin/layouts/footer.php'; ?>
