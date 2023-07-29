<?php

namespace App\Exports;

use App\Models\EcommerceAffiliate;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EcommerceAffiliateExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filterByCampaigns;
    protected $filterByCustomers;
    protected $filterByAffiliates;

    public function __construct($filterByCampaigns, $filterByCustomers, $filterByAffiliates)
    {
        $this->filterByCampaigns  = $filterByCampaigns;
        $this->filterByCustomers  = $filterByCustomers;
        $this->filterByAffiliates = $filterByAffiliates;
    }

    public function collection()
    {
        $ecommerceAffiliateQuery = EcommerceAffiliate::with('campaign:id,campaign_name')->with('customer:id,customer_name')->with('affiliate:id,affiliate_name');

        if (!empty($this->filterByCampaigns)) {
            $filterByCampaigns = explode(',', $this->filterByCampaigns);
            $ecommerceAffiliateQuery->whereIn('campaign_id', $filterByCampaigns);
        }

        if (!empty($this->filterByCustomers)) {
            $filterByCustomers = explode(',', $this->filterByCustomers);
            $ecommerceAffiliateQuery->whereIn('customer_id', $filterByCustomers);
        }

        if (!empty($this->filterByAffiliates)) {
            $filterByAffiliates = explode(',', $this->filterByAffiliates);
            $ecommerceAffiliateQuery->whereIn('affiliate_id', $filterByAffiliates);
        }

        return $ecommerceAffiliateQuery->get();
    }

    public function headings(): array
    {
        return [
            'Campaign',
            'Customer',
            'Affiliate',
            'Order Type',
            'Affiliate Fee Type',
            'ISCI Code',
            'Coupon Code',
            'Dialed',
            'Pay on multiple orders',
            'Lengths',
            'Payout',
            'Affiliate Fee',
            'Commission',
            'Cash Buy',
            'Description',
            'Created At',
            'Updated At'
        ];
    }

    public function map($row): array
    {
        return [
            $row->campaign ? $row->campaign->campaign_name : '',
            $row->customer->customer_name,
            $row->affiliate->affiliate_name,
            $row->order_type == 1 ? 'E-commerce' : 'Phone',
            $row->affiliate_fee_type == 1 ? 'Payout Per Order' : 'Cash Buy',
            $row->product_code,
            $row->coupon_code,
            $row->dialed,
            $row->pay_on_multiple_orders == 0 ? 'No' : 'Yes',
            $row->lengths,
            $row->revenue,
            $row->affiliate_fee,
            $row->percentage,
            $row->cash_buy,
            $row->description,
            $row->created_at,
            $row->updated_at
        ];
    }
}
