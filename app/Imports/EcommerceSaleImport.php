<?php
namespace App\Imports;

use App\Models\EcommerceSale;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

// use Maatwebsite\Excel\Concerns\WithChunkReading;

class EcommerceSaleImport implements ToModel, SkipsOnError, WithHeadingRow
{
    use SkipsErrors;

    protected $fieldMap;
    protected $reqOrderType;
    protected $reqCampaignId;
    protected $reqCustomerId;
    protected $dialed;
    protected $orderNo;
    protected $couponCodes;
    protected $shippingZip;
    protected $campaignIds;
    protected $customerIds;
    protected $orderTypes;

    public function __construct(array $fieldMap, $salesData, $reqCampaignId, $reqCustomerId, $reqOrderType)
    {
        $this->fieldMap = $fieldMap;
        $this->reqOrderType = $reqOrderType;
        $this->reqCampaignId = $reqCampaignId;
        $this->reqCustomerId = $reqCustomerId;
        $this->dialed = $salesData->pluck('dialed', 'id')->toArray();
        $this->orderNo = $salesData->pluck('order_no', 'id')->toArray();
        $this->orderTypes = $salesData->pluck('order_type', 'id')->toArray();
        $this->couponCodes = $salesData->pluck('coupon_code', 'id')->toArray();
        $this->shippingZip = $salesData->pluck('shipping_zip', 'id')->toArray();
        $this->campaignIds = $salesData->pluck('campaign_id', 'id')->toArray();
        $this->customerIds = $salesData->pluck('customer_id', 'id')->toArray();
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        if (empty($this->getValue($row, 'coupon_code')) && empty($this->getValue($row, 'dialed'))) {
            return;
        }

        $keys = array_keys($this->orderNo, $this->getValue($row, 'order_no'));
        if (!empty($keys)) {
            foreach ($keys as $key) {
                if (
                    $this->reqOrderType == $this->orderTypes[$key] &&
                    $this->reqCampaignId == $this->campaignIds[$key] &&
                    $this->reqCustomerId == $this->customerIds[$key] &&
                    $this->getValue($row, 'shipping_zip') == $this->shippingZip[$key] &&
                    (
                        (
                            $this->reqOrderType == EcommerceSale::ORDER_TYPE['phone'] &&
                            $this->getValue($row, 'dialed') == $this->dialed[$key]
                        ) || (
                            $this->reqOrderType == EcommerceSale::ORDER_TYPE['e-commerce'] &&
                            $this->getValue($row, 'coupon_code') == $this->couponCodes[$key]
                        )
                    )
                ) {
                    return;
                }
            }
        }

        return new EcommerceSale([
            'campaign_id'    => $this->reqCampaignId,
            'customer_id'    => $this->reqCustomerId,
            'order_type'     => $this->reqOrderType,
            'order_no'       => $this->getValue($row, 'order_no'),
            'coupon_code'    => $this->getValue($row, 'coupon_code'),
            'user_ip'        => $this->getValue($row, 'user_ip'),
            'dialed'         => $this->getValue($row, 'dialed'),
            'inbound'        => $this->getValue($row, 'inbound'),
            'shipping_city'  => $this->getValue($row, 'shipping_city'),
            'shipping_state' => $this->getValue($row, 'shipping_state'),
            'shipping_zip'   => $this->getValue($row, 'shipping_zip'),
            'billing_zip'    => $this->getValue($row, 'billing_zip'),
            'quantity'       => $this->getValue($row, 'quantity'),
            'subtotal'       => $this->getValue($row, 'subtotal'),
            'shipping_cost'  => $this->getValue($row, 'shipping_cost'),
            'total'          => $this->getValue($row, 'total'),
            'order_at'       => $this->getValue($row, 'order_at'),
        ]);
    }

    protected function getValue($row, $key)
    {
        if (isset($this->fieldMap[$key])) {
            return $row[$this->fieldMap[$key]];
        }
        return null;
    }

    // TODO problem with chunking
    // public function chunkSize(): int
    // {
    //     return 1000;
    // }
}
