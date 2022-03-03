<?php

namespace App\Imports;

use App\Models\EcommerceSale;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EcommerceSaleImport implements ToModel, WithHeadingRow, WithChunkReading
{
    protected $fieldMap;

    public function __construct(array $fieldMap)
    {
        $this->fieldMap = $fieldMap;
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        if (empty($row[$this->fieldMap['coupon_code']])) return;

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
            'order_date' => $this->getValue($row, 'order_date'),
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
