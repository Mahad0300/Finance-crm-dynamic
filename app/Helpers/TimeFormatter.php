<?php
namespace App\Helpers;

class TimeFormatter
{
    public static function formatDate(?string $dateString, string $format = 'M j, Y'): string
    {
        if (empty($dateString)) {
            return '-';
        }
        $timestamp = strtotime($dateString);
        return $timestamp ? date($format, $timestamp) : '-';
    }

    public static function formatRelativeTime(?string $timestamp): string
    {
        if (empty($timestamp)) {
            return 'Never';
        }
        $time = strtotime($timestamp);
        $diff = time() - $time;

        if ($diff < 60) {
            return 'Just now';
        }
        if ($diff < 3600) {
            return (int)floor($diff / 60) . 'm ago';
        }
        if ($diff < 86400) {
            return (int)floor($diff / 3600) . 'h ago';
        }
        return (int)floor($diff / 86400) . 'd ago';
    }
}
