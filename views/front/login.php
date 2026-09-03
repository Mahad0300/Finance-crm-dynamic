<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle ?? 'Sign In - Finance Portal') ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --primary: #00A859;
            --primary-hover: #00924C;
            --primary-ring: rgba(0, 168, 89, 0.14);
            --text-dark: #0F172A;
            --text-muted: #64748B;
            --text-light: #94A3B8;
            --border-color: #E2E8F0;
            --border-focus: #00A859;
            --bg-page: #F8FAFC;
            --bg-card: #FFFFFF;
            --radius-md: 10px;
            --radius-lg: 16px;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-dark);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }

        .login-container {
            width: 100%;
            max-width: 420px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Brand Header */
        .brand-header {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .brand-logo-wrap {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }

        .brand-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #00A859 0%, #008f4c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 18px;
            box-shadow: 0 4px 10px rgba(0, 168, 89, 0.2);
        }

        .brand-name {
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: var(--text-dark);
            letter-spacing: -0.4px;
        }

        /* Professional Clean Card */
        .login-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 34px 30px;
            box-shadow: 
                0 10px 25px -5px rgba(15, 23, 42, 0.05),
                0 8px 10px -6px rgba(15, 23, 42, 0.02);
        }

        .login-card-header {
            margin-bottom: 22px;
        }

        .login-card-title {
            font-size: 21px;
            font-weight: 700;
            color: var(--text-dark);
            letter-spacing: -0.3px;
            margin-bottom: 5px;
        }

        .login-card-subtitle {
            font-size: 13.5px;
            color: var(--text-muted);
            line-height: 1.45;
        }

        /* Error Alert Box */
        .alert-error {
            background: #FEF2F2;
            border: 1px solid #FCA5A5;
            color: #991B1B;
            border-radius: 8px;
            padding: 11px 13px;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 9px;
        }

        .alert-error i {
            font-size: 15px;
            color: #DC2626;
            flex-shrink: 0;
        }

        /* Form Fields */
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
        }

        .form-label {
            font-size: 13px;
            font-weight: 600;
            color: #334155;
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-icon-left {
            position: absolute;
            left: 14px;
            color: var(--text-light);
            font-size: 14px;
            pointer-events: none;
            transition: color 0.15s ease;
        }

        .form-control {
            width: 100%;
            height: 44px;
            padding: 0 40px 0 38px;
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: var(--radius-md);
            font-size: 14px;
            color: var(--text-dark);
            outline: none;
            transition: all 0.15s ease;
            font-family: inherit;
        }

        .form-control::placeholder {
            color: #94A3B8;
            font-weight: 400;
        }

        .form-control:focus {
            border-color: var(--border-focus);
            box-shadow: 0 0 0 3px var(--primary-ring);
        }

        .form-control:focus + .input-icon-left,
        .input-wrapper:focus-within .input-icon-left {
            color: var(--primary);
        }

        .btn-toggle-pwd {
            position: absolute;
            right: 10px;
            background: transparent;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            padding: 6px;
            font-size: 14px;
            border-radius: 4px;
            transition: color 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-toggle-pwd:hover {
            color: var(--text-dark);
        }

        /* Submit Button */
        .btn-submit {
            width: 100%;
            height: 45px;
            margin-top: 8px;
            background: var(--primary);
            color: #FFFFFF;
            border: none;
            border-radius: var(--radius-md);
            font-size: 14.5px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.15s ease;
            box-shadow: 0 4px 10px rgba(0, 168, 89, 0.2);
            font-family: inherit;
        }

        .btn-submit:hover {
            background: var(--primary-hover);
            box-shadow: 0 6px 14px rgba(0, 168, 89, 0.28);
            transform: translateY(-1px);
        }

        .btn-submit:active {
            transform: translateY(0);
            box-shadow: 0 2px 5px rgba(0, 168, 89, 0.2);
        }

        .btn-submit i {
            transition: transform 0.15s ease;
            font-size: 13px;
        }

        .btn-submit:hover i {
            transform: translateX(3px);
        }
    </style>
</head>
<body>
    <div class="login-container">
        <!-- Brand Header -->
        <div class="brand-header">
            <div class="brand-logo-wrap">
                <div class="brand-icon-box">
                    <i class="fa-solid fa-bolt"></i>
                </div>
                <span class="brand-name">Finance Portal</span>
            </div>
        </div>

        <!-- Login Card -->
        <div class="login-card">
            <div class="login-card-header">
                <h1 class="login-card-title">Sign in to your account</h1>
                <p class="login-card-subtitle">Welcome back. Enter your credentials to access the portal.</p>
            </div>

            <?php if (!empty($error)): ?>
                <div class="alert-error" role="alert">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span><?= e($error) ?></span>
                </div>
            <?php endif; ?>

            <form action="<?= url('login') ?>" method="POST" autocomplete="on">
                <div class="form-group">
                    <label for="inputUsername" class="form-label">Username or Email</label>
                    <div class="input-wrapper">
                        <i class="fa-regular fa-envelope input-icon-left"></i>
                        <input 
                            type="text" 
                            name="username" 
                            id="inputUsername" 
                            class="form-control" 
                            placeholder="Enter username or email" 
                            required 
                            autofocus
                            autocomplete="username">
                    </div>
                </div>

                <div class="form-group">
                    <label for="inputPassword" class="form-label">Password</label>
                    <div class="input-wrapper">
                        <i class="fa-solid fa-lock input-icon-left"></i>
                        <input 
                            type="password" 
                            name="password" 
                            id="inputPassword" 
                            class="form-control" 
                            placeholder="••••••••" 
                            required
                            autocomplete="current-password">
                        <button type="button" class="btn-toggle-pwd" id="btnTogglePwd" title="Show or hide password" aria-label="Toggle password visibility">
                            <i class="fa-regular fa-eye" id="pwdEyeIcon"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-submit" id="btnSubmitLogin">
                    <span>Sign In</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>
        </div>
    </div>

    <script>
        // Password Visibility Toggle
        const btnTogglePwd = document.getElementById('btnTogglePwd');
        const inputPassword = document.getElementById('inputPassword');
        const pwdEyeIcon = document.getElementById('pwdEyeIcon');

        if (btnTogglePwd && inputPassword && pwdEyeIcon) {
            btnTogglePwd.addEventListener('click', () => {
                const isPassword = inputPassword.getAttribute('type') === 'password';
                inputPassword.setAttribute('type', isPassword ? 'text' : 'password');
                pwdEyeIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
            });
        }
    </script>
</body>
</html>
