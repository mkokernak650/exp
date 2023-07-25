<?php

namespace App\Exports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EcommerceCampaignAffiliateListExport implements FromCollection, WithHeadings, WithMapping
{
    protected $campaignId;

    public function __construct($campaignId)
    {
        $this->campaignId = $campaignId;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $ecommerceCampaignAffiliateList = DB::table('ecommerce_affiliates')
            ->join('affiliates', 'ecommerce_affiliates.affiliate_id', '=', 'affiliates.id')
            ->where('campaign_id', $this->campaignId)
            ->select(['affiliates.affiliate_name', 'ecommerce_affiliates.affiliate_fee_type', 'affiliates.market', 'affiliates.created_at'])
            ->groupBy('ecommerce_affiliates.affiliate_id')
            ->orderBy('affiliates.affiliate_name')
            ->get();

        return $ecommerceCampaignAffiliateList;
    }

    public function headings(): array
    {
        return [
            'Affiliate Name',
            'Affiliate Fee Type',
            'Market',
            'Created At'
        ];
    }

    public function map($row): array
    {
        return [
            $row->affiliate_name,
            $row->affiliate_fee_type == 1 ? 'Payout Per Order' : 'Cash Buy',
            $row->market,
            $row->created_at
        ];
    }
}
