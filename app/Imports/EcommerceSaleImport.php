<?php

namespace App\Imports;

use Carbon\Carbon;
use App\Models\EcommerceSale;
use App\Services\SaleFeeCalculator;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class EcommerceSaleImport implements ToModel, SkipsOnError, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    use SkipsErrors;

    protected $fieldMap;
    protected $reqOrderType;
    protected $reqCampaignId;
    protected $reqCustomerId;
    protected $dialed;
    protected $totals;
    protected $orderNos;
    protected $inbounds;
    protected $couponCodes;
    protected $shippingZips;
    protected $campaignIds;
    protected $customerIds;
    protected $orderTypes;
    protected $alreadyExist;
    protected $rejectedReturns;
    protected $salesCount;
    protected $order_at;
    protected $importHashes;
    protected $feeCalc;
    protected $affiliateCache;

    public function __construct(array $fieldMap, $salesData, $reqCampaignId, $reqCustomerId, $reqOrderType)
    {
        $this->salesCount      = 0;
        $this->alreadyExist    = [];
        $this->rejectedReturns = [];
        $this->fieldMap        = $fieldMap;
        $this->reqOrderType    = $reqOrderType;
        $this->reqCampaignId   = $reqCampaignId;
        $this->reqCustomerId   = $reqCustomerId;
        $this->dialed          = $salesData->pluck('dialed', 'id')->toArray();
        $this->totals          = $salesData->pluck('total', 'id')->toArray();
        $this->orderNos        = $salesData->pluck('order_no', 'id')->toArray();
        $this->inbounds        = $salesData->pluck('inbound', 'id')->toArray();
        $this->orderTypes      = $salesData->pluck('order_type', 'id')->toArray();
        $this->couponCodes     = $salesData->pluck('coupon_code', 'id')->toArray();
        $this->shippingZips    = $salesData->pluck('shipping_zip', 'id')->toArray();
        $this->campaignIds     = $salesData->pluck('campaign_id', 'id')->toArray();
        $this->customerIds     = $salesData->pluck('customer_id', 'id')->toArray();
        $this->order_at        = $salesData->pluck('formatted_order_at', 'id')->toArray();
        $this->importHashes    = array_filter($salesData->pluck('import_hash')->toArray());
        $this->importHashes    = array_flip($this->importHashes);
        $this->feeCalc         = app(SaleFeeCalculator::class);
        $this->affiliateCache  = [];
    }

    public function getAlreadyExist()
    {
        return $this->alreadyExist;
    }

    public function getRejectedReturns()
    {
        return $this->rejectedReturns;
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
        if (
            empty($this->getValue($row, 'coupon_code'))
            && empty($this->getValue($row, 'dialed'))
            && empty($this->getValue($row, 'tracking_url'))
        ) {
            return;
        }

        $this->salesCount += 1;
        $orderDate         = $this->getDateTime($row);

        if (!is_null($orderDate)) {
            if (gettype($orderDate) !== 'string') {
                $orderDate = Date::excelToTimestamp($orderDate, config('app.timezone'));
            }
            $orderDate = Carbon::parse($orderDate)->format('Y-m-d H:i:s');
        }

        $totalRaw = $this->getValue($row, 'total');
        $total    = is_numeric($totalRaw) ? (float) $totalRaw : 0.0;
        $recordKind = $total < 0 ? EcommerceSale::RECORD_KIND['RETURN'] : EcommerceSale::RECORD_KIND['SALE'];

        $dialed      = trim((string) $this->getValue($row, 'dialed'));
        $couponCode  = trim((string) $this->getValue($row, 'coupon_code'));
        $trackingUrl = trim((string) $this->getValue($row, 'tracking_url'));
        $ani         = trim((string) $this->getValue($row, 'ani'));
        $shipZip     = substr((string) $this->getValue($row, 'shipping_zip'), 0, 5);
        $shipCity    = trim((string) $this->getValue($row, 'shipping_city'));
        $shipState   = trim((string) $this->getValue($row, 'shipping_state'));

        if ($recordKind === EcommerceSale::RECORD_KIND['RETURN']) {
            $hasChannel = !empty($dialed) || !empty($couponCode) || !empty($trackingUrl);
            $hasHousehold = !empty($ani) && !empty($shipZip) && !empty($shipCity) && !empty($shipState);
            if (!$hasChannel || !$hasHousehold) {
                $this->rejectedReturns[] = $row + ['reject_reason' => 'Missing required match-key fields for return'];
                return;
            }
        }

        $fingerprint = implode('|', [
            $this->reqCustomerId,
            $this->reqCampaignId,
            $this->reqOrderType,
            $recordKind,
            $dialed,
            $couponCode,
            $trackingUrl,
            $ani,
            $shipZip,
            $shipCity,
            $shipState,
            (string) $orderDate,
            (string) $total,
        ]);
        $importHash = sha1($fingerprint);

        if (isset($this->importHashes[$importHash])) {
            $this->alreadyExist[] = $row;
            return;
        }
        $this->importHashes[$importHash] = true;

        $keys = array_keys($this->order_at, $orderDate);

        if (!empty($keys)) {
            foreach ($keys as $key) {
                if (
                    $this->getValue($row, 'total') == $this->totals[$key] &&
                    $this->reqCampaignId == $this->campaignIds[$key] &&
                    $this->reqCustomerId == $this->customerIds[$key] &&
                    $this->reqOrderType == $this->orderTypes[$key] &&
                    (
                        ($this->reqOrderType == EcommerceSale::ORDER_TYPE['phone'] &&
                            $dialed == $this->dialed[$key] &&
                            $this->getValue($row, 'inbound') == $this->inbounds[$key]
                        ) || ($this->reqOrderType == EcommerceSale::ORDER_TYPE['e-commerce'] &&
                            $couponCode == $this->couponCodes[$key] &&
                            $shipZip == $this->shippingZips[$key]
                        ) || ($this->reqOrderType == EcommerceSale::ORDER_TYPE['phone_ecommerce'] &&
                            (!empty(trim((string) $this->getValue($row, 'order_no'))) &&
                                trim((string) $this->getValue($row, 'order_no')) == trim((string) $this->orderNos[$key])) &&
                            trim($this->getValue($row, 'total')) == $this->totals[$key]
                        )
                    )
                ) {
                    array_push($this->alreadyExist, $row);
                    return;
                }
            }
        }

        $affiliate = $this->getAffiliate($dialed, $couponCode, $trackingUrl);

        $importedVendorFee = $this->numericOrNull($this->getValue($row, 'vendor_fee'));
        $importedCexpFee   = $this->numericOrNull($this->getValue($row, 'consumerexp_fee'));
        $shippingCost      = $this->numericOrNull($this->getValue($row, 'shipping_cost'));

        $fees = $this->feeCalc->compute(
            $total,
            $shippingCost,
            $affiliate,
            $importedVendorFee,
            $importedCexpFee
        );

        return new EcommerceSale([
            'campaign_id'       => $this->reqCampaignId,
            'customer_id'       => $this->reqCustomerId,
            'order_type'        => $this->reqOrderType,
            'record_kind'       => $recordKind,
            'order_no'          => $this->getValue($row, 'order_no'),
            'coupon_code'       => $couponCode,
            'tracking_url'      => $trackingUrl,
            'user_ip'           => $this->getValue($row, 'user_ip'),
            'dialed'            => $dialed,
            'inbound'           => $this->getValue($row, 'inbound'),
            'shipping_city'     => $shipCity,
            'shipping_state'    => $shipState,
            'ship_country'      => $this->getValue($row, 'ship_country'),
            'shipping_zip'      => $shipZip,
            'billing_zip'       => substr((string) $this->getValue($row, 'billing_zip'), 0, 5),
            'quantity'          => $this->getValue($row, 'quantity'),
            'subtotal'          => $this->getValue($row, 'subtotal'),
            'shipping_cost'     => $shippingCost,
            'total'             => $total,
            'vendor_fee'        => $fees['vendor_fee'],
            'consumerexp_fee'   => $fees['consumerexp_fee'],
            'import_hash'       => $importHash,
            'order_at'          => $orderDate,
            'vendor_code'       => $this->getValue($row, 'vendor_code'),
            'telemarketing_co'  => $this->getValue($row, 'telemarketing_co'),
            'product_code'      => $this->getValue($row, 'product_code'),
            'isci'              => $this->getValue($row, 'isci'),
            'order_description' => $this->getValue($row, 'order_description'),
            'ani'               => $ani,
            'call_length'       => $this->getValue($row, 'call_length'),
            'payment_type'      => $this->getValue($row, 'payment_type'),
            'r1'                => $this->getValue($row, 'r1'),
            'station'           => $this->getValue($row, 'station'),
        ]);
    }

    protected function getAffiliate(?string $dialed, ?string $couponCode, ?string $trackingUrl)
    {
        $key = ($dialed ?? '') . '|' . ($couponCode ?? '') . '|' . ($trackingUrl ?? '');
        if (array_key_exists($key, $this->affiliateCache)) {
            return $this->affiliateCache[$key];
        }
        return $this->affiliateCache[$key] = $this->feeCalc->resolveAffiliate(
            (int) $this->reqCampaignId,
            $dialed ?: null,
            $couponCode ?: null,
            $trackingUrl ?: null
        );
    }

    protected function numericOrNull($value): ?float
    {
        if ($value === null || $value === '' || !is_numeric($value)) {
            return null;
        }
        return (float) $value;
    }

    protected function getValue($row, $key)
    {
        if (isset($this->fieldMap[$key])) {
            return $row[$this->fieldMap[$key]];
        }
        return null;
    }

    protected function getDateTime($row)
    {
        if (array_key_exists('order_date_time', $this->fieldMap)) {
            return $this->getValue($row, 'order_date_time');
        } elseif (array_key_exists('order_date', $this->fieldMap) && !array_key_exists('order_time', $this->fieldMap)) {
            return $this->getValue($row, 'order_date');
        } elseif (array_key_exists('order_date', $this->fieldMap) && array_key_exists('order_time', $this->fieldMap)) {
            return $this->mergeDateTime($row, ['order_date', 'order_time']);
        }
        return null;
    }

    protected function mergeDateTime($row, $dateTime)
    {
        $date = $this->getValue($row, $dateTime[0]);
        $time = $this->getValue($row, $dateTime[1]);

        if (!empty($date)) {
            if (gettype($date) !== 'string') {
                $date = Date::excelToTimestamp($date, config('app.timezone'));
                $time = Date::excelToTimestamp($time, config('app.timezone'));
            }

            if (gettype($date) === 'string') {
                $formattedTime = Carbon::parse($time)->toTimeString();
                $formattedDate = $this->parseDate($date);
            } else {
                $formattedTime = Carbon::parse(date('H:i:s', $time))->toTimeString();
                $formattedDate = Carbon::parse(date('d-m-Y', $date))->toDateString();
            }

            $order_at = !empty($time) ? $formattedDate . ' ' . $formattedTime : $formattedDate;

            return $order_at;
        }

        return null;
    }

    protected function parseDate($date)
    {
        $formats = [
            'y/m/d',
            'y-m-d',
        ];

        foreach ($formats as $format) {
            try {
                $formattedDate = Carbon::createFromFormat($format, $date);

                if ($formattedDate != false) {
                    return $formattedDate->format('d-m-Y');
                }
            } catch (\Throwable $th) {
                //throw $th;
            }
        }

        return null;
    }

    public function batchSize(): int
    {
        return 1000;
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
