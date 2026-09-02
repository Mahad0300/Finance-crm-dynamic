<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle ?? 'Sign In - Finance Portal') ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="<?= asset('css/style.css') ?>">
    <style>
        .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 70%, #080d1a 100%);
            padding: 24px;
        }
        .login-card {
            width: 100%;
            max-width: 420px;
            background: #111827;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            padding: 36px 32px;
            color: #f8fafc;
        }
        .login-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        .login-brand-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, #10b981, #059669);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #fff;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        }
        .login-brand-title {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #f8fafc;
        }
        .login-heading {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 6px;
            color: #ffffff;
        }
        .login-sub {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 28px;
        }
        .login-field {
            margin-bottom: 20px;
        }
        .login-field label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #cbd5e1;
            margin-bottom: 8px;
        }
        .login-input-wrap {
            position: relative;
        }
        .login-input-wrap i {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            font-size: 14px;
        }
        .login-input {
            width: 100%;
            height: 44px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0 14px 0 40px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
        }
        .login-input:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
        .btn-login-submit {
            width: 100%;
            height: 46px;
            background: #10b981;
            color: #ffffff;
            font-size: 15px;
            font-weight: 700;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background 0.2s ease, transform 0.1s ease;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
            margin-top: 24px;
        }
        .btn-login-submit:hover {
            background: #059669;
        }
        .btn-login-submit:active {
            transform: scale(0.99);
        }
        .login-alert-error {
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid #ef4444;
            color: #ef4444;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
    </style>
</head>
<body>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-brand">
                <div class="login-brand-icon">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
                <div class="login-brand-title">Finance Portal CRM</div>
            </div>

            <h1 class="login-heading">Welcome Back</h1>
            <p class="login-sub">Enter your credentials to access the portal</p>

            <?php if (!empty($error)): ?>
                <div class="login-alert-error">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span><?= e($error) ?></span>
                </div>
            <?php endif; ?>

            <form action="<?= url('login') ?>" method="POST">
                <div class="login-field">
                    <label for="inputUsername">Username or Email</label>
                    <div class="login-input-wrap">
                        <i class="fa-solid fa-user"></i>
                        <input type="text" name="username" id="inputUsername" class="login-input" placeholder="Enter username or email" required autofocus>
                    </div>
                </div>

                <div class="login-field">
                    <label for="inputPassword">Password</label>
                    <div class="login-input-wrap">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" name="password" id="inputPassword" class="login-input" placeholder="Enter password" required>
                    </div>
                </div>

                <button type="submit" class="btn-login-submit">
                    <span>Sign In to Portal</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>
        </div>
    </div>
</body>
</html>
