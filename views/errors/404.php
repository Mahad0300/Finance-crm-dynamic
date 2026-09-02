<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | Finance Portal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --bg-base: #f7fafc;
            --text-dark: #0f172a;
            --text-muted: #64748b;
            --accent: #10b981;
            --border: #e2e8f0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: var(--bg-base);
            color: var(--text-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
        }
        .error-card {
            background: #ffffff;
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 48px 36px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }
        .error-code {
            font-size: 72px;
            font-weight: 800;
            color: var(--accent);
            line-height: 1;
            margin-bottom: 12px;
            font-family: 'JetBrains Mono', monospace;
        }
        .error-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .error-desc {
            font-size: 14px;
            color: var(--text-muted);
            margin-bottom: 28px;
            line-height: 1.6;
        }
        .btn-home {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: #ffffff;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            transition: opacity 0.2s ease;
        }
        .btn-home:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-code">404</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-desc">The requested endpoint <code><?= htmlspecialchars($not_found_path ?? '', ENT_QUOTES, 'UTF-8') ?></code> could not be found on the server.</p>
        <a href="<?= defined('BASE_URL') ? BASE_URL : '/' ?>" class="btn-home">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Return to Portal</span>
        </a>
    </div>
</body>
</html>
