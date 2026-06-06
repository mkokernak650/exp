<?php

use App\Models\Affiliate;
use App\Models\BroadcastGroupName;
use App\Models\MsoName;
use App\Models\NetworkName;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Backfill legacy ownership_type/_name on affiliates into affiliate_corporation pivot. Idempotent.
return new class extends Migration
{
    private const TYPE_MAP = [
        'Broadcast Group' => [BroadcastGroupName::class, 'broadcast_group_name'],
        'MSO'             => [MsoName::class, 'mso_name'],
        'Network'         => [NetworkName::class, 'network_name'],
    ];

    public function up(): void
    {
        $affiliates = Affiliate::query()
            ->whereNotNull('ownership_type')
            ->whereNotNull('ownership_name')
            ->where('ownership_type', '!=', '')
            ->where('ownership_name', '!=', '')
            ->get(['id', 'ownership_type', 'ownership_name']);

        $stats = ['matched' => 0, 'missing_corp' => 0, 'already_linked' => 0];

        foreach ($affiliates as $aff) {
            $type = $aff->ownership_type;
            $name = trim($aff->ownership_name);
            if (!isset(self::TYPE_MAP[$type]) || $name === '') {
                continue;
            }

            [$modelClass, $nameColumn] = self::TYPE_MAP[$type];
            $corp = $modelClass::where($nameColumn, $name)->first();

            if (!$corp) {
                $stats['missing_corp']++;
                continue;
            }

            $exists = DB::table('affiliate_corporation')
                ->where('affiliate_id', $aff->id)
                ->where('corporationable_type', $modelClass)
                ->where('corporationable_id', $corp->id)
                ->exists();

            if ($exists) {
                $stats['already_linked']++;
                continue;
            }

            DB::table('affiliate_corporation')->insert([
                'affiliate_id'         => $aff->id,
                'corporationable_type' => $modelClass,
                'corporationable_id'   => $corp->id,
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);
            $stats['matched']++;
        }

        // Log so this is visible in the migration output.
        fwrite(STDERR, sprintf(
            "[backfill_affiliate_corporation] matched=%d, already_linked=%d, missing_corp=%d\n",
            $stats['matched'],
            $stats['already_linked'],
            $stats['missing_corp']
        ));
    }

    public function down(): void
    {
        // No-op: cannot reliably distinguish backfilled rows from later manual links.
    }
};
