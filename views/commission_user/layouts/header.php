<?php
/**
 * Header Layout Template - Commission User Portal
 */
$currentUser = $_SESSION['user'] ?? ($currentUser ?? [
    'id'        => null,
    'username'  => 'Commission User',
    'full_name' => 'Commission Officer',
    'role'      => 'commission_user'
]);

$role = $currentUser['role'] ?? 'commission_user';
$userInitials = 'CO';
if (!empty($currentUser['full_name'])) {
    $words = preg_split('/\s+/', trim($currentUser['full_name']));
    $userInitials = strtoupper(substr($words[0], 0, 1) . (isset($words[1]) ? substr($words[1], 0, 1) : ''));
} elseif (!empty($currentUser['username'])) {
    $userInitials = strtoupper(substr($currentUser['username'], 0, 2));
}

$displayRoleTitle = 'Commission Officer';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle ?? 'Commission - Finance Portal') ?></title>
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
            csrfToken: '<?= \App\Core\Session::csrfToken() ?>',
            currentUser: <?= json_encode($currentUser ?? null) ?>
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
                    <a href="<?= url('commission') ?>" class="header-brand">
                        <div class="brand-icon-leaf">
                            <i class="fa-solid fa-asterisk"></i>
                        </div>
                        <span class="brand-text">Finance Portal</span>
                    </a>
                </div>

                <!-- Top Navigation Links (Commission User: ONLY Commission) -->
                <nav class="top-nav-links">
                    <a href="<?= url('commission') ?>" class="top-nav-item active" id="navCommission">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                        <span>Commission</span>
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
                                <span class="user-meta-name"><?= e($currentUser['full_name'] ?? 'Commission Officer') ?></span>
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
