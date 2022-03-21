<?php

namespace App\Imports;

use App\Models\EcommerceSale;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class EcommerceSaleImport implements ToModel, SkipsOnError, WithHeadingRow, WithChunkReading
{
    use SkipsErrors;

    protected $fieldMap;
    protected $orderNo;
    protected $couponCodes;
    protected $shippingZip;
    protected $total;

    public function __construct(array $fieldMap, $data)
    {
        $this->fieldMap = $fieldMap;
        $this->orderNo = $data->pluck('order_no')->toArray();
        $this->couponCodes = $data->pluck('coupon_code')->toArray();
        $this->shippingZip = $data->pluck('shipping_zip')->toArray();
        $this->total = $data->pluck('total')->toArray();
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        if (empty($this->getValue($row, 'coupon_code'))) return;

        $key = array_search($this->getValue($row, 'order_no'), $this->orderNo);
        if ($key !== false) {
            if (
                $this->getValue($row, 'coupon_code') == $this->couponCodes[$key]
                && $this->getValue($row, 'shipping_zip') == $this->shippingZip[$key]
                && $this->getValue($row, 'total') == $this->total[$key]
            ) {
                return;
            }
        }

        return new EcommerceSale([
            'order_no' => $this->getValue($row, 'order_no'),
            'coupon_code' => $this->getValue($row, 'coupon_code'),
            'user_ip' => $this->getValue($row, 'user_ip'),
            'shipping_city' => $this->getValue($row, 'shipping_city'),
            'shipping_state' => $this->getValue($row, 'shipping_state'),
            'shipping_zip' => $this->getValue($row, 'shipping_zip'),
            'billing_zip' => $this->getValue($row, 'billing_zip'),
            'quantity' => $this->getValue($row, 'quantity'),
            'subtotal' => $this->getValue($row, 'subtotal'),
            'shipping_cost' => $this->getValue($row, 'shipping_cost'),
            'total' => $this->getValue($row, 'total'),
            'order_at' => $this->getValue($row, 'order_at'),
        ]);
    }

    protected function getValue($row, $key)
    {
        if (isset($this->fieldMap[$key])) {
            return $row[$this->fieldMap[$key]];
        }
        return null;
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
