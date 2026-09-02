<?php
namespace App\Models;

use App\Core\Model;

class WeeklyReport extends Model {

    /**
     * Calculate Monday-Friday work week dates, next Tuesday audit date, and next Friday due date.
     */
    public function getWeekMeta(string $dateStr): array {
        $timestamp = strtotime($dateStr);
        if (!$timestamp) $timestamp = time();

        // 1 = Monday, 7 = Sunday
        $dayOfWeek = (int)date('N', $timestamp);
        
        // Monday of this week
        $mondayTimestamp = strtotime('-' . ($dayOfWeek - 1) . ' days', $timestamp);
        // Sunday of this week (Monday + 6 days)
        $sundayTimestamp = strtotime('+6 days', $mondayTimestamp);
        
        // Audit Tuesday (Tuesday of following week = Monday + 8 days)
        $auditTimestamp = strtotime('+8 days', $mondayTimestamp);
        // Due Friday (Friday of following week = Monday + 11 days)
        $dueTimestamp = strtotime('+11 days', $mondayTimestamp);

        $startDate = date('Y-m-d', $mondayTimestamp);
        $endDate = date('Y-m-d', $sundayTimestamp);
        $auditDate = date('Y-m-d', $auditTimestamp);
        $dueDate = date('Y-m-d', $dueTimestamp);

        $startFormatted = date('M d', $mondayTimestamp);
        $endFormatted = date('M d, Y', $sundayTimestamp);
        $title = "{$startFormatted} - {$endFormatted}";

        return [
            'start_date'      => $startDate,
            'end_date'        => $endDate,
            'title'           => $title,
            'audit_date'      => $auditDate,
            'due_date'        => $dueDate,
            'audit_formatted' => date('D, M d, Y', $auditTimestamp),
            'due_formatted'   => date('D, M d, Y', $dueTimestamp)
        ];
    }

    /**
     * Find all distinct completed Monday-Sunday weeks where clients have initial_payment_date.
     * Future or ongoing weeks whose audit date has not arrived yet will NOT be available.
     * E.g. Aug 31 - Sep 06 week will become available on Tue, Sep 08 (its audit day).
     */
    public function getAvailableWeeks(): array {
        if (!$this->isConnected()) return [];

        $today = date('Y-m-d');

        $sql = "SELECT DISTINCT `initial_payment_date` 
                FROM `clients` 
                WHERE `status` = 'Charged'
                  AND `initial_payment_date` IS NOT NULL 
                  AND `initial_payment_date` != '' 
                  AND `initial_payment_date` != '0000-00-00'
                ORDER BY `initial_payment_date` DESC";
        $dates = $this->fetchAll($sql);

        $weeksMap = [];
        foreach ($dates as $row) {
            $d = $row['initial_payment_date'];
            $meta = $this->getWeekMeta($d);

            // Only completed weeks whose audit day has arrived
            // (e.g. week Aug 31 - Sep 06 will only show up on or after Tue, Sep 08)
            if ($meta['end_date'] < $today && $meta['audit_date'] <= $today) {
                $key = $meta['start_date'] . '_' . $meta['end_date'];
                if (!isset($weeksMap[$key])) {
                    $weeksMap[$key] = $meta;
                }
            }
        }

        // Sort weeks descending (latest completed week first)
        uasort($weeksMap, function($a, $b) {
            return strcmp($b['start_date'], $a['start_date']);
        });

        return array_values($weeksMap);
    }

    /**
     * Get weekly transactions:
     * - Only clients with status = 'Charged' are included
     * - Monday to Sunday (7 days full cycle)
     * - Month 1: New Signups get Upfront Approval Payment (Residual is NULL)
     * - Month 2+: Active Recurring Clients get Monthly Residual (Approval is NULL)
     * Never both in the same month!
     */
    public function getClientsByWeek(string $mondayDate, string $sundayDate): array {
        return $this->getWeeklyTransactions($mondayDate, $sundayDate);
    }

    public function getWeeklyTransactions(string $mondayDate, string $sundayDate): array {
        if (!$this->isConnected()) return [];

        // 1. New Approvals signed up during this Monday-Sunday week (Only Charged)
        $sqlNew = "SELECT `id`, `initial_payment_date` as `date`, `client_name`, `plan`, 
                          `approval_amount` as `approval_payment`, NULL as `residual_payment`, 
                          'Approval Payment' as `payment_type`, `receiving`, `id` as `client_id`
                   FROM `clients`
                   WHERE `status` = 'Charged'
                     AND `initial_payment_date` >= :start_date 
                     AND `initial_payment_date` <= :end_date
                   ORDER BY `initial_payment_date` ASC, `id` ASC";
        $stmtNew = $this->query($sqlNew, [':start_date' => $mondayDate, ':end_date' => $sundayDate]);
        $newApprovals = $stmtNew ? $stmtNew->fetchAll(\PDO::FETCH_ASSOC) : [];

        // 2. Build map of the 7 days in this week (Monday through Sunday)
        $workDays = [];
        $curr = strtotime($mondayDate);
        $sun = strtotime($sundayDate);
        while ($curr <= $sun) {
            $workDays[date('Y-m-d', $curr)] = [
                'date_str'    => date('Y-m-d', $curr),
                'day'         => (int)date('d', $curr),
                'month'       => (int)date('m', $curr),
                'year'        => (int)date('Y', $curr),
                'day_of_week' => (int)date('N', $curr) // 1=Mon, 7=Sun
            ];
            $curr = strtotime('+1 day', $curr);
        }

        // 3. Recurring Residuals from clients created before this week (Only Charged)
        $sqlPast = "SELECT `id`, `initial_payment_date`, `client_name`, `plan`, `residual`, `receiving`
                    FROM `clients`
                    WHERE `status` = 'Charged'
                      AND `initial_payment_date` < :start_date 
                      AND `residual` > 0
                    ORDER BY `id` ASC";
        $stmtPast = $this->query($sqlPast, [':start_date' => $mondayDate]);
        $pastClients = $stmtPast ? $stmtPast->fetchAll(\PDO::FETCH_ASSOC) : [];

        $residuals = [];
        foreach ($pastClients as $pc) {
            $initTime = strtotime($pc['initial_payment_date']);
            $initDay = (int)date('d', $initTime);
            $initYear = (int)date('Y', $initTime);
            $initMonth = (int)date('m', $initTime);

            foreach ($workDays as $wd) {
                $monthsElapsed = ($wd['year'] - $initYear) * 12 + ($wd['month'] - $initMonth);
                if ($monthsElapsed >= 1 && $monthsElapsed < (int)$pc['plan']) {
                    $daysInMonth = (int)date('t', strtotime($wd['date_str']));
                    $targetDay = min($initDay, $daysInMonth);
                    
                    if ($wd['day'] === $targetDay) {
                        $residuals[] = [
                            'id'               => (int)$pc['id'],
                            'client_id'        => (int)$pc['id'],
                            'date'             => $wd['date_str'],
                            'client_name'      => $pc['client_name'],
                            'plan'             => $pc['plan'],
                            'approval_payment' => null,
                            'residual_payment' => $pc['residual'],
                            'payment_type'     => "Month " . ($monthsElapsed + 1) . " Residual",
                            'receiving'        => $pc['receiving']
                        ];
                    }
                }
            }
        }

        $allTransactions = array_merge($newApprovals, $residuals);
        usort($allTransactions, function($a, $b) {
            $cmp = strcmp($a['date'], $b['date']);
            if ($cmp === 0) {
                return strcmp($a['client_name'], $b['client_name']);
            }
            return $cmp;
        });

        return $allTransactions;
    }

    /**
     * Get all previous weeks that have an unpaid remaining balance.
     * Returns an array of items: [['title' => '...', 'start_date' => '...', 'remaining' => 345.00], ...]
     */
    public function getPreviousRemainingBreakdown(string $currentStartDate): array {
        if (!$this->isConnected()) return [];

        $sql = "SELECT `id`, `title`, `start_date`, `end_date`, `total_remaining_balance` 
                FROM `weekly_reports` 
                WHERE `start_date` < :start_date 
                  AND `total_remaining_balance` IS NOT NULL
                  AND `total_remaining_balance` > 0
                ORDER BY `start_date` ASC";
        $rows = $this->fetchAll($sql, [':start_date' => $currentStartDate]);
        
        $breakdown = [];
        foreach ($rows as $r) {
            $rem = (float)$r['total_remaining_balance'];
            if ($rem > 0) {
                $breakdown[] = [
                    'id'         => (int)$r['id'],
                    'title'      => $r['title'],
                    'start_date' => $r['start_date'],
                    'end_date'   => $r['end_date'],
                    'remaining'  => $rem
                ];
            }
        }
        return $breakdown;
    }

    /**
     * Get Total Previous Remaining Balance (sum of all unpaid past weeks).
     */
    public function getPreviousRemainingBalance(string $currentStartDate): float {
        $breakdown = $this->getPreviousRemainingBreakdown($currentStartDate);
        $sum = 0.0;
        foreach ($breakdown as $item) {
            $sum += $item['remaining'];
        }
        return $sum;
    }



    /**
     * Get or create a weekly_reports summary record to hold total_received_entered.
     */
    public function getOrCreateWeeklyReport(string $startDate, string $endDate): ?array {
        if (!$this->isConnected()) return null;

        $sql = "SELECT * FROM `weekly_reports` WHERE `start_date` = :start_date AND `end_date` = :end_date LIMIT 1";
        $report = $this->fetchOne($sql, [
            ':start_date' => $startDate,
            ':end_date'   => $endDate
        ]);

        if ($report) {
            return $report;
        }

        $meta = $this->getWeekMeta($startDate);
        $insertSql = "INSERT INTO `weekly_reports` (`title`, `start_date`, `end_date`, `status`) 
                      VALUES (:title, :start_date, :end_date, 'active')";
        $this->query($insertSql, [
            ':title'      => $meta['title'],
            ':start_date' => $startDate,
            ':end_date'   => $endDate
        ]);

        return $this->fetchOne($sql, [
            ':start_date' => $startDate,
            ':end_date'   => $endDate
        ]);
    }

    public function toggleClientReceived(int $clientId, int $isReceived): bool {
        if (!$this->isConnected()) return false;
        $receiving = $isReceived ? 'Received' : 'Pending';
        $sql = "UPDATE `clients` SET `receiving` = :receiving WHERE `id` = :id";
        return $this->query($sql, [':id' => $clientId, ':receiving' => $receiving]) !== null;
    }

    public function updateFooterTotals(int $reportId, ?float $totalReceived, ?float $totalRemaining, ?float $totalTarget = null): bool {
        if (!$this->isConnected()) return false;
        if ($totalTarget !== null) {
            $sql = "UPDATE `weekly_reports` SET `total_receiving_target` = :target, `total_received_entered` = :received, `total_remaining_balance` = :remaining WHERE `id` = :id";
            return $this->query($sql, [
                ':id'        => $reportId,
                ':target'    => $totalTarget,
                ':received'  => $totalReceived,
                ':remaining' => $totalRemaining
            ]) !== null;
        }
        $sql = "UPDATE `weekly_reports` SET `total_received_entered` = :received, `total_remaining_balance` = :remaining WHERE `id` = :id";
        return $this->query($sql, [
            ':id'        => $reportId,
            ':received'  => $totalReceived,
            ':remaining' => $totalRemaining
        ]) !== null;
    }
}
