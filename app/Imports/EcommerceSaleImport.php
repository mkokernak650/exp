<?php

namespace App\Imports;

use Carbon\Carbon;
use App\Models\EcommerceSale;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

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
    protected $alreadyExist;
    protected $salesCount;

    public function __construct(array $fieldMap, $salesData, $reqCampaignId, $reqCustomerId, $reqOrderType)
    {
        $this->salesCount = 0;
        $this->alreadyExist = [];
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

    public function getAlreadyExist()
    {
        return $this->alreadyExist;
    }

    public function getTotalSales()
    {
        return $this->salesCount;
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
        $this->salesCount += 1;

        $keys = array_keys($this->orderNo, $this->getValue($row, 'order_no'));
        if (!empty($keys)) {
            foreach ($keys as $key) {
                if (
                    $this->reqOrderType == $this->orderTypes[$key] &&
                    $this->reqCampaignId == $this->campaignIds[$key] &&
                    $this->reqCustomerId == $this->customerIds[$key] &&
                    substr($this->getValue($row, 'shipping_zip'), 0, 5) == $this->shippingZip[$key] &&
                    (
                        (
                            $this->reqOrderType == EcommerceSale::ORDER_TYPE['phone'] &&
                            trim($this->getValue($row, 'dialed')) == $this->dialed[$key]
                        ) || (
                            $this->reqOrderType == EcommerceSale::ORDER_TYPE['e-commerce'] &&
                            trim($this->getValue($row, 'coupon_code')) == $this->couponCodes[$key]
                        )
                    )
                ) {
                    array_push($this->alreadyExist, $row);
                    return;
                }
            }
        }

        return new EcommerceSale([
            'campaign_id'    => $this->reqCampaignId,
            'customer_id'    => $this->reqCustomerId,
            'order_type'     => $this->reqOrderType,
            'order_no'       => $this->getValue($row, 'order_no'),
            'coupon_code'    => trim($this->getValue($row, 'coupon_code')),
            'user_ip'        => $this->getValue($row, 'user_ip'),
            'dialed'         => trim($this->getValue($row, 'dialed')),
            'inbound'        => $this->getValue($row, 'inbound'),
            'shipping_city'  => $this->getValue($row, 'shipping_city'),
            'shipping_state' => $this->getValue($row, 'shipping_state'),
            'shipping_zip'   => substr($this->getValue($row, 'shipping_zip'), 0, 5),
            'billing_zip'    => $this->getValue($row, 'billing_zip'),
            'quantity'       => $this->getValue($row, 'quantity'),
            'subtotal'       => $this->getValue($row, 'subtotal'),
            'shipping_cost'  => $this->getValue($row, 'shipping_cost'),
            'total'          => $this->getValue($row, 'total'),
            'order_at'       => array_key_exists('order_date', $this->fieldMap) && array_key_exists('order_time', $this->fieldMap) ? $this->mergeDateTime($row, ['order_date', 'order_time']) : $this->getValue($row, 'order_date'),
        ]);
    }

    protected function getValue($row, $key)
    {
        if (isset($this->fieldMap[$key])) {
            return $row[$this->fieldMap[$key]];
        }
        return null;
    }

    protected function mergeDateTime($row, $dateTime)
    {
        $date = $this->getValue($row, $dateTime[0]);
        $time = $this->getValue($row, $dateTime[1]);
        if (!empty($date)) {
            $newDate = Date::excelToTimestamp($date, env('Time_Zone'));
            $newTime = Date::excelToTimestamp($time, env('Time_Zone'));
            $order_at = !empty($time) ? Carbon::parse(date('d-m-Y', $newDate))->toDateString() . ' ' . Carbon::parse(date('H:i:s', $newTime))->toTimeString() : Carbon::parse(date('d-m-Y', $newDate))->toDateString();
            return $order_at;
        }
        return null;
    }

    // TODO problem with chunking
    // public function chunkSize(): int
    // {
    //     return 1000;
    // }
}
