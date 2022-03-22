<?php

namespace App\Imports;

use App\Models\Affiliate;
use App\Models\EcommerceAffiliate;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EcommerceAffiliatesImport implements ToModel, WithHeadingRow, SkipsOnError
{
    use SkipsErrors;

    protected $affiliates;

    public function __construct($affiliates)
    {
        $this->affiliates = $affiliates;
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        if (!isset($row['affiliate_name']) && !isset($row['coupon_code'])) {
            return;
        }

        $affiliateId = array_search($row['affiliate_name'], $this->affiliates);
        if (!$affiliateId) {
            $affiliate = Affiliate::create([
                'affiliate_name' => $row['affiliate_name'],
            ]);
            $affiliateId = $affiliate->id;
        }

        return new EcommerceAffiliate([
            'affiliate_id' => $affiliateId,
            'coupon_code' => $row['coupon_code'],
            'revenue' => $row['revenue'] ?? null,
            'affiliate_fee' => $row['affiliate_fee'] ?? null,
        ]);
    }
}
