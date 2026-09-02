<?php
namespace App\Helpers;

class HtmlSanitizer
{
    public static function clean(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }
        return htmlspecialchars(trim($html), ENT_QUOTES, 'UTF-8');
    }

    public static function cleanArray(array $data): array
    {
        $cleaned = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $cleaned[$key] = self::cleanArray($value);
            } elseif (is_string($value)) {
                $cleaned[$key] = self::clean($value);
            } else {
                $cleaned[$key] = $value;
            }
        }
        return $cleaned;
    }
}
