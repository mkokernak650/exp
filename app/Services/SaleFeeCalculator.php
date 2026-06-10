<?php

namespace App\Services;

use App\Models\EcommerceAffiliate;

class SaleFeeCalculator
{
    /**
     * Resolve vendor_fee and consumerexp_fee for a single sales row.
     *
     * @param  float       $total              row total (already signed: negative for returns)
     * @param  float|null  $shippingCost       stripped from base before % calc
     * @param  EcommerceAffiliate|null $aff    matching affiliate config
     * @param  float|null  $importedVendorFee  per-row vendor_fee from the file (tiered mode)
     * @param  float|null  $importedCexpFee    per-row consumerexp_fee from the file (tiered mode)
     *
     * @return array{vendor_fee: float|null, consumerexp_fee: float|null}
     */
    public function compute(
        float $total,
        ?float $shippingCost,
        ?EcommerceAffiliate $aff,
        ?float $importedVendorFee = null,
        ?float $importedCexpFee = null
    ): array {
        if (!$aff) {
            return ['vendor_fee' => null, 'consumerexp_fee' => null];
        }

        $base = $total - (float) ($shippingCost ?? 0);
        $sign = $total < 0 ? -1 : 1;
        $absBase = abs($base);

        switch ((int) $aff->affiliate_fee_type) {
            case EcommerceAffiliate::FEE_MODE['tiered']:
                return [
                    'vendor_fee'      => $importedVendorFee,
                    'consumerexp_fee' => $importedCexpFee,
                ];

            case EcommerceAffiliate::FEE_MODE['fixed_pct']:
                // "Percentage of Sales": affiliate % stored in `affiliate_fee`,
                // ConsumerEXP % in `consumerEXP_cash_buy_fee`, total (sum) in `percentage`.
                $affiliatePct = (float) ($aff->affiliate_fee ?? 0);
                $cexpPct      = (float) ($aff->consumerEXP_cash_buy_fee ?? 0);
                return [
                    'vendor_fee'      => round($sign * $absBase * $affiliatePct / 100, 4),
                    'consumerexp_fee' => round($sign * $absBase * $cexpPct      / 100, 4),
                ];

            case EcommerceAffiliate::FEE_MODE['payout_per_order']:
                return [
                    'vendor_fee'      => $sign * (float) ($aff->affiliate_fee ?? 0),
                    'consumerexp_fee' => $sign * (float) ($aff->consumerEXP_cash_buy_fee ?? 0),
                ];

            case EcommerceAffiliate::FEE_MODE['cash_buy']:
                return [
                    'vendor_fee'      => $sign * (float) ($aff->cash_buy ?? 0),
                    'consumerexp_fee' => $sign * (float) ($aff->consumerEXP_cash_buy_fee ?? 0),
                ];
        }

        return ['vendor_fee' => null, 'consumerexp_fee' => null];
    }

    /**
     * Locate the EcommerceAffiliate row that owns a sales row, based on channel id.
     */
    public function resolveAffiliate(int $campaignId, ?string $dialed, ?string $couponCode, ?string $trackingUrl): ?EcommerceAffiliate
    {
        return EcommerceAffiliate::query()
            ->where('campaign_id', $campaignId)
            ->where(function ($q) use ($dialed, $couponCode, $trackingUrl) {
                if (!empty($dialed)) {
                    $q->orWhere('dialed', $dialed);
                }
                if (!empty($couponCode)) {
                    $q->orWhere('coupon_code', $couponCode);
                }
                if (!empty($trackingUrl)) {
                    $q->orWhere('tracking_url', $trackingUrl);
                }
            })
            ->first();
    }
}
