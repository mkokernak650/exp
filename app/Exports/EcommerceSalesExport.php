<?php

namespace App\Exports;

use App\Http\Controllers\Controller;
use App\Models\EcommerceSale;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EcommerceSalesExport extends Controller implements FromCollection, WithHeadings, WithMapping
{
    protected $filterByCampaigns;
    protected $filterByCustomers;
    protected $filterByAffiliates;
    protected $filterByDate;

    public function __construct($filterByCampaigns, $filterByCustomers, $filterByAffiliates, $filterByDate)
    {
        $this->filterByCampaigns  = $filterByCampaigns;
        $this->filterByCustomers  = $filterByCustomers;
        $this->filterByAffiliates = $filterByAffiliates;
        $this->filterByDate       = $filterByDate;
    }

    public function collection()
    {
        $salesDataQuery = EcommerceSale::query()->with('campaign:id,campaign_name')->with('customer:id,customer_name');

        if (!empty($this->filterByCampaigns)) {
            $filterByCampaigns = explode(',', $this->filterByCampaigns);
            $salesDataQuery->whereIn('campaign_id', $filterByCampaigns);
        }

        if (!empty($this->filterByCustomers)) {
            $filterByCustomers = explode(',', $this->filterByCustomers);
            $salesDataQuery->whereIn('customer_id', $filterByCustomers);
        }

        if (!empty($this->filterByAffiliates)) {
            $salesDataQuery->whereRaw("(SELECT id FROM affiliates WHERE affiliates.id =
                                (SELECT affiliate_id FROM ecommerce_affiliates WHERE ecommerce_affiliates.coupon_code =
                                ecommerce_sales.coupon_code OR ecommerce_affiliates.dialed = ecommerce_sales.dialed LIMIT 1))
                                IN (" . $this->filterByAffiliates . ")");
        }

        $filterByDate = json_decode($this->filterByDate);

        if (!empty($filterByDate->startDate) && !empty($filterByDate->endDate)) {
            $salesDataQuery->whereDate('order_at', '>=', $filterByDate->startDate)
                ->whereDate('order_at', '<=', $filterByDate->endDate);
        }

        return $salesDataQuery->get();
    }

    public function headings(): array
    {
        return [
            'Campaign',
            'Customer',
            'Order Type',
            'Order No',
            'Coupon Code',
            'User IP',
            'Dialed',
            'Inbound',
            'Shipping City',
            'Shipping State',
            'Shipping Zip Code',
            'Billing Zip Code',
            'Quantity',
            'Subtotal',
            'Shipping Cost',
            'Order At',
            'Created At'
        ];
    }

    public function map($sales): array
    {
        return [
            $sales->campaign->campaign_name,
            $sales->customer->customer_name,
            $sales->order_type === 1 ? 'E-Commerce' : 'Phone',
            $sales->order_no,
            $sales->coupon_code,
            $sales->user_ip,
            $sales->dialed,
            $sales->inbound,
            $sales->shipping_city,
            $sales->shipping_state,
            $sales->shipping_zip,
            $sales->billing_zip,
            $sales->quantity,
            $sales->subtotal,
            $sales->shipping_cost,
            $sales->total,
            $sales->order_at,
            $sales->created_at,
        ];
    }
}
