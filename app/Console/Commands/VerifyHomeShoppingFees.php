<?php

namespace App\Console\Commands;

use App\Models\EcommerceAffiliate;
use App\Services\SaleFeeCalculator;
use Illuminate\Console\Command;

/**
 * Verifies the home-shopping ("Percentage of Sales") fee math against the
 * client's written example, with zero database writes. Drives the REAL
 * App\Services\SaleFeeCalculator so this proves the production fee code.
 *
 * Run: php artisan hs:verify-fees
 */
class VerifyHomeShoppingFees extends Command
{
    protected $signature = 'hs:verify-fees';

    protected $description = 'Verify home-shopping Percentage-of-Sales fee calculations (no DB writes)';

    public function handle(SaleFeeCalculator $calc): int
    {
        $pass = true;

        // ---- Affiliate config: "Percentage of Sales" (FEE_MODE['fixed_pct'] = 3).
        // Matches the client's related-task-2 example: affiliate 10% of net, ConsumerEXP 3% of net.
        $aff = new EcommerceAffiliate([
            'affiliate_fee_type'       => EcommerceAffiliate::FEE_MODE['fixed_pct'], // 3
            'affiliate_fee'            => 10,  // affiliate % of sales
            'consumerEXP_cash_buy_fee' => 3,   // ConsumerEXP % of sales
            'percentage'               => 13,  // total (display only)
        ]);

        $this->line('');
        $this->info('Affiliate: Percentage of Sales — affiliate 10%, ConsumerEXP 3% (no S&H).');
        $this->line('');

        // ---- Per-row checks (the real calculator) -------------------------------
        // Client example: Gross $100,000, Returns -$10,000, Net $90,000.
        $rows = [
            // [label, total, shipping, expected vendor_fee, expected consumerexp_fee]
            ['SALE   $100,000', 100000.0, 0.0,  10000.0, 3000.0],
            ['RETURN -$10,000', -10000.0, 0.0,  -1000.0, -300.0],
            // S&H strip: $1,000 sale with $100 shipping -> base $900 -> 90 / 27
            ['SALE   $1,000 (+$100 S&H)', 1000.0, 100.0, 90.0, 27.0],
        ];

        $this->line(str_pad('Row', 28) . str_pad('vendor_fee', 16) . str_pad('consumerexp_fee', 18) . 'result');
        $this->line(str_repeat('-', 74));

        $sumTotal = $sumVendor = $sumCexp = 0.0;
        foreach (array_slice($rows, 0, 2) as $r) {
            [$label, $total, $ship, $expV, $expC] = $r;
            $out = $calc->compute($total, $ship, $aff);
            $okV = $this->almost($out['vendor_fee'], $expV);
            $okC = $this->almost($out['consumerexp_fee'], $expC);
            $pass = $pass && $okV && $okC;
            $sumTotal += $total;
            $sumVendor += (float) $out['vendor_fee'];
            $sumCexp += (float) $out['consumerexp_fee'];
            $this->row($label, $out['vendor_fee'], $expV, $out['consumerexp_fee'], $expC);
        }
        // S&H row (not part of the 100k aggregate)
        $r = $rows[2];
        $out = $calc->compute($r[1], $r[2], $aff);
        $pass = $pass && $this->almost($out['vendor_fee'], $r[3]) && $this->almost($out['consumerexp_fee'], $r[4]);
        $this->row($r[0], $out['vendor_fee'], $r[3], $out['consumerexp_fee'], $r[4]);

        // ---- Aggregate check: mirrors the household/vendor report SUM() columns ---
        // net_sales = SUM(total); net_vendor_fee = SUM(vendor_fee); etc.
        $this->line('');
        $this->info('Aggregate (Gross $100,000 + Return -$10,000), mirrors report SUM() columns:');
        $netSales   = $sumTotal;        // expect 90,000
        $affiliate  = $sumVendor;       // expect  9,000
        $cexp       = $sumCexp;         // expect  2,700
        $totalFees  = $affiliate + $cexp; // expect 11,700

        $checks = [
            ['Net Sales (SUM total)',        $netSales,  90000.0],
            ['Affiliate Fee (SUM vendor_fee)', $affiliate, 9000.0],
            ['ConsumerEXP Fee (SUM cexp)',   $cexp,      2700.0],
            ['Total Fees',                   $totalFees, 11700.0],
        ];
        foreach ($checks as [$label, $got, $exp]) {
            $ok = $this->almost($got, $exp);
            $pass = $pass && $ok;
            $this->line(sprintf('  %-32s got %-12s expected %-12s %s',
                $label, number_format($got, 2), number_format($exp, 2), $ok ? 'PASS' : 'FAIL'));
        }

        $this->line('');
        if ($pass) {
            $this->info('ALL CHECKS PASSED — matches client example ($9,000 + $2,700 = $11,700).');
            return self::SUCCESS;
        }
        $this->error('SOME CHECKS FAILED — see rows above.');
        return self::FAILURE;
    }

    private function row(string $label, $gotV, $expV, $gotC, $expC): void
    {
        $ok = $this->almost($gotV, $expV) && $this->almost($gotC, $expC);
        $this->line(
            str_pad($label, 28)
            . str_pad(number_format((float) $gotV, 2) . ' /' . number_format($expV, 2), 16)
            . str_pad(number_format((float) $gotC, 2) . ' /' . number_format($expC, 2), 18)
            . ($ok ? 'PASS' : 'FAIL')
        );
    }

    private function almost($a, $b, float $eps = 0.001): bool
    {
        return abs((float) $a - (float) $b) < $eps;
    }
}
