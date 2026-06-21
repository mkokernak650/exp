<?php

namespace App\Console\Commands;

use App\Models\InsertionOrder;
use Illuminate\Console\Command;

/**
 * Daily sweep that flips accepted IOs to `canceled` once their 30-day notice expires.
 * Cancellation flow stamps `canceled_at = cancellation_requested_at + 30 days` but leaves
 * status='accepted' so sales keep flowing until the effective date — this command closes
 * the loop when NOW() >= canceled_at.
 */
class ExpireCanceledIos extends Command
{
    protected $signature   = 'reports:expire-canceled-ios';
    protected $description = 'Flip IOs to canceled status when their canceled_at has elapsed.';

    public function handle(): int
    {
        $now = now();
        $rows = InsertionOrder::query()
            ->whereNotNull('canceled_at')
            ->where('canceled_at', '<=', $now)
            ->whereNotIn('status', [InsertionOrder::STATUS['canceled'], InsertionOrder::STATUS['void']])
            ->get();

        if ($rows->isEmpty()) {
            $this->info('No IOs to expire.');
            return self::SUCCESS;
        }

        $flipped = 0;
        foreach ($rows as $io) {
            $previousStatus = $io->status;
            $io->status = InsertionOrder::STATUS['canceled'];
            $io->save();
            $flipped++;

            activity('Insertion Order')
                ->performedOn($io)
                ->event('canceled')
                ->withProperties([
                    'previous_status' => $previousStatus,
                    'canceled_at'     => optional($io->canceled_at)->toDateTimeString(),
                    'source'          => 'scheduled:reports:expire-canceled-ios',
                ])
                ->log("IO {$io->io_no} flipped from {$previousStatus} to canceled (notice period elapsed)");
        }

        $this->info("Expired {$flipped} IO" . ($flipped === 1 ? '' : 's') . '.');
        return self::SUCCESS;
    }
}
