<?php

namespace App\Exports;

use App\Http\Controllers\Controller;
use App\Models\EcommerceSale;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EcommerceSalesExport extends Controller implements FromCollection, WithHeadings, WithMapping
{
    protected $filterValue;

    public function __construct($filterValue)
    {
        $this->filterValue = $filterValue;
    }

    public function collection()
    {
        $zipDataQuery = EcommerceSale::query()->with('campaign:id,campaign_name')->with('customer:id,customer_name');
        $conditions = json_decode($this->filterValue);
        $firstCond = $conditions->items[0];
        $this->makeConditionQuery($zipDataQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);
        for ($i = 1; $i < count($conditions->items); $i++) {
            $cond = $conditions->items[$i];
            $this->makeConditionQuery($zipDataQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
        }

        return $zipDataQuery->get();
    }

    public function headings() : array
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

    public function map($sales) : array
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
