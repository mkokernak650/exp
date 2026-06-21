<?php

namespace App\Imports;

use Carbon\Carbon;
use App\Models\EcommerceSale;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\InsertionOrder;
use App\Services\SaleFeeCalculator;
use App\Services\CorporationService;
use Illuminate\Support\Facades\DB;
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
    protected $outOfWindow;
    protected $rejectedZeroCalls;
    protected $salesCount;
    protected $order_at;
    protected $importHashes;
    protected $feeCalc;
    protected $affiliateCache;

    protected $enforceIoGate;
    protected $ioWindowsByAffiliate = [];
    protected $zeroCallSeen         = [];
    protected $sameDaySaleSeen      = [];
    protected $campaignByDialed     = [];
    protected $campaignByPromo      = [];
    protected $campaignByName       = [];

    public function __construct(
        array $fieldMap,
        $salesData,
        $reqCampaignId,
        $reqCustomerId,
        $reqOrderType,
        bool $enforceIoGate = true
    ) {
        $this->salesCount        = 0;
        $this->alreadyExist      = [];
        $this->rejectedReturns   = [];
        $this->outOfWindow       = [];
        $this->rejectedZeroCalls = [];
        $this->fieldMap          = $fieldMap;
        $this->reqOrderType      = $reqOrderType;
        $this->reqCampaignId     = $reqCampaignId;
        $this->reqCustomerId     = $reqCustomerId;
        $this->dialed            = $salesData->pluck('dialed', 'id')->toArray();
        $this->totals            = $salesData->pluck('total', 'id')->toArray();
        $this->orderNos          = $salesData->pluck('order_no', 'id')->toArray();
        $this->inbounds          = $salesData->pluck('inbound', 'id')->toArray();
        $this->orderTypes        = $salesData->pluck('order_type', 'id')->toArray();
        $this->couponCodes       = $salesData->pluck('coupon_code', 'id')->toArray();
        $this->shippingZips      = $salesData->pluck('shipping_zip', 'id')->toArray();
        $this->campaignIds       = $salesData->pluck('campaign_id', 'id')->toArray();
        $this->customerIds       = $salesData->pluck('customer_id', 'id')->toArray();
        $this->order_at          = $salesData->pluck('formatted_order_at', 'id')->toArray();
        $this->importHashes      = array_filter($salesData->pluck('import_hash')->toArray());
        $this->importHashes      = array_flip($this->importHashes);
        $this->feeCalc           = app(SaleFeeCalculator::class);
        $this->affiliateCache    = [];
        $this->enforceIoGate     = $enforceIoGate;

        $this->preloadIoWindows();
        $this->preloadCampaignLookups();
        $this->preloadSameDaySales();
    }

    public function getAlreadyExist()
    {
        return $this->alreadyExist;
    }

    public function getRejectedReturns()
    {
        return $this->rejectedReturns;
    }

    public function getOutOfWindow()
    {
        return $this->outOfWindow;
    }

    public function getRejectedZeroCalls()
    {
        return $this->rejectedZeroCalls;
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

        $totalRaw   = $this->getValue($row, 'total');
        $total      = is_numeric($totalRaw) ? (float) $totalRaw : 0.0;
        $recordKind = $this->resolveRecordKind($row, $total);

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

        $campaignId = $this->resolveCampaignId($row, $dialed, $couponCode, $trackingUrl);

        // ZERO_CALL handling — requires ANI + date, deduped per (customer, ANI, date),
        // suppressed when a same-day SALE exists in DB or this batch.
        $zeroCallDate = null;
        if ($recordKind === EcommerceSale::RECORD_KIND['ZERO_CALL']) {
            $total = 0.0;
            if (empty($ani) || empty($orderDate)) {
                $this->rejectedZeroCalls[] = $row + ['reject_reason' => 'ZERO_CALL row missing ANI or date'];
                return;
            }
            $zeroCallDate = Carbon::parse($orderDate)->format('Y-m-d');
            $dedupKey = $this->reqCustomerId . '|' . $ani . '|' . $zeroCallDate;

            if (isset($this->zeroCallSeen[$dedupKey])) {
                $this->rejectedZeroCalls[] = $row + ['reject_reason' => 'Duplicate ZERO_CALL for ANI/date'];
                return;
            }
            if (isset($this->sameDaySaleSeen[$dedupKey])) {
                $this->rejectedZeroCalls[] = $row + ['reject_reason' => 'Same-day SALE present — $0 call suppressed'];
                return;
            }
            $exists = EcommerceSale::where('customer_id', $this->reqCustomerId)
                ->where('ani', $ani)
                ->where('zero_call_date', $zeroCallDate)
                ->where('record_kind', EcommerceSale::RECORD_KIND['ZERO_CALL'])
                ->exists();
            if ($exists) {
                $this->rejectedZeroCalls[] = $row + ['reject_reason' => 'ZERO_CALL already exists for ANI/date'];
                return;
            }
            $this->zeroCallSeen[$dedupKey] = true;
        }

        $fingerprint = implode('|', [
            $this->reqCustomerId,
            $campaignId,
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
                    $campaignId == $this->campaignIds[$key] &&
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

        $affiliate = $this->getAffiliate($campaignId, $dialed, $couponCode, $trackingUrl);

        $insertionOrderId = null;
        if ($this->enforceIoGate) {
            $affiliateId = $affiliate?->affiliate_id;
            $insertionOrderId = $this->lookupIoForRow($affiliateId, $orderDate);
            if (!$insertionOrderId) {
                $this->outOfWindow[] = $row + ['reject_reason' => 'No accepted IO covers this row\'s date for the resolved affiliate'];
                return;
            }
        }

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

        if ($recordKind === EcommerceSale::RECORD_KIND['SALE'] && !empty($ani) && !empty($orderDate)) {
            $saleDate = Carbon::parse($orderDate)->format('Y-m-d');
            $this->sameDaySaleSeen[$this->reqCustomerId . '|' . $ani . '|' . $saleDate] = true;
            EcommerceSale::where('customer_id', $this->reqCustomerId)
                ->where('ani', $ani)
                ->where('zero_call_date', $saleDate)
                ->where('record_kind', EcommerceSale::RECORD_KIND['ZERO_CALL'])
                ->delete();
        }

        return new EcommerceSale([
            'campaign_id'        => $campaignId,
            'customer_id'        => $this->reqCustomerId,
            'insertion_order_id' => $insertionOrderId,
            'order_type'         => $this->reqOrderType,
            'record_kind'        => $recordKind,
            'zero_call_date'     => $zeroCallDate,
            'order_no'           => $this->getValue($row, 'order_no'),
            'coupon_code'        => $couponCode,
            'tracking_url'       => $trackingUrl,
            'user_ip'            => $this->getValue($row, 'user_ip'),
            'dialed'             => $dialed,
            'inbound'            => $this->getValue($row, 'inbound'),
            'shipping_city'      => $shipCity,
            'shipping_state'     => $shipState,
            'ship_country'       => $this->getValue($row, 'ship_country'),
            'shipping_zip'       => $shipZip,
            'billing_zip'        => substr((string) $this->getValue($row, 'billing_zip'), 0, 5),
            'quantity'           => $this->getValue($row, 'quantity'),
            'subtotal'           => $this->getValue($row, 'subtotal'),
            'shipping_cost'      => $shippingCost,
            'total'              => $total,
            'vendor_fee'         => $fees['vendor_fee'],
            'consumerexp_fee'    => $fees['consumerexp_fee'],
            'import_hash'        => $importHash,
            'order_at'           => $orderDate,
            'vendor_code'        => $this->getValue($row, 'vendor_code'),
            'telemarketing_co'   => $this->getValue($row, 'telemarketing_co'),
            'product_code'       => $this->getValue($row, 'product_code'),
            'isci'               => $this->getValue($row, 'isci'),
            'order_description'  => $this->getValue($row, 'order_description'),
            'ani'                => $ani,
            'call_length'        => $this->getValue($row, 'call_length'),
            'payment_type'       => $this->getValue($row, 'payment_type'),
            'r1'                 => $this->getValue($row, 'r1'),
            'station'            => $this->getValue($row, 'station'),
        ]);
    }

    /**
     * Cache accepted IO windows per affiliate (direct affiliate_id + pivot + corp expansion).
     */
    protected function preloadIoWindows(): void
    {
        $ios = InsertionOrder::query()
            ->where('customer_id', $this->reqCustomerId)
            ->where('status', InsertionOrder::STATUS['accepted'])
            ->get([
                'id', 'affiliate_id', 'corporation_type', 'corporation_id',
                'accepted_at', 'canceled_at',
            ]);

        $corpService = app(CorporationService::class);

        foreach ($ios as $io) {
            $window = [
                'from'  => $io->accepted_at,
                'to'    => $io->canceled_at,
                'io_id' => $io->id,
            ];

            $affiliateIds = [];
            if ($io->affiliate_id) {
                $affiliateIds[] = (int) $io->affiliate_id;
            }
            $pivotIds = DB::table('insertion_order_affiliate')
                ->where('insertion_order_id', $io->id)
                ->pluck('affiliate_id')
                ->all();
            foreach ($pivotIds as $aid) {
                $affiliateIds[] = (int) $aid;
            }
            if ($io->corporation_type && $io->corporation_id) {
                $corpIds = $corpService
                    ->affiliateIdsOf($io->corporation_type, (int) $io->corporation_id)
                    ->all();
                foreach ($corpIds as $aid) {
                    $affiliateIds[] = (int) $aid;
                }
            }

            foreach (array_unique($affiliateIds) as $aid) {
                $this->ioWindowsByAffiliate[$aid][] = $window;
            }
        }
    }

    protected function preloadCampaignLookups(): void
    {
        $affiliates = EcommerceAffiliate::query()
            ->where('customer_id', $this->reqCustomerId)
            ->get(['campaign_id', 'dialed', 'coupon_code']);

        foreach ($affiliates as $row) {
            if (!empty($row->dialed)) {
                $this->campaignByDialed[trim((string) $row->dialed)] = (int) $row->campaign_id;
            }
            if (!empty($row->coupon_code)) {
                $this->campaignByPromo[trim((string) $row->coupon_code)] = (int) $row->campaign_id;
            }
        }

        $campaigns = EcommerceCampaign::query()
            ->where('customer_id', $this->reqCustomerId)
            ->get(['id', 'campaign_name']);

        foreach ($campaigns as $row) {
            $this->campaignByName[trim((string) $row->campaign_name)] = (int) $row->id;
        }
    }

    protected function preloadSameDaySales(): void
    {
        $rows = EcommerceSale::query()
            ->where('customer_id', $this->reqCustomerId)
            ->where('record_kind', EcommerceSale::RECORD_KIND['SALE'])
            ->whereNotNull('ani')
            ->whereNotNull('order_at')
            ->selectRaw('ani, DATE(order_at) AS d')
            ->groupBy('ani', 'd')
            ->get();

        foreach ($rows as $r) {
            $this->sameDaySaleSeen[$this->reqCustomerId . '|' . $r->ani . '|' . $r->d] = true;
        }
    }

    protected function lookupIoForRow(?int $affiliateId, ?string $orderDate): ?int
    {
        if (!$affiliateId || !$orderDate) {
            return null;
        }
        $windows = $this->ioWindowsByAffiliate[$affiliateId] ?? null;
        if (!$windows) {
            return null;
        }
        $at = Carbon::parse($orderDate);
        foreach ($windows as $w) {
            $afterFrom = !$w['from'] || $at->greaterThanOrEqualTo($w['from']);
            $beforeTo  = !$w['to']   || $at->lessThanOrEqualTo($w['to']);
            if ($afterFrom && $beforeTo) {
                return (int) $w['io_id'];
            }
        }
        return null;
    }

    protected function resolveCampaignId(array $row, string $dialed, string $couponCode, string $trackingUrl): int
    {
        if (!empty($dialed) && isset($this->campaignByDialed[$dialed])) {
            return $this->campaignByDialed[$dialed];
        }
        if (!empty($couponCode) && isset($this->campaignByPromo[$couponCode])) {
            return $this->campaignByPromo[$couponCode];
        }
        $indicator = trim((string) $this->getValue($row, 'campaign_indicator'));
        if ($indicator !== '') {
            if (isset($this->campaignByDialed[$indicator])) {
                return $this->campaignByDialed[$indicator];
            }
            if (isset($this->campaignByPromo[$indicator])) {
                return $this->campaignByPromo[$indicator];
            }
            if (isset($this->campaignByName[$indicator])) {
                return $this->campaignByName[$indicator];
            }
        }
        return (int) $this->reqCampaignId;
    }

    protected function resolveRecordKind(array $row, float $total): string
    {
        $explicit = strtoupper(trim((string) $this->getValue($row, 'record_kind')));
        if (in_array($explicit, ['SALE', 'RETURN', 'ZERO_CALL'], true)) {
            return $explicit;
        }
        if ($total < 0) {
            return EcommerceSale::RECORD_KIND['RETURN'];
        }
        if ($total == 0.0) {
            return EcommerceSale::RECORD_KIND['ZERO_CALL'];
        }
        return EcommerceSale::RECORD_KIND['SALE'];
    }

    protected function getAffiliate(?int $campaignId, ?string $dialed, ?string $couponCode, ?string $trackingUrl)
    {
        $key = ($campaignId ?? '') . '|' . ($dialed ?? '') . '|' . ($couponCode ?? '') . '|' . ($trackingUrl ?? '');
        if (array_key_exists($key, $this->affiliateCache)) {
            return $this->affiliateCache[$key];
        }
        return $this->affiliateCache[$key] = $this->feeCalc->resolveAffiliate(
            (int) ($campaignId ?? $this->reqCampaignId),
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
            return $row[$this->fieldMap[$key]] ?? null;
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
