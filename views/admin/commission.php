<?php
$pageTitle = $pageTitle ?? 'Commission - Finance Portal';
$activeNav = 'commission';
$pageScript = 'commission.js';
require VIEWS_PATH . '/admin/layouts/header.php';
?>

<section class="view-section active" id="viewCommission">
    <div class="page-header-row">
        <div class="title-with-meta">
            <h1 class="page-main-title">Commission</h1>
        </div>
    </div>

    <!-- Clean Blank View Card matching Portal Style -->
    <div class="fin-card" style="padding: 60px 24px; text-align: center; border-radius: 12px; background: #ffffff; border: 1px solid var(--border-color, #e2e8f0); margin-top: 12px;">
        <div class="fin-icon-box" style="margin: 0 auto 16px; width: 64px; height: 64px; font-size: 1.75rem; border-radius: 14px; background: rgba(0, 168, 89, 0.1); display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-hand-holding-dollar" style="color: #00A859;"></i>
        </div>
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Commission Management</h2>
        <p style="color: #64748B; font-size: 0.92rem; max-width: 480px; margin: 0 auto; line-height: 1.5;">
            Welcome to the Commission section. This page is currently set up for Commission Management.
        </p>
    </div>
</section>

<?php require VIEWS_PATH . '/admin/layouts/footer.php'; ?>
