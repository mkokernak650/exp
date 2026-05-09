<?php

namespace App\Console\Commands;

use App\Http\Controllers\EcommerceReportController;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\SavedEcommerceReport;
use App\Services\EmailLogger;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RunScheduledEcommerceReports extends Command
{
    protected $signature = 'reports:run-scheduled-ecommerce';

    protected $description = 'Run due recurring saved ecommerce reports and send emails.';

    public function handle(): int
    {
        $today = Carbon::today();
        $reports = SavedEcommerceReport::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query
                    ->whereNull('last_generated_at')
                    ->orWhereDate('last_generated_at', '<', Carbon::today());
            })
            ->get();

        foreach ($reports as $report) {
            $filters = $report->filters ?? [];
            if (!$this->isDueToday($filters, $today)) {
                continue;
            }

            $user = $report->user;
            if (!$user) {
                continue;
            }

            $payload = $report->filters ?? [];

            try {
                $payload = $this->buildPayload($report);
                Auth::loginUsingId($user->id);

                $response = app(EcommerceReportController::class)
                    ->ecommerceReportGenerate(new Request($payload));

                if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                    $report->last_generated_at = Carbon::now();
                    $report->save();
                } else {
                    $recipients = $this->resolveRecipientsFromPayload($payload);
                    EmailLogger::logFailure(
                        $recipients,
                        null,
                        new \RuntimeException(sprintf(
                            'Report generation returned HTTP %d: %s',
                            $response->getStatusCode(),
                            $response->getContent()
                        )),
                        null,
                        $user->id,
                        'Ecommerce Report'
                    );
                }
            } catch (\Throwable $exception) {
                Log::error('Scheduled ecommerce report failed', [
                    'saved_report_id' => $report->id,
                    'user_id' => $report->user_id,
                    'message' => $exception->getMessage(),
                ]);
                EmailLogger::logFailure(
                    $this->resolveRecipientsFromPayload($payload),
                    null,
                    $exception,
                    null,
                    $user->id,
                    'Ecommerce Report'
                );
            } finally {
                Auth::logout();
            }
        }

        return self::SUCCESS;
    }

    protected function buildPayload(SavedEcommerceReport $report): array
    {
        $filters = $report->filters ?? [];
        $filters['report_type'] = 'email-report';

        // Preserve manual setup for UI, but ensure recurring manual picks the expected window.
        if (($filters['report_setup'] ?? 'manual') === 'manual') {
            $filters['recurrence_enabled'] = true;
        }

        if (($filters['type'] ?? 'customer') === 'affiliate') {
            $affiliateIds = $filters['affiliate_id'] ?? [];
            if (in_array('allAffiliates', $affiliateIds, true)) {
                $filters['affiliatesEmail'] = Affiliate::query()
                    ->whereNotNull('email')
                    ->pluck('email')
                    ->filter()
                    ->values()
                    ->toArray();
            } else {
                $filters['affiliatesEmail'] = Affiliate::query()
                    ->whereIn('id', $affiliateIds)
                    ->whereNotNull('email')
                    ->pluck('email')
                    ->filter()
                    ->values()
                    ->toArray();
            }
        }

        return $filters;
    }

    protected function isDueToday(array $filters, Carbon $today): bool
    {
        if (($filters['report_setup'] ?? 'manual') !== 'manual') {
            return false;
        }

        if (!($filters['recurrence_enabled'] ?? false)) {
            return false;
        }

        $frequency = $filters['recurrence_frequency'] ?? null;
        $weekday = isset($filters['recurrence_weekday']) ? (int) $filters['recurrence_weekday'] : null;
        $ordinal = isset($filters['recurrence_ordinal']) ? (int) $filters['recurrence_ordinal'] : null;

        if ($frequency === 'weekly') {
            return $weekday !== null && $today->dayOfWeek === $weekday;
        }

        if ($frequency === 'monthly') {
            if ($weekday === null || $ordinal === null) {
                return false;
            }
            return $today->isSameDay($this->getNthWeekdayOfRange($today->copy()->startOfMonth(), $today->copy()->endOfMonth(), $weekday, $ordinal));
        }

        if ($frequency === 'broadcast_monthly') {
            if ($weekday === null || $ordinal === null) {
                return false;
            }

            $broadcastMonth = BroadCastMonth::active()
                ->whereDate('start_date', '<=', $today->toDateString())
                ->whereDate('end_date', '>=', $today->toDateString())
                ->first();

            if (!$broadcastMonth) {
                return false;
            }

            $start = Carbon::parse($broadcastMonth->start_date);
            $end = Carbon::parse($broadcastMonth->end_date);

            return $today->isSameDay($this->getNthWeekdayOfRange($start, $end, $weekday, $ordinal));
        }

        return false;
    }

    protected function resolveRecipientsFromPayload(array $payload): array
    {
        if (($payload['type'] ?? 'customer') === 'affiliate') {
            return array_values(array_filter((array) ($payload['affiliatesEmail'] ?? [])));
        }
        return array_values(array_filter((array) ($payload['emails'] ?? [])));
    }

    protected function getNthWeekdayOfRange(Carbon $start, Carbon $end, int $weekday, int $ordinal): ?Carbon
    {
        if ($ordinal < 1 || $ordinal > 4) {
            return null;
        }

        $cursor = $start->copy();
        $matches = [];
        while ($cursor->lte($end)) {
            if ($cursor->dayOfWeek === $weekday) {
                $matches[] = $cursor->copy();
            }
            $cursor->addDay();
        }

        return $matches[$ordinal - 1] ?? null;
    }
}
