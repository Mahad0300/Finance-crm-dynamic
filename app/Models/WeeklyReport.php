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

        $baseTimestamp = strtotime('2026-06-01');
        $diffWeeks = (int)round(($mondayTimestamp - $baseTimestamp) / (7 * 86400));
        $weekNumber = max(1, $diffWeeks + 1);

        $startFormatted = date('M d', $mondayTimestamp);
        $endFormatted = date('M d, Y', $sundayTimestamp);
        $dateRange = "{$startFormatted} - {$endFormatted}";
        $thursdayTimestamp = strtotime('+3 days', $mondayTimestamp);
        $cycleMonth = date('Y-m', $thursdayTimestamp);
        $title = "Week {$weekNumber}: {$dateRange}";

        return [
            'week_number'     => $weekNumber,
            'week_label'      => "Week {$weekNumber}",
            'date_range'      => $dateRange,
            'start_date'      => $startDate,
            'end_date'        => $endDate,
            'cycle_month'     => $cycleMonth,
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
                  AND `receiving` = 'Received'
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
     * - Only clients with status = 'Charged' AND receiving = 'Received' are included
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

        // 1. New Approvals signed up during this Monday-Sunday week (Only Charged & Received)
        $sqlNew = "SELECT `id`, `initial_payment_date` as `date`, `client_name`, `plan`, 
                          `approval_amount` as `approval_payment`, NULL as `residual_payment`, 
                          'Approval Payment' as `payment_type`, `receiving`, `id` as `client_id`
                   FROM `clients`
                   WHERE `status` = 'Charged'
                     AND `receiving` = 'Received'
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

        // 3. Recurring Residuals from clients created before this week (Only Charged & Received)
        $sqlPast = "SELECT `id`, `initial_payment_date`, `client_name`, `plan`, `residual`, `receiving`
                    FROM `clients`
                    WHERE `status` = 'Charged'
                      AND `receiving` = 'Received'
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
     * If Total Received was 0 or unentered (user forgot to enter), full target carries forward.
     * Returns an array of items: [['title' => '...', 'start_date' => '...', 'remaining' => 345.00], ...]
     */
    public function getPreviousRemainingBreakdown(string $currentStartDate): array {
        if (!$this->isConnected()) return [];

        $today = date('Y-m-d');

        $sql = "SELECT `id`, `title`, `start_date`, `end_date`, `total_receiving_target`, `total_received_entered`, `total_remaining_balance` 
                FROM `weekly_reports` 
                WHERE `start_date` < :start_date 
                  AND `end_date` < :today
                ORDER BY `start_date` ASC";
        $rows = $this->fetchAll($sql, [
            ':start_date' => $currentStartDate,
            ':today'      => $today
        ]);
        
        $breakdown = [];
        foreach ($rows as $r) {
            $target = (float)($r['total_receiving_target'] ?? 0);
            if ($target <= 0) {
                $txs = $this->getWeeklyTransactions($r['start_date'], $r['end_date']);
                foreach ($txs as $t) {
                    $target += (float)($t['approval_payment'] ?? 0) + (float)($t['residual_payment'] ?? 0);
                }
            }

            if ($r['total_remaining_balance'] !== null) {
                $rem = (float)$r['total_remaining_balance'];
            } else {
                // If user entered 0 or forgot to enter, the remaining is target - received
                $received = $r['total_received_entered'] !== null ? (float)$r['total_received_entered'] : 0.0;
                $rem = max(0, $target - $received);
            }

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

    public function getAllReports(): array {
        if (!$this->isConnected()) return [];
        $sql = "SELECT `id`, `title`, `start_date`, `end_date`, `total_receiving_target`, `total_received_entered`, `total_remaining_balance`, `status` 
                FROM `weekly_reports` 
                ORDER BY `start_date` DESC";
        return $this->fetchAll($sql);
    }

    public function getDashboardWeeklySummaries(): array {
        if (!$this->isConnected()) return [];
        $weeks = $this->getAvailableWeeks();
        $summaries = [];
        foreach ($weeks as $w) {
            $txs = $this->getWeeklyTransactions($w['start_date'], $w['end_date']);
            $approval = 0.0;
            $residual = 0.0;
            foreach ($txs as $t) {
                $approval += (float)($t['approval_payment'] ?? 0);
                $residual += (float)($t['residual_payment'] ?? 0);
            }
            $rep = $this->getOrCreateWeeklyReport($w['start_date'], $w['end_date']);
            $prevRem = $this->getPreviousRemainingBalance($w['start_date']);
            $target = $approval + $residual;
            $entered = $rep['total_received_entered'] !== null ? (float)$rep['total_received_entered'] : 0.0;
            $rem = max(0, $target - $entered);

            $summaries[$w['start_date']] = [
                'start_date'      => $w['start_date'],
                'end_date'        => $w['end_date'],
                'cycle_month'     => $w['cycle_month'] ?? date('Y-m', strtotime('+3 days', strtotime($w['start_date']))),
                'title'           => $w['title'],
                'approval'        => $approval,
                'residual'        => $residual,
                'prev_remaining'  => $prevRem,
                'total_receiving' => $target,
                'total_received'  => $entered,
                'total_remaining' => $rem,
                'transactions'    => $txs
            ];
        }
        return $summaries;
    }

    /**
     * Get full historical and scheduled statement/ledger for a specific client
     */
    public function getClientStatement(int $clientId): ?array
    {
        if (!$this->isConnected()) return null;

        $stmt = $this->query("SELECT * FROM clients WHERE id = :id", [':id' => $clientId]);
        $client = $stmt ? $stmt->fetch(\PDO::FETCH_ASSOC) : null;
        if (!$client) return null;

        $initDate = $client['initial_payment_date'] ?: $client['date'];
        if (!$initDate || $initDate === '0000-00-00') return null;

        $statement = [];
        $meta1 = $this->getWeekMeta($initDate);
        $statement[] = [
            'id'               => (int)$client['id'],
            'client_id'        => (int)$client['id'],
            'client_name'      => $client['client_name'],
            'date'             => $initDate,
            'payment_type'     => 'Approval Payment',
            'plan'             => $client['plan'],
            'week_title'       => $meta1['title'],
            'approval_payment' => (float)$client['approval_amount'],
            'residual_payment' => null,
            'receiving'        => $client['receiving'],
            'is_received'      => (strtolower((string)$client['receiving']) === 'received' || $client['receiving'] == 1)
        ];

        $planMonths = (int)($client['plan'] ?: 12);
        $initTs = strtotime($initDate);
        $initDay = (int)date('d', $initTs);
        $todayTs = time();

        for ($m = 2; $m <= $planMonths; $m++) {
            $monthOffset = $m - 1;
            $targetMonthTs = strtotime("+{$monthOffset} month", $initTs);
            $targetYear = (int)date('Y', $targetMonthTs);
            $targetMonth = (int)date('m', $targetMonthTs);
            $daysInMonth = (int)cal_days_in_month(CAL_GREGORIAN, $targetMonth, $targetYear);
            $actualDay = min($initDay, $daysInMonth);
            $resDate = sprintf('%04d-%02d-%02d', $targetYear, $targetMonth, $actualDay);
            $resTs = strtotime($resDate);

            // Only include actual transactions that have occurred (No future scheduled rows)
            if ($resTs > $todayTs) {
                break;
            }

            $metaM = $this->getWeekMeta($resDate);

            $statement[] = [
                'id'               => (int)$client['id'],
                'client_id'        => (int)$client['id'],
                'client_name'      => $client['client_name'],
                'date'             => $resDate,
                'payment_type'     => "Month {$m} Residual",
                'plan'             => $client['plan'],
                'week_title'       => $metaM['title'],
                'approval_payment' => null,
                'residual_payment' => (float)$client['residual'],
                'receiving'        => $client['receiving'],
                'is_received'      => (strtolower((string)$client['receiving']) === 'received' || $client['receiving'] == 1)
            ];
        }

        return [
            'client' => [
                'id'                   => (int)$client['id'],
                'name'                 => $client['client_name'],
                'plan'                 => (int)$client['plan'],
                'initial_payment'      => (float)$client['initial_payment'],
                'initial_payment_date' => $client['initial_payment_date'],
                'approval_amount'      => (float)$client['approval_amount'],
                'residual'             => (float)$client['residual'],
                'status'               => $client['status'],
                'receiving'            => $client['receiving']
            ],
            'records' => $statement
        ];
    }
}
