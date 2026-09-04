<?php
/**
 * Header Layout Template - Client User Portal
 */
$currentUser = $_SESSION['user'] ?? ($currentUser ?? [
    'id'        => null,
    'username'  => 'Client User',
    'full_name' => 'Client Officer',
    'role'      => 'client_user'
]);

$role = $currentUser['role'] ?? 'client_user';
$userInitials = 'CU';
if (!empty($currentUser['full_name'])) {
    $words = preg_split('/\s+/', trim($currentUser['full_name']));
    $userInitials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
} elseif (!empty($currentUser['username'])) {
    $userInitials = strtoupper(substr($currentUser['username'], 0, 2));
}

$displayRoleTitle = 'Client Manager';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle ?? 'Client Data - Finance Portal') ?></title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="<?= asset('css/style.css') ?>">
    <script>
        window.APP_CONFIG = {
            baseUrl: '<?= url() ?>',
            currentUser: <?= json_encode($currentUser ?? null) ?>,
            databaseClients: <?= !empty($clients) ? json_encode($clients) : '[]' ?>,
            databaseReports: <?= !empty($records) ? json_encode($records) : '[]' ?>,
            activeReportSummary: <?= !empty($activeReport) ? json_encode($activeReport) : 'null' ?>,
            availableWeeks: <?= !empty($availableWeeks) ? json_encode($availableWeeks) : '[]' ?>,
            activeWeek: <?= !empty($activeWeek) ? json_encode($activeWeek) : 'null' ?>,
            weeklyReports: <?= !empty($weeklyReports) ? json_encode($weeklyReports) : '[]' ?>,
            dashboardWeeklySummaries: <?= !empty($dashboardWeeklySummaries) ? json_encode($dashboardWeeklySummaries) : '{}' ?>,
            previousRemaining: <?= isset($previousRemaining) ? (float)$previousRemaining : 0.0 ?>,
            previousRemainingList: <?= !empty($previousRemainingList) ? json_encode($previousRemainingList) : '[]' ?>,
            databaseAgents: {
                smart: <?= (!empty($smartAgents) && is_array($smartAgents)) ? json_encode(array_column($smartAgents, 'name')) : '[]' ?>,
                super: <?= (!empty($superAgents) && is_array($superAgents)) ? json_encode(array_column($superAgents, 'name')) : '[]' ?>,
                closer: <?= (!empty($closers) && is_array($closers)) ? json_encode(array_column($closers, 'name')) : '[]' ?>
            }
        };
    </script>
</head>
<body>
    <!-- Master Full-Width App Layout with Topbar Navigation -->
    <div class="app-canvas">
        <div class="main-wrapper">
            <!-- Top Navbar Header -->
            <header class="top-navbar">
                <div class="nav-left">
                    <a href="<?= url('clients') ?>" class="header-brand">
                        <div class="brand-icon-leaf">
                            <i class="fa-solid fa-asterisk"></i>
                        </div>
                        <span class="brand-text">Finance Portal</span>
                    </a>
                </div>

                <!-- Top Navigation Links (Client User: ONLY Client Data) -->
                <nav class="top-nav-links">
                    <a href="<?= url('clients') ?>" class="top-nav-item active" id="navClients">
                        <i class="fa-solid fa-users"></i>
                        <span>Client Data</span>
                        <span class="badge-count" id="navClientCount" style="<?= (!empty($clients) && count($clients) > 0) ? 'display: inline-flex;' : '' ?>"><?= !empty($clients) ? count($clients) : '0' ?></span>
                    </a>
                </nav>

                <div class="nav-right">
                    <!-- User Profile Dropdown -->
                    <div class="user-profile-dropdown" id="userProfileDropdown">
                        <button class="user-profile-widget user-profile-btn" id="userProfileBtn" aria-expanded="false" aria-haspopup="true">
                            <div class="user-avatar-img">
                                <?= e($userInitials) ?>
                            </div>
                            <div class="user-meta-text">
                                <span class="user-meta-name"><?= e($currentUser['full_name'] ?? 'Client User') ?></span>
                                <span class="user-meta-title"><?= e($displayRoleTitle) ?></span>
                            </div>
                            <i class="fa-solid fa-chevron-down user-dropdown-arrow"></i>
                        </button>

                        <!-- Profile Dropdown Menu -->
                        <div class="user-dropdown-menu" id="userDropdownMenu">
                            <div class="user-dropdown-items">
                                <a href="<?= url('logout') ?>" class="user-dropdown-item dropdown-logout-btn" id="btnLogout" style="text-decoration:none;">
                                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                    <span>Logout</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Main Content Area -->
            <main class="page-content" id="mainContent">
