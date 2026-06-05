<?php

namespace App\Console\Commands;

use App\Http\Controllers\EcommerceReportController;
use App\Models\SavedEcommerceReport;
use App\Services\EmailLogger;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Sends Home Shopping saved-report emails on a weekly / monthly schedule.
 *
 * Runs daily; for each saved report whose recurrence frequency is due today
 * (Mondays for weekly, 1st of month for monthly), it re-runs the report
 * against the current date window and emails the recipients.
 *
 * The actual report payload reuses homeShoppingReportGenerate so the totals
 * always match what the user sees in the UI.
 */
class RunScheduledHomeShoppingReports extends Command
{
    protected $signature = 'reports:run-scheduled-home-shopping';

    protected $description = 'Run due recurring saved Home Shopping reports and email them.';

    public function handle(): int
    {
        $today = Carbon::today();

        $reports = SavedEcommerceReport::query()
            ->where('report_for', 'home_shopping')
            ->where('is_active', true)
            ->whereNotNull('recurrence_frequency')
            ->get();

        foreach ($reports as $report) {
            if (!$this->isDueToday($report->recurrence_frequency, $today, $report->last_emailed_at)) {
                continue;
            }
            $recipients = array_values(array_filter((array) $report->recipients));
            if (empty($recipients)) {
                continue;
            }

            $user = $report->user;
            if (!$user) {
                continue;
            }

            try {
                Auth::loginUsingId($user->id);
                $payload = $this->buildPayload($report, $today);
                $response = app(EcommerceReportController::class)
                    ->homeShoppingReportGenerate(new Request($payload));

                if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                    $body = json_decode($response->getContent(), true) ?? [];
                    $this->sendEmail($report->name, $recipients, $body);
                    $report->last_emailed_at = Carbon::now();
                    $report->save();
                } else {
                    EmailLogger::logFailure(
                        $recipients,
                        null,
                        new \RuntimeException(sprintf(
                            'Home Shopping report HTTP %d',
                            $response->getStatusCode()
                        )),
                        null,
                        $user->id,
                        'Home Shopping Report'
                    );
                }
            } catch (\Throwable $e) {
                Log::error('Scheduled home-shopping report failed', [
                    'saved_report_id' => $report->id,
                    'user_id'         => $report->user_id,
                    'message'         => $e->getMessage(),
                ]);
                EmailLogger::logFailure(
                    $recipients,
                    null,
                    $e,
                    null,
                    $user->id,
                    'Home Shopping Report'
                );
            } finally {
                Auth::logout();
            }
        }

        return self::SUCCESS;
    }

    protected function isDueToday(string $frequency, Carbon $today, $lastEmailedAt): bool
    {
        // Skip if already sent today (idempotent against re-runs).
        if ($lastEmailedAt && Carbon::parse($lastEmailedAt)->isSameDay($today)) {
            return false;
        }
        if ($frequency === 'weekly') {
            return $today->isMonday();
        }
        if ($frequency === 'monthly') {
            return $today->day === 1;
        }
        return false;
    }

    protected function buildPayload(SavedEcommerceReport $report, Carbon $today): array
    {
        $filters = $report->filters ?? [];

        // Auto-compute the date window based on frequency, ignoring any stale saved window.
        if (($report->recurrence_frequency ?? null) === 'weekly') {
            $filters['start_date'] = $today->copy()->subWeek()->startOfWeek()->toDateString();
            $filters['end_date']   = $today->copy()->subWeek()->endOfWeek()->toDateString();
        } elseif (($report->recurrence_frequency ?? null) === 'monthly') {
            $filters['start_date'] = $today->copy()->subMonthNoOverflow()->startOfMonth()->toDateString();
            $filters['end_date']   = $today->copy()->subMonthNoOverflow()->endOfMonth()->toDateString();
        }

        // Default to detail view if the saved filters did not specify a tab.
        $filters['reportOn'] = $filters['activeTab'] ?? 'detail';

        // Map "corporation": "broadcast_group:5" -> backend fields.
        if (!empty($filters['corporation'])) {
            [$type, $id] = explode(':', $filters['corporation']);
            $filters['corporation_type'] = $type;
            $filters['corporation_id']   = (int) $id;
        }

        return $filters;
    }

    protected function sendEmail(string $reportName, array $recipients, array $body): void
    {
        $summary = $body['summary'] ?? [];
        $rowCount = is_array($body['data'] ?? null) ? count($body['data']) : 0;

        $summaryHtml = '';
        foreach ($summary as $k => $v) {
            $summaryHtml .= '<tr><td style="padding:4px 12px 4px 0;">' . e($k) . '</td>'
                . '<td style="padding:4px 0;"><strong>' . e($v) . '</strong></td></tr>';
        }

        $html = '<p>Your scheduled Home Shopping report <strong>' . e($reportName) . '</strong> is ready.</p>'
            . '<p>Rows: ' . $rowCount . '</p>'
            . ($summaryHtml ? '<table>' . $summaryHtml . '</table>' : '')
            . '<p>Log into ConsumerEXP to view the full report.</p>';

        Mail::html($html, function ($message) use ($reportName, $recipients) {
            $message->subject('Home Shopping Report: ' . $reportName)->to($recipients);
        });
    }
}
