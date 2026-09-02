<?php
namespace App\Core;

use Throwable;

class ErrorHandler
{
    public static function register(): void
    {
        set_exception_handler([self::class, 'handleException']);
        set_error_handler([self::class, 'handleError']);
        register_shutdown_function([self::class, 'handleFatalError']);

        if (!defined('APP_DEBUG') || !APP_DEBUG) {
            ini_set('display_errors', '0');
        }
    }

    public static function handleException(Throwable $exception): void
    {
        self::logError($exception);
        $debug = defined('APP_DEBUG') && APP_DEBUG;
        self::renderErrorPage(500, $debug ? $exception->getMessage() : 'An unexpected error occurred.');
    }

    public static function handleError(int $level, string $message, string $file, int $line): bool
    {
        if (error_reporting() & $level) {
            self::handleException(new \ErrorException($message, 0, $level, $file, $line));
        }

        return true;
    }

    public static function handleFatalError(): void
    {
        $error = error_get_last();

        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            self::handleException(new \ErrorException(
                $error['message'],
                0,
                $error['type'],
                $error['file'],
                $error['line']
            ));
        }
    }

    public static function logError(Throwable $exception): void
    {
        $logDir = defined('ROOT_DIR') ? ROOT_DIR . '/storage/logs' : dirname(__DIR__, 2) . '/storage/logs';
        $isWritable = true;

        if (!is_dir($logDir)) {
            if (!@mkdir($logDir, 0775, true)) {
                $isWritable = false;
            }
        } elseif (!is_writable($logDir)) {
            $isWritable = false;
        }

        $message = sprintf(
            "[%s] %s: %s in %s on line %d\nStack trace:\n%s\n--------------------------------------------------\n",
            date('Y-m-d H:i:s'),
            get_class($exception),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine(),
            $exception->getTraceAsString()
        );

        $logFile = $logDir . '/error-' . date('Y-m-d') . '.log';

        if ($isWritable && (!is_file($logFile) || is_writable($logFile))) {
            @error_log($message, 3, $logFile);
        } else {
            @error_log($message, 0);
        }
    }

    private static function renderErrorPage(int $code, string $message): void
    {
        http_response_code($code);

        while (ob_get_level()) {
            ob_end_clean();
        }

        $viewDir = defined('VIEW_DIR') ? VIEW_DIR : dirname(__DIR__, 2) . '/views';
        $codeTemplate = $viewDir . '/errors/' . $code . '.php';
        $fallbackTemplate = ($code >= 500 || $code === 0)
            ? $viewDir . '/errors/500.php'
            : $viewDir . '/errors/404.php';

        $error_message = $message;
        $not_found_path = $message;

        if (is_file($codeTemplate)) {
            require $codeTemplate;
        } elseif (is_file($fallbackTemplate)) {
            require $fallbackTemplate;
        } else {
            echo '<h1>Error ' . $code . '</h1><p>' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p>';
        }

        exit;
    }
}
