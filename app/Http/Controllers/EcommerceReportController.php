<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use Illuminate\Http\Request;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\EcommerceSale;
use App\Models\SavedEcommerceReport;
use App\Models\ZipcodeByTelevisionMarket;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EcommerceReportController extends Controller
{
    private $amIds;
    private $gdmIds;
    private $paId;
    private $ssId;
    private $plexId;

    public function __construct()
    {
        $this->amIds  = Affiliate::where('affiliate_name', 'like', '%Aces Marketing%')->pluck('id')->toArray();
        $this->gdmIds = Affiliate::where('affiliate_name', 'like', '%Golden Direct Media%')->pluck('id')->toArray();
        $this->paId   = EcommerceCampaign::where('campaign_name', 'like', '%Power Swabs%')->pluck('id')->first();
        $this->ssId   = Customer::where('customer_name', 'like', '%Sheer Science%')->pluck('id')->first();
        $this->plexId = EcommerceCampaign::where('campaign_name', 'like', '%Plexaderm%')->pluck('id')->first();
    }

    public function ecommerceReport()
    {
        $campaigns       = EcommerceCampaign::active()->get();
        $customers       = Customer::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks  = BroadCastWeeks::active()->get();
        $states          = ZipcodeByTelevisionMarket::select('state')->orderBy('state')->distinct()->get();
        $markets         = ZipcodeByTelevisionMarket::select('market')->orderBy('market')->distinct()->get();
        $acesMarketingId = $this->amIds;
        $savedReports = SavedEcommerceReport::where('user_id', auth()->id())->latest()->get();

        return Inertia::render('GenerateReport/EcommerceReport', compact('campaigns', 'customers', 'broadCastMonths', 'broadCastWeeks', 'states', 'markets', 'acesMarketingId', 'savedReports'));
    }

    public function selectionWiseData(Request $request)
    {
        try {
            $selectionWiseData = EcommerceAffiliate::with('affiliate:id,affiliate_name,email,market')
                ->when($request->campaign_ids, fn($q) => $q->whereIn('campaign_id', $request->campaign_ids))
                ->when($request->customer_ids, fn($q) => $q->whereIn('customer_id', $request->customer_ids))
                ->get(['coupon_code', 'dialed', 'affiliate_id']);

            $couponCodes = array_filter($selectionWiseData->pluck('coupon_code')->unique()->toArray());
            $dialedPhones = array_filter($selectionWiseData->pluck('dialed')->unique()->toArray());
            $affiliates = $selectionWiseData->map(fn($item) => [
                $item?->affiliate?->id,
                $item?->affiliate?->affiliate_name . (!empty($item->affiliate->market) ? ' (' . $item?->affiliate?->market . ')' : ''),
                $item?->affiliate?->email
            ])->unique()->toArray();

            return response()->json(['success' => true, 'affiliates' => $affiliates, 'couponCodes' => $couponCodes, 'dialedPhones' => $dialedPhones]);
        } catch (\Throwable $th) {
            return response()->json(['success' => false], 422);
        }
    }

    public function ecommerceReportGenerate(Request $request)
    {
        $this->resolveDateRangeFromSetup($request);
        $salesData = $this->queryReport($request);
        $summary   = [];
        $header    = [];

        if (!empty($request->affiliate_id)) {
            $checkAffiliate = intval($request->affiliate_id[0]);
        } else {
            $checkAffiliate = '';
        }

        $summaryCampaigns = [];

        if (isset($request->campaign_id)) {
            $summaryCampaigns = EcommerceCampaign::whereIn('id', $request->campaign_id)->select('campaign_name')->pluck('campaign_name')->toArray();
        }

        if ($request->reportOn != 'exportCSV') {
            $header  = $this->getHeader($request);
            $summary = $this->getReportSummary($request->reportFor, $request->reportOn, $request->type, $salesData, $summaryCampaigns, $request->affiliate_id, $request->campaign_id, $request->customer_id);

            if (!empty($request->year)) {
                $selectedYears        = implode(', ', $request->year);
                $yearNaming           = (count($request->year) > 1) ? 'Years' : 'Year';
                $summary[$yearNaming] = $selectedYears;
            } elseif (isset($request->start_date) && isset($request->end_date)) {
                $summary['From'] = date_format(date_create($request->start_date), 'd-M-Y');
                $summary['To']   = date_format(date_create($request->end_date), 'd-M-Y');
            }
        }

        if ($request->reportFor === 'payPerOrder' && $request->reportOn === 'marketTarget') {
            $salesData->transform(function ($item) {
                if (isset($item->{'TV Households'})) {
                    $item->{'TV Households'} = number_format($item->{'TV Households'}, 0, '.', ',');
                }

                if (isset($item->{'Homes Per Sales'})) {
                    $item->{'Homes Per Sales'} = number_format($item->{'Homes Per Sales'}, 0, '.', ',');
                }
                return $item;
            });
        }

        if ($request->reportOn === 'exportCSV' && in_array($checkAffiliate, $this->amIds) && $salesData->count() === 0) {
            $salesData = 'csvEmptyTemplateAces';
        }

        if ($request->report_type === 'email-report') {
            $emails = $request->type === 'affiliate' ? $request->affiliatesEmail : $request->emails;

            if (app()->environment('local')) {
                $emails = ['shosen@bitcode.pro'];
            }

            if (empty($emails)) {
                return response()->json(['success' => false, 'message' => 'No email found.'], 422);
            }

            if ($request->reportFor === 'cashBuy' && $request->reportOn != 'summary') {
                $salesData = collect($salesData);
            }

            $emailCriteria = $this->getEmailCriteria($request, $salesData);
            $summary       = $request->reportOn != 'exportCSV' ? ['Summary' => ''] + $summary : $summary;
            $sendMailCtrl  = new SendMailController();

            $sendMailCtrl->sendMail($salesData, $summary, [], $request->file_name, $emails, $emailCriteria, $header, $request->reportOn, 'Ecommerce Report');

            return response()->json(['message' => 'Email sent successfully.'], 200);
        }

        return response()->json([
            'header'  => $header,
            'data'    => $salesData,
            'summary' => $summary,
        ], 200);
    }

    protected function resolveDateRangeFromSetup(Request $request): void
    {
        $setupType = $request->input('report_setup', 'manual');
        if (
            $setupType === 'manual' &&
            $request->boolean('recurrence_enabled') &&
            !empty($request->input('recurrence_frequency'))
        ) {
            $setupType = $request->input('recurrence_frequency');
        }

        $resolvedRange = $this->resolveDateRangeFromSetupType($setupType);
        if (empty($resolvedRange)) {
            return;
        }

        $request->merge($resolvedRange);
    }

    public function resolveDateRangeFromSetupType(string $setupType): array
    {
        if ($setupType === 'manual') {
            return [];
        }

        if ($setupType === 'weekly') {
            $start = Carbon::now()->startOfWeek(Carbon::MONDAY)->subWeek()->toDateString();
            $end   = Carbon::now()->startOfWeek(Carbon::MONDAY)->subDay()->toDateString();

            return [
                'year'             => [],
                'broad_cast_week'  => null,
                'broad_cast_month' => null,
                'start_date'       => $start,
                'end_date'         => $end,
            ];
        }

        if ($setupType === 'monthly') {
            $start = Carbon::now()->subMonthNoOverflow()->startOfMonth()->toDateString();
            $end   = Carbon::now()->subMonthNoOverflow()->endOfMonth()->toDateString();

            return [
                'year'             => [],
                'broad_cast_week'  => null,
                'broad_cast_month' => null,
                'start_date'       => $start,
                'end_date'         => $end,
            ];
        }

        if ($setupType === 'broadcast_monthly') {
            $previousBroadcastMonth = BroadCastMonth::active()
                ->whereDate('end_date', '<', Carbon::today())
                ->orderByDesc('end_date')
                ->first();

            if (!$previousBroadcastMonth) {
                return [];
            }

            return [
                'year'             => [],
                'broad_cast_week'  => null,
                'broad_cast_month' => $previousBroadcastMonth->broad_cast_month,
                'start_date'       => $previousBroadcastMonth->start_date,
                'end_date'         => $previousBroadcastMonth->end_date,
            ];
        }

        return [];
    }

    public function saveReport(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'filters' => 'required|array',
        ]);

        SavedEcommerceReport::create([
            'user_id' => auth()->id(),
            'name'    => $request->name,
            'filters' => $request->filters,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Report saved successfully.'], 201);
    }

    public function updateReport(Request $request, $id)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'filters' => 'required|array',
        ]);

        $report = SavedEcommerceReport::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $report->update([
            'name'    => $request->name,
            'filters' => $request->filters,
        ]);

        return response()->json(['message' => 'Report updated successfully.'], 200);
    }

    public function deleteReport($id)
    {
        $report = SavedEcommerceReport::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $report->delete();

        return response()->json(['message' => 'Report deleted successfully.'], 200);
    }

    protected function queryReport($request)
    {
        $couponCodes = $request->couponCodes;
        $dialed      = $request->dialed;
        $year        = $request->year;
        $startDate   = $request->start_date;
        $endDate     = $request->end_date;
        $type        = $request->type;
        $states      = $request->states;
        $markets     = $request->markets;
        $reportFor   = $request->reportFor;
        $reportGenOn = $request->reportOn;
        $orderType   = $request->orderType;
        $affiliate   = $request->affiliate_id;
        $amGdmIds    = array_merge($this->amIds, $this->gdmIds);

        $queryData   = DB::table('ecommerce_sales')
            ->when(
                $orderType,
                fn($q) => $q->join('ecommerce_affiliates', function ($join) use ($orderType) {
                    if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['e-commerce']) {
                        $join->on('ecommerce_affiliates.coupon_code', '=', 'ecommerce_sales.coupon_code');
                    }
                    if ($orderType == EcommerceSale::ORDER_TYPE['phone']) {
                        $join->on('ecommerce_affiliates.dialed', '=', 'ecommerce_sales.dialed');
                    }
                    if ($orderType === 'both') {
                        $join->orOn('ecommerce_affiliates.dialed', '=', 'ecommerce_sales.dialed');
                    }
                })
            )
            ->when(($reportFor === 'payPerOrder' && ($reportGenOn === 'detail' || $reportGenOn === 'summary')), fn($q) => $q->join('ecommerce_campaigns', 'ecommerce_campaigns.id', '=', 'ecommerce_sales.campaign_id'))
            ->when(($reportFor === 'payPerOrder' && $reportGenOn === 'detail'), fn($q) => $q->join('customers', 'customers.id', '=', 'ecommerce_sales.customer_id'))
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->leftJoin('zipcode_by_television_markets', 'zipcode_by_television_markets.zip_code', '=', 'ecommerce_sales.shipping_zip')
            ->leftJoin('t_v_households', 't_v_households.market', '=', 'zipcode_by_television_markets.market')
            ->when(!empty($request->campaign_id), fn($q) => $q->whereIn('ecommerce_affiliates.campaign_id', $request->campaign_id))
            ->when(!empty($request->customer_id), fn($q) => $q->whereIn('ecommerce_affiliates.customer_id', $request->customer_id))
            ->when(!empty($affiliate) && !in_array('allAffiliates', $affiliate), fn($q) => $q->whereIn('ecommerce_affiliates.affiliate_id', $affiliate))
            ->when(!empty($states) && !in_array('allStates', $states), fn($q) => $q->whereIn('zipcode_by_television_markets.state', $states))
            ->when(!empty($markets) && !in_array('allMarkets', $markets), fn($q) => $q->whereIn('zipcode_by_television_markets.market', $markets))
            ->when(!empty($couponCodes) && empty($dialed), fn($q) => $q->whereIn('ecommerce_sales.coupon_code', $couponCodes))
            ->when(!empty($dialed) && empty($couponCodes), fn($q) => $q->whereIn('ecommerce_sales.dialed', $dialed))
            ->when(
                !empty($dialed) && !empty($couponCodes),
                fn($q) => $q->whereIn('ecommerce_sales.coupon_code', $couponCodes)->whereIn('ecommerce_sales.dialed', $dialed, 'or')
            )
            ->when(!empty($year), function ($q) use ($year) {
                if (is_array($year)) {
                    $q->where(function ($q) use ($year) {
                        foreach ($year as $yr) {
                            $q->where('ecommerce_sales.order_at', 'like', '%' . $yr . '%', 'or');
                        }
                    });
                } else {
                    $q->whereYear('ecommerce_sales.order_at', $year);
                }
            })
            ->when(
                empty($year) && !empty($startDate) && !empty($endDate),
                fn($q) => $q
                    ->whereDate('ecommerce_sales.order_at', '>=', $startDate)
                    ->whereDate('ecommerce_sales.order_at', '<=', $endDate)
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'detail'),
                fn($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->groupBy('ecommerce_sales.id')
                    ->select($this->payPerOrderDetailReportColumns($type, $orderType, $affiliate, $request->campaign_id, $request->customer_id))
                    ->orderBy('ecommerce_sales.order_at')
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'marketTarget'),
                fn($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->whereNotNull('zipcode_by_television_markets.market')
                    ->groupBy('zipcode_by_television_markets.market')
                    ->select($this->payPerOrderMarketTargetReportColumns($type, $affiliate, $amGdmIds, $request->campaign_id, $request->customer_id))
                    ->orderBy('Homes Per Sales')
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'summary'),
                fn($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->groupBy('ecommerce_sales.coupon_code', 'ecommerce_sales.dialed')
                    ->select($this->payPerOrderSummaryReportColumns($type, $affiliate, $amGdmIds, $request->campaign_id, $request->customer_id))
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'exportCSV'),
                fn($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->groupBy('ecommerce_sales.id')
                    ->select($this->payPerOrderExportCSVColumns($affiliate))
                    ->orderBy('ecommerce_sales.order_at')
            )
            ->when(
                ($reportFor === 'cashBuy' && $reportGenOn != 'summary'),
                fn($q) => $this->queryForCashBuy($q, $orderType, $affiliate, $type, $reportGenOn)
            )
            ->when(
                ($reportFor === 'cashBuy' && $reportGenOn === 'summary'),
                fn($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 2)
                    ->groupBy('ecommerce_sales.coupon_code', 'ecommerce_sales.dialed')
                    ->select($this->cashBuySummaryReportColumns())
            )
            ->get();

        if ($reportFor === 'payPerOrder' && $reportGenOn === 'summary') {
            return $this->payPerOrderSummaryReportOrderBy($affiliate, $type, $request->campaign_id, $request->customer_id, $amGdmIds, $queryData)->values();
        }

        if ($reportFor === 'cashBuy' && $reportGenOn != 'summary') {
            if (!empty($markets) && !in_array('allMarkets', $markets)) {
                $queryData = $queryData->whereIn('Customer Market', $markets);
            }

            if (!empty($states) && !in_array('allStates', $states)) {
                $queryData = $queryData->whereIn('stateForFilter', $states);
            }

            if (!empty($year)) {
                $queryData = $queryData->whereIn('orderYear', $year);
            } elseif (!empty($startDate) && !empty($endDate)) {
                $queryData = $queryData->whereBetween('formattedOrderDate', [$startDate, $endDate]);
            }

            if ($reportGenOn === 'marketTarget') {
                $marketTargetQuery = $queryData->groupBy('Customer Market')->map(function ($items) {
                    $totalQuantity = 0;
                    $totalRevenue  = 0;

                    foreach ($items as $item) {
                        $data = [
                            'Market'         => $item->{'Customer Market'},
                            'TV Households'  => number_format($item->{'TV Households'}, 0, '.', ','),
                            'Total Quantity' => $totalQuantity += $item->{'Total Quantity'}
                        ];
                        $tvHouseholds  = $item->{'TV Households'};
                        $totalRevenue += $item->Quantity * $item->{'Total Revenue'};
                    }

                    $data['Homes Per Sales'] = number_format(($tvHouseholds / $data['Total Quantity']), 0, '.', ',');
                    $data['Total Revenue']   = round($totalRevenue, 2);

                    return $data;
                });

                $marketTargetQuery = $marketTargetQuery->sortBy(function ($item) {
                    return (int) (str_replace(',', '', $item['Homes Per Sales']));
                });

                return [...$marketTargetQuery->values()];
            }

            $filteredQueryData = $queryData->map(function ($item) {
                unset($item->orderYear, $item->formattedOrderDate, $item->stateForFilter);
                return $item;
            });

            return [...$filteredQueryData];
        }

        return $queryData;
    }

    protected function queryForCashBuy($q, $orderType, $affiliate, $type, $reportGenOn)
    {
        if ($orderType === 'both') {
            $subQueryColumns = [
                DB::raw('CASE WHEN ecommerce_sales.coupon_code = "" OR ecommerce_sales.coupon_code IS NULL THEN ecommerce_sales.dialed ELSE ecommerce_sales.coupon_code END AS coupon_code'),
                'ecommerce_sales.dialed',
                DB::raw('SUM(ecommerce_sales.quantity) AS total_quantity')
            ];
        } elseif ($orderType === '1') {
            $subQueryColumns = [
                'ecommerce_sales.coupon_code',
                DB::raw('SUM(ecommerce_sales.quantity) AS total_quantity')
            ];
        } else {
            $subQueryColumns = [
                'ecommerce_sales.dialed',
                DB::raw('SUM(ecommerce_sales.quantity) AS total_quantity')
            ];
        }

        $subQuery = $q->where('ecommerce_affiliates.affiliate_fee_type', '=', 2)
            ->select($subQueryColumns)
            ->when($orderType === 'both', fn($q) => $q->groupBy('coupon_code'))
            ->when($orderType === '1', fn($q) => $q->groupBy('ecommerce_sales.coupon_code'))
            ->when($orderType === '2', fn($q) => $q->groupBy('ecommerce_sales.dialed'));

        $finalQuery = DB::table(DB::raw("({$subQuery->toSql()}) AS sub"))
            ->join(
                'ecommerce_sales',
                function ($join) use ($orderType) {
                    if ($orderType === 'both') {
                        $join->on('sub.coupon_code', '=', 'ecommerce_sales.coupon_code');
                        $join->orOn('sub.coupon_code', '=', 'ecommerce_sales.dialed');
                    } elseif ($orderType === '1') {
                        $join->on('sub.coupon_code', '=', 'ecommerce_sales.coupon_code');
                    } elseif ($orderType === '2') {
                        $join->on('sub.dialed', '=', 'ecommerce_sales.dialed');
                    }
                }
            )
            ->join('ecommerce_affiliates', function ($join) use ($orderType) {
                if ($orderType === 'both') {
                    $join->on('ecommerce_sales.coupon_code', '=', 'ecommerce_affiliates.coupon_code')
                        ->orOn('ecommerce_sales.dialed', '=', 'ecommerce_affiliates.dialed');
                } elseif ($orderType === '1') {
                    $join->on('ecommerce_sales.coupon_code', '=', 'ecommerce_affiliates.coupon_code');
                } else {
                    $join->on('ecommerce_sales.dialed', '=', 'ecommerce_affiliates.dialed');
                }
            })
            ->join('ecommerce_campaigns', 'ecommerce_campaigns.id', '=', 'ecommerce_sales.campaign_id')
            ->join('customers', 'customers.id', '=', 'ecommerce_sales.customer_id')
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->leftJoin('zipcode_by_television_markets', 'zipcode_by_television_markets.zip_code', '=', 'ecommerce_sales.shipping_zip')
            ->leftJoin('t_v_households', 't_v_households.market', '=', 'zipcode_by_television_markets.market')
            ->when($reportGenOn === 'detail', fn($q) => $q->select($this->selectColumnSalesCashBuyReport($orderType, $affiliate, $type)))
            ->when($reportGenOn === 'marketTarget', fn($q) => $q->select($this->cashBuyMarketTargetReportColumns()))
            ->mergeBindings($subQuery)
            ->groupBy('ecommerce_sales.id')
            ->when($reportGenOn === 'detail', fn($q) => $q->orderBy('ecommerce_sales.order_at'));

        return $finalQuery;
    }

    protected function payPerOrderSummaryReportColumns($type, $affiliate, $amGdmIds, $selectedCampaigns, $selectedCustomers)
    {
        if ($type === 'customer') {
            $column = 'revenue';
            $alias = 'Total Fee';
        } else {
            $column = 'affiliate_fee';
            $alias = 'Affiliate Fee';
        }

        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $sheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $sheerScienceAllAffiliate = false;
        }

        if (in_array($checkAffiliate, $amGdmIds) || $powerswabsAllAffiliate || $sheerScienceAllAffiliate) {
            $columns = [
                'affiliates.affiliate_name AS Affiliate Name',
                'ecommerce_campaigns.campaign_name AS Campaign Name',
                'ecommerce_affiliates.product_code AS ISCI Code',
                'affiliates.market AS Affiliate Market',
                DB::raw('REPLACE(ecommerce_affiliates.lengths, ",", ", ") AS "Length"'),
                'ecommerce_sales.coupon_code AS Coupon Code',
                'ecommerce_sales.dialed AS Dialed',
                DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
                DB::raw('CASE WHEN ecommerce_sales.quantity IS NULL OR ecommerce_sales.quantity = "" THEN "" 
                        ELSE CASE WHEN ecommerce_affiliates.pay_on_multiple_orders = "0" THEN
                        ROUND(ecommerce_affiliates.' . $column . ' * COUNT(CASE WHEN ecommerce_sales.quantity IS NOT NULL AND ecommerce_sales.quantity > 0 THEN ecommerce_sales.id END), 2) ELSE
                        ROUND(ecommerce_affiliates.' . $column . ' * SUM(ecommerce_sales.quantity), 2) END
                        END AS `' . $alias . '`')
            ];
        } else {
            $columns = [
                'affiliates.affiliate_name AS Affiliate Name',
                'ecommerce_campaigns.campaign_name AS Campaign Name',
                'ecommerce_affiliates.product_code AS ISCI Code',
                'affiliates.market AS Affiliate Market',
                DB::raw('REPLACE(ecommerce_affiliates.lengths, ",", ", ") AS "Length"'),
                'ecommerce_sales.coupon_code AS Coupon Code',
                'ecommerce_sales.dialed AS Dialed',
                DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Amount`'),
                DB::raw('CASE WHEN ecommerce_sales.quantity IS NULL OR ecommerce_sales.quantity = "" THEN "" 
                        ELSE CASE WHEN ecommerce_affiliates.pay_on_multiple_orders = "0" THEN
                        ROUND(ecommerce_affiliates.' . $column . ' * COUNT(CASE WHEN ecommerce_sales.quantity IS NOT NULL AND ecommerce_sales.quantity > 0 THEN ecommerce_sales.id END), 2) ELSE
                        ROUND(ecommerce_affiliates.' . $column . ' * SUM(ecommerce_sales.quantity), 2) END
                        END AS `' . $alias . '`'),
            ];

            if ($type === 'customer') {
                $columns[] = DB::raw('CASE WHEN ecommerce_sales.quantity IS NULL OR ecommerce_sales.quantity = "" THEN ""
                                ELSE CASE WHEN ecommerce_affiliates.pay_on_multiple_orders = "0" THEN
                                ROUND(SUM(ecommerce_sales.total) - (ecommerce_affiliates.revenue * COUNT(CASE WHEN ecommerce_sales.quantity IS NOT NULL AND ecommerce_sales.quantity > 0 THEN ecommerce_sales.id END)), 2) ELSE
                                ROUND(SUM(ecommerce_sales.total) - (ecommerce_affiliates.revenue * SUM(ecommerce_sales.quantity)), 2) END 
                                END AS `Net Amount`');
            }
        }

        return $columns;
    }

    protected function cashBuySummaryReportColumns()
    {
        return [
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_affiliates.product_code AS ISCI Code',
            'affiliates.market AS Affiliate Market',
            DB::raw('REPLACE(ecommerce_affiliates.lengths, ",", ", ") AS "Length"'),
            'ecommerce_sales.coupon_code AS Coupon Code',
            'ecommerce_sales.dialed AS Dialed',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            'ecommerce_affiliates.cash_buy AS Total Amount',
            'ecommerce_affiliates.consumerEXP_cash_buy_fee AS Total Fee',
            DB::raw('ecommerce_affiliates.cash_buy - ecommerce_affiliates.consumerEXP_cash_buy_fee AS "Net Amount"'),
        ];
    }

    protected function payPerOrderMarketTargetReportColumns($type, $affiliate, $amGdmIds, $selectedCampaigns, $selectedCustomers)
    {
        if ($type === 'customer') {
            $column = 'revenue';
            $alias = 'Total Revenue';
        } else {
            $column = 'affiliate_fee';
            $alias = 'Total Revenue';
        }

        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $sheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $sheerScienceAllAffiliate = false;
        }

        $columns =  [
            'zipcode_by_television_markets.market AS Customer Market',
            't_v_households.tv_households AS TV Households',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(t_v_households.tv_households / SUM(ecommerce_sales.quantity), 2) AS `Homes Per Sales`'),
        ];

        if (in_array($checkAffiliate, $amGdmIds) || $powerswabsAllAffiliate || $sheerScienceAllAffiliate) {
            $columns[] =  DB::raw('CASE WHEN ecommerce_sales.quantity IS NULL OR ecommerce_sales.quantity = "" THEN "" 
            ELSE CASE WHEN ecommerce_affiliates.pay_on_multiple_orders = "0" THEN
            ROUND(ecommerce_affiliates.' . $column . ' * COUNT(CASE WHEN ecommerce_sales.quantity IS NOT NULL AND ecommerce_sales.quantity > 0 THEN ecommerce_sales.id END), 2) ELSE
            ROUND(ecommerce_affiliates.' . $column . ' * SUM(ecommerce_sales.quantity), 2) END
            END AS `' . $alias . '`');
        } else {
            $columns[] = DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Revenue`');
        }

        return $columns;
    }

    protected function cashBuyMarketTargetReportColumns()
    {
        return [
            'zipcode_by_television_markets.market AS Customer Market',
            't_v_households.tv_households AS TV Households',
            'ecommerce_sales.quantity AS Quantity',
            'zipcode_by_television_markets.state AS stateForFilter',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('SUM(ecommerce_affiliates.cash_buy / sub.total_quantity) AS "Total Revenue"'),
            DB::raw('YEAR(ecommerce_sales.order_at) AS orderYear'),
            DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%Y-%m-%d") AS formattedOrderDate')
        ];
    }

    // add new column for detailed sales report depending on order type
    protected function addColumnToArray($array, $orderType, $offset, $affiliate, $powerswabsAllAffiliate = false, $SheerScienceAllAffiliate = false)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $SheerScienceAllAffiliate) {
            if ($orderType === 'both') {
                $addColumns = ['ecommerce_sales.coupon_code AS Coupon Code', 'ecommerce_sales.dialed AS Dialed (800#)'];
                array_splice($array, $offset, 0, $addColumns);
            } elseif ($orderType == EcommerceSale::ORDER_TYPE['e-commerce']) {
                $addColumns = ['ecommerce_sales.coupon_code AS Coupon Code'];
                array_splice($array, $offset, 0, $addColumns);
            } elseif ($orderType == EcommerceSale::ORDER_TYPE['phone']) {
                $addColumns = ['ecommerce_sales.dialed AS Dialed (800#)'];
                array_splice($array, $offset, 0, $addColumns);
            }
        } else {
            if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['phone']) {
                $dialedColumn = ['ecommerce_sales.dialed AS Dialed'];
                array_splice($array, $offset, 0, $dialedColumn);
            }
            if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['e-commerce']) {
                $couponCodeColumn = ['ecommerce_sales.coupon_code AS Coupon Code'];
                array_splice($array, $offset, 0, $couponCodeColumn);
            }
        }
        return $array;
    }

    protected function payPerOrderDetailReportColumns($type, $orderType, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if ($type === 'customer') {
            $column = 'revenue';
            $alias = 'Total Fee';
            // For % of Sales (fee_mode=3) the per-row fee paid by the customer is
            // vendor_fee + consumerexp_fee — calculated at import time, not static.
            $pctExpr = 'COALESCE(ecommerce_sales.vendor_fee, 0) + COALESCE(ecommerce_sales.consumerexp_fee, 0)';
        } else {
            $column = 'affiliate_fee';
            $alias = 'Affiliate Fee';
            // Affiliate's share under % of Sales mode is the vendor_fee column.
            $pctExpr = 'COALESCE(ecommerce_sales.vendor_fee, 0)';
        }

        // Fee expression: branches on affiliate_fee_type so fee_mode=3 rows pull
        // the per-row calculated fee while fixed-$ / cash buy modes keep using
        // the static affiliate-level rate.
        $feeExpr = 'CASE WHEN ecommerce_sales.quantity IS NULL OR ecommerce_sales.quantity = "" THEN ""
                    WHEN ecommerce_affiliates.affiliate_fee_type = 3 THEN ROUND(' . $pctExpr . ', 2)
                    WHEN ecommerce_affiliates.pay_on_multiple_orders = "0" THEN ROUND(ecommerce_affiliates.' . $column . ', 2)
                    ELSE ROUND(ecommerce_affiliates.' . $column . ' * ecommerce_sales.quantity, 2)
                    END';

        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $SheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $SheerScienceAllAffiliate = false;
        }

        if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $SheerScienceAllAffiliate) {
            $selectRows = [
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%Y/%m/%d") AS `Date of call`'),
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%H:%i") AS `Time of call`'),
                'ecommerce_campaigns.campaign_name AS Campaign Name',
                'affiliates.affiliate_name AS Affiliate Name',
                'affiliates.market AS Affiliate Market',
                DB::raw('REPLACE(ecommerce_affiliates.lengths, ",", ", ") AS "Length"'),
                'ecommerce_affiliates.product_code AS ISCI',
                'zipcode_by_television_markets.market AS Customer Market',
                'ecommerce_sales.ani AS ANI',
                'ecommerce_sales.shipping_city AS Ship City',
                'ecommerce_sales.shipping_state AS Ship State',
                'ecommerce_sales.shipping_zip AS Ship Zip Code',
                'ecommerce_sales.call_length AS Call Length',
                'ecommerce_sales.quantity AS Quantity',
                'ecommerce_sales.quantity AS R2 Orders',
                'ecommerce_sales.r1 AS R1 Calls',
                DB::raw($feeExpr . ' AS `' . $alias . '`'),
            ];
            $selectRows = $this->addColumnToArray($selectRows, $orderType, 8, $affiliate, $powerswabsAllAffiliate, $SheerScienceAllAffiliate);
        } else {
            $selectRows = [
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%d-%b-%Y %H:%i") AS `Date`'),
                'customers.customer_name AS Customer Name',
                'ecommerce_campaigns.campaign_name AS Campaign Name',
                'affiliates.affiliate_name AS Affiliate Name',
                'ecommerce_affiliates.product_code AS ISCI Code',
                'affiliates.market AS Affiliate Market',
                DB::raw('REPLACE(ecommerce_affiliates.lengths, ",", ", ") AS "Length"'),
                'ecommerce_sales.shipping_state AS State',
                'ecommerce_sales.shipping_city AS City',
                'ecommerce_sales.shipping_zip AS Zip Code',
                'zipcode_by_television_markets.market AS Customer Market',
                't_v_households.tv_households AS TV Market Households',
                'ecommerce_sales.quantity AS Total Quantity',
                'ecommerce_sales.total AS Total Amount',
                DB::raw($feeExpr . ' AS `' . $alias . '`'),
            ];

            $selectRows = $this->addColumnToArray($selectRows, $orderType, 7, $affiliate);

            if ($type === 'customer') {
                // Net Amount = Total Amount - Total Fee.
                // For % of Sales (fee_mode=3) the fee is vendor_fee + consumerexp_fee per row;
                // for fixed modes the fee is the static affiliate-level rate (× quantity if multi-order).
                $netExpr = 'ROUND(ecommerce_sales.total - (
                    CASE WHEN ecommerce_affiliates.affiliate_fee_type = 3
                            THEN COALESCE(ecommerce_sales.vendor_fee, 0) + COALESCE(ecommerce_sales.consumerexp_fee, 0)
                         WHEN ecommerce_affiliates.pay_on_multiple_orders = "0"
                            THEN ecommerce_affiliates.revenue
                         ELSE ecommerce_affiliates.revenue * COALESCE(ecommerce_sales.quantity, 0)
                    END
                ), 2)';
                return array_merge($selectRows, [
                    DB::raw($netExpr . ' AS `Net Amount`'),
                ]);
            }
        }

        return $selectRows;
    }

    protected function selectColumnSalesCashBuyReport($orderType, $affiliate, $type)
    {
        $selectRows = [
            DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%d-%b-%Y %H:%i") AS `Date`'),
            'customers.customer_name AS Customer Name',
            'ecommerce_campaigns.campaign_name AS Campaign Name',
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_affiliates.product_code AS ISCI Code',
            'affiliates.market AS Affiliate Market',
            DB::raw('REPLACE(ecommerce_affiliates.lengths, ",", ", ") AS "Length"'),
            'ecommerce_sales.shipping_state AS State',
            'ecommerce_sales.shipping_city AS City',
            'ecommerce_sales.shipping_zip AS Zip Code',
            'zipcode_by_television_markets.market AS Customer Market',
            'zipcode_by_television_markets.state AS stateForFilter',
            't_v_households.tv_households AS TV Market Households',
            'ecommerce_sales.quantity AS Quantity',
            DB::raw('YEAR(ecommerce_sales.order_at) AS orderYear'),
            DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%Y-%m-%d") AS formattedOrderDate'),
            DB::raw('ROUND(ecommerce_affiliates.cash_buy / sub.total_quantity, 2) AS Payout'),
            DB::raw('ROUND((ecommerce_affiliates.cash_buy / sub.total_quantity) - (ecommerce_affiliates.consumerEXP_cash_buy_fee / sub.total_quantity), 2) AS "Affiliate Fee"'),
        ];

        if ($type === 'customer') {
            $selectRows[] = DB::raw('ROUND(ecommerce_affiliates.consumerEXP_cash_buy_fee / sub.total_quantity, 2) AS "ConsumerEXP Fee"');
        }

        return $this->addColumnToArray($selectRows, $orderType, 7, $affiliate);
    }

    protected function payPerOrderExportCSVColumns($affiliate)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (in_array($checkAffiliate, $this->amIds)) {
            $columnsForAcesMarketing = [
                'ecommerce_sales.vendor_code AS Vendor',
                'ecommerce_sales.product_code AS ProductCode',
                'ecommerce_affiliates.product_code AS CreativeCode',
                'ecommerce_sales.station AS Station',
                'ecommerce_sales.dialed AS Dnis',
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%y/%m/%d") AS CallDate'),
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%H:%i") AS CallTime'),
                'ecommerce_sales.ani AS ANI',
                DB::raw('"" AS CallerCity'),
                DB::raw('"" AS CallerState'),
                DB::raw('"" AS CallerZip'),
                DB::raw('"" AS CallerCountry'),
                DB::raw('"" AS CallerGender'),
                'ecommerce_sales.shipping_city AS City',
                'ecommerce_sales.shipping_state AS State',
                'ecommerce_sales.shipping_zip AS Zip',
                'ecommerce_sales.total AS Revenue',
                'ecommerce_sales.call_length AS CallLength',
                'ecommerce_sales.payment_type AS PaymentMethod',
                'ecommerce_sales.r1 AS R1',
                'ecommerce_sales.quantity AS R2',
            ];

            return $columnsForAcesMarketing;
        } elseif (in_array($checkAffiliate, $this->gdmIds)) {
            $columnsForGdm = [
                'ecommerce_affiliates.product_code AS ISCI code(s)',
                'ecommerce_sales.coupon_code AS Coupon Code',
                'ecommerce_sales.dialed AS Dialed',
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%m/%d/%Y") AS `Date of call`'),
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%h:%i:%s %p") AS `Time of call`'),
                'ecommerce_sales.ani AS ANI',
                'ecommerce_sales.shipping_city AS City',
                'ecommerce_sales.shipping_state AS State',
                'ecommerce_sales.shipping_zip AS Zip Code',
                'ecommerce_sales.call_length AS Call Length',
                'ecommerce_sales.quantity AS Total orders',
            ];

            return $columnsForGdm;
        }

        return [
            DB::raw('"" AS DEMO')
        ];
    }

    protected function getReportSummary($reportFor, $reportGenOn, $type, $salesData, $summaryCampaigns, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if ($reportFor === 'payPerOrder' && $reportGenOn === 'detail') {
            if ($type === 'customer') {
                if (!empty($summaryCampaigns) && !empty($salesData->toArray())) {
                    return $this->customerCampaignSeparatedSummary($salesData, $summaryCampaigns, $affiliate, $selectedCampaigns, $selectedCustomers);
                } else {
                    return $this->customerSummary($salesData, $affiliate, $selectedCampaigns, $selectedCustomers);
                }
            }
            if (!empty($summaryCampaigns) && !empty($salesData->toArray())) {
                return $this->affiliateCampaignSeparatedSummary($salesData, $summaryCampaigns, $affiliate, $selectedCampaigns, $selectedCustomers);
            } else {
                return $this->affiliateSummary($salesData, $affiliate, $selectedCampaigns, $selectedCustomers);
            }
        } elseif ($reportFor === 'payPerOrder' && $reportGenOn === 'marketTarget') {
            return $this->marketTargetSummary($salesData);
        } elseif ($reportFor === 'payPerOrder' && $reportGenOn === 'summary') {
            return $this->summarySummary($salesData, $type, $affiliate, $selectedCampaigns, $selectedCustomers);
        } elseif ($reportFor === 'cashBuy' && $reportGenOn === 'detail') {
            return $this->cashBuySummary($salesData, $type);
        } elseif ($reportFor === 'cashBuy' && $reportGenOn === 'marketTarget') {
            return $this->cashBuyMarketTargetSummary($salesData);
        } elseif ($reportFor === 'cashBuy' && $reportGenOn === 'summary') {
            return $this->cashBuySummarySummary($salesData);
        }
        return [];
    }

    protected function customerSummary($salesData, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $SheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $SheerScienceAllAffiliate = false;
        }

        $summary       = [];
        $totalCoupons  = 0;
        $totalPhones   = 0;
        $totalOrders   = 0;
        $totalQuantity = 0;
        $totalAmount   = 0;
        $totalFee      = 0;
        $netAmount     = 0;

        foreach ($salesData as $data) {
            if (!empty($data->{'Coupon Code'})) {
                $totalCoupons += (int) $data->{'Total Quantity'};
            }

            if (!empty($data->{'Dialed'}) || !empty($data->{'Dialed (800#)'})) {
                $totalPhones += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
            }

            $totalQuantity += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
            $totalAmount   += property_exists($data, 'Total Amount') ? $data->{'Total Amount'} : 0;
            $netAmount     += property_exists($data, 'Net Amount') ? $data->{'Net Amount'} : 0;
            $totalFee      += (float) $data->{'Total Fee'};
            $totalOrders   += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
        }

        $couponOrdersPercentage  = $totalOrders != 0 ? (round((($totalCoupons / $totalOrders) * 100), 2)) : 0;
        $phoneOrdersPercentage   = $totalOrders != 0 ? (round((($totalPhones / $totalOrders) * 100), 2)) : 0;
        $totalFeePercentage      = $totalAmount != 0 ? (round((($totalFee / $totalAmount) * 100), 2)) : 0;
        $netAmountPercentage     = $totalAmount != 0 ? (round((($netAmount / $totalAmount) * 100), 2)) : 0;
        $totalQuantityPercentage = $totalQuantity != 0 ? '(100%)' : '(0%)';
        $totalAmountPercentage   = $totalAmount != 0 ? ' (100%)' : ' (0%)';

        if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $SheerScienceAllAffiliate) {
            $summary['Total Coupon']   = "{$totalCoupons} ({$couponOrdersPercentage}%)";
            $summary['Total Phone']    = "{$totalPhones} ({$phoneOrdersPercentage}%)";
            $summary['Total Quantity'] = "{$totalQuantity} {$totalQuantityPercentage}";
            $summary['Total Fee']      = round($totalFee, 2);
        } else {
            $summary['Total Coupon']       = "{$totalCoupons} ({$couponOrdersPercentage}%)";
            $summary['Total Phone']        = "{$totalPhones} ({$phoneOrdersPercentage}%)";
            $summary['Total Quantity']     = "{$totalQuantity} {$totalQuantityPercentage}";
            $summary['Total Sales Amount'] = round($totalAmount, 2) . $totalAmountPercentage;
            $summary['Total Fee']          = round($totalFee, 2) . " ({$totalFeePercentage}%)";
            $summary['Net Amount']         = round($netAmount, 2) . " ({$netAmountPercentage}%)";
        }

        return $summary;
    }

    protected function customerCampaignSeparatedSummary($salesData, $summaryCampaigns, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $SheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $SheerScienceAllAffiliate = false;
        }

        foreach ($summaryCampaigns as $summaryCampaign) {
            $summary       = [];
            $totalQuantity = 0;
            $totalCoupons  = 0;
            $totalPhones   = 0;
            $totalOrders   = 0;
            $totalAmount   = 0;
            $netAmount     = 0;
            $totalFee      = 0;

            foreach ($salesData as $data) {
                if ($summaryCampaign == $data->{'Campaign Name'}) {
                    if (!empty($data->{'Coupon Code'})) {
                        $totalCoupons += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                    }

                    if (!empty($data->{'Dialed'}) || !empty($data->{'Dialed (800#)'})) {
                        $totalPhones += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                    }

                    $totalQuantity += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                    $totalAmount   += property_exists($data, 'Total Amount') ? $data->{'Total Amount'} : 0;
                    $netAmount     += property_exists($data, 'Net Amount') ? $data->{'Net Amount'} : 0;
                    $totalFee      += (float) $data->{'Total Fee'};
                    $totalOrders   += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                }
            }

            $couponOrdersPercentage  = $totalOrders != 0 ? (round((($totalCoupons / $totalOrders) * 100), 2)) : 0;
            $phoneOrdersPercentage   = $totalOrders != 0 ? (round((($totalPhones / $totalOrders) * 100), 2)) : 0;
            $totalFeePercentage      = $totalAmount != 0 ? (round((($totalFee / $totalAmount) * 100), 2)) : 0;
            $netAmountPercentage     = $totalAmount != 0 ? (round((($netAmount / $totalAmount) * 100), 2)) : 0;
            $totalQuantityPercentage = $totalQuantity != 0 ? '(100%)' : '(0%)';
            $totalAmountPercentage   = $totalAmount != 0 ? ' (100%)' : ' (0%)';

            if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $SheerScienceAllAffiliate) {
                $summary["{$summaryCampaign} Total Coupon"]   = "{$totalCoupons} ({$couponOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Phone"]    = "{$totalPhones} ({$phoneOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Quantity"] = "{$totalQuantity} {$totalQuantityPercentage}";
                $summary["{$summaryCampaign} Total Fee"]      = round($totalFee, 2);
                $summary[' ']                                 = ' ';
            } else {
                $summary["{$summaryCampaign} Total Coupon"]       = "{$totalCoupons} ({$couponOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Phone"]        = "{$totalPhones} ({$phoneOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Quantity"]     = "{$totalQuantity} {$totalQuantityPercentage}";
                $summary["{$summaryCampaign} Total Sales Amount"] = round($totalAmount, 2) . $totalAmountPercentage;
                $summary["{$summaryCampaign} Total Fee"]          = round($totalFee, 2) . " ({$totalFeePercentage}%)";
                $summary["{$summaryCampaign} Net Amount"]         = round($netAmount, 2) . " ({$netAmountPercentage}%)";
                $summary[' ']                                     = ' ';
            }

            $allSummary[] = $summary;
        }

        $campaignSeparatedSummary = array_merge(...$allSummary);

        return $campaignSeparatedSummary;
    }

    protected function affiliateSummary($salesData, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $SheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $SheerScienceAllAffiliate = false;
        }

        $summary       = [];
        $totalQuantity = 0;
        $totalCoupons  = 0;
        $totalPhones   = 0;
        $totalOrders   = 0;
        $totalAmount   = 0;
        $affiliateFee  = 0;

        foreach ($salesData as $data) {
            if (!empty($data->{'Coupon Code'})) {
                $totalCoupons += (int) $data->{'Total Quantity'};
            }

            if (!empty($data->{'Dialed'}) || !empty($data->{'Dialed (800#)'})) {
                $totalPhones += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
            }

            $totalQuantity += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
            $totalAmount   += property_exists($data, 'Total Amount') ? $data->{'Total Amount'} : 0;
            $affiliateFee  += (float) $data->{'Affiliate Fee'};
            $totalOrders   += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
        }

        $couponOrdersPercentage  = $totalOrders != 0 ? (round((($totalCoupons / $totalOrders) * 100), 2)) : 0;
        $phoneOrdersPercentage   = $totalOrders != 0 ? (round((($totalPhones / $totalOrders) * 100), 2)) : 0;
        $affiliateFeePercentage  = $totalAmount != 0 ? (round((($affiliateFee / $totalAmount) * 100), 2)) : 0;
        $totalQuantityPercentage = $totalQuantity != 0 ? '(100%)' : '(0%)';
        $totalAmountPercentage   = $totalAmount != 0 ? ' (100%)' : ' (0%)';

        if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $SheerScienceAllAffiliate) {
            $summary["Total Coupon"]   = "{$totalCoupons} ({$couponOrdersPercentage}%)";
            $summary["Total Phone"]    = "{$totalPhones} ({$phoneOrdersPercentage}%)";
            $summary["Total Quantity"] = "{$totalQuantity} {$totalQuantityPercentage}";
            $summary["Affiliate Fee"]  = round($affiliateFee, 2);
        } else {
            $summary["Total Coupon"]       = "{$totalCoupons} ({$couponOrdersPercentage}%)";
            $summary["Total Phone"]        = "{$totalPhones} ({$phoneOrdersPercentage}%)";
            $summary["Total Quantity"]     = "{$totalQuantity} {$totalQuantityPercentage}";
            $summary["Total Sales Amount"] = round($totalAmount, 2) . $totalAmountPercentage;
            $summary["Affiliate Fee"]      = round($affiliateFee, 2) . " ({$affiliateFeePercentage}%)";
        }

        return $summary;
    }

    protected function affiliateCampaignSeparatedSummary($salesData, $summaryCampaigns, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $SheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $SheerScienceAllAffiliate = false;
        }

        foreach ($summaryCampaigns as $summaryCampaign) {
            $summary       = [];
            $totalQuantity = 0;
            $totalCoupons  = 0;
            $totalPhones   = 0;
            $totalOrders   = 0;
            $totalAmount   = 0;
            $affiliateFee  = 0;

            foreach ($salesData as $data) {
                if ($summaryCampaign == $data->{'Campaign Name'}) {
                    if (!empty($data->{'Coupon Code'})) {
                        $totalCoupons += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                    }

                    if (!empty($data->{'Dialed'}) || !empty($data->{'Dialed (800#)'})) {
                        $totalPhones += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                    }

                    $totalQuantity += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                    $totalAmount   += property_exists($data, 'Total Amount') ? $data->{'Total Amount'} : 0;
                    $affiliateFee  += (float) $data->{'Affiliate Fee'};
                    $totalOrders   += (int) property_exists($data, 'Total Quantity') ? $data->{'Total Quantity'} : $data->{'Quantity'};
                }
            }

            $couponOrdersPercentage  = $totalOrders != 0 ? (round((($totalCoupons / $totalOrders) * 100), 2)) : 0;
            $phoneOrdersPercentage   = $totalOrders != 0 ? (round((($totalPhones / $totalOrders) * 100), 2)) : 0;
            $affiliateFeePercentage  = $totalAmount != 0 ? (round((($affiliateFee / $totalAmount) * 100), 2)) : 0;
            $totalQuantityPercentage = $totalQuantity != 0 ? '(100%)' : '(0%)';
            $totalAmountPercentage   = $totalAmount != 0 ? ' (100%)' : ' (0%)';

            if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $SheerScienceAllAffiliate) {
                $summary["{$summaryCampaign} Total Coupon"]   = "{$totalCoupons} ({$couponOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Phone"]    = "{$totalPhones} ({$phoneOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Quantity"] = "{$totalQuantity} {$totalQuantityPercentage}";
                $summary["{$summaryCampaign} Affiliate Fee"]  = round($affiliateFee, 2);
                $summary[' ']                                 = ' ';
            } else {
                $summary["{$summaryCampaign} Total Coupon"]       = "{$totalCoupons} ({$couponOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Phone"]        = "{$totalPhones} ({$phoneOrdersPercentage}%)";
                $summary["{$summaryCampaign} Total Quantity"]     = "{$totalQuantity} {$totalQuantityPercentage}";
                $summary["{$summaryCampaign} Total Sales Amount"] = round($totalAmount, 2) . $totalAmountPercentage;
                $summary["{$summaryCampaign} Affiliate Fee"]      = round($affiliateFee, 2) . " ({$affiliateFeePercentage}%)";
                $summary[' ']                                     = ' ';
            }

            $allSummary[] = $summary;
        }

        $campaignSeparatedSummary = array_merge(...$allSummary);

        return $campaignSeparatedSummary;
    }

    protected function marketTargetSummary($salesData)
    {
        $summary = ['Total Quantity' => 0, 'Total Revenue' => 0];

        $salesData->each(function ($item) use (&$summary) {
            $summary['Total Quantity'] += $item->{'Total Quantity'};
            $summary['Total Revenue']  += $item->{'Total Revenue'};
        });

        return $summary;
    }

    protected function summarySummary($salesData, $type, $affiliate, $selectedCampaigns, $selectedCustomers)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $sheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $sheerScienceAllAffiliate = false;
        }

        $totalCouponsSales = 0;
        $totalCoupons      = 0;
        $totalPhonesSales  = 0;
        $totalPhones       = 0;
        $totalFee          = 0;
        $affiliateFee      = 0;
        $netAmount         = 0;

        foreach ($salesData as $data) {
            if (!empty($data->{'Coupon Code'})) {
                $totalCouponsSales += (float) (property_exists($data, 'Total Amount') ? $data->{'Total Amount'} : 0);
                $totalCoupons      += (int) $data->{'Total Quantity'};
            }

            if (!empty($data->{'Dialed'})) {
                $totalPhonesSales += (float) (property_exists($data, 'Total Amount') ? $data->{'Total Amount'} : 0);
                $totalPhones      += (int) $data->{'Total Quantity'};
            }

            if ($type === 'customer') {
                $totalFee  += (float) $data->{'Total Fee'};
                $netAmount += (float) (property_exists($data, 'Net Amount') ? $data->{'Net Amount'} : 0);
            } else {
                $affiliateFee += (float) $data->{'Affiliate Fee'};
            }
        }

        if (in_array($checkAffiliate, $this->amIds) || in_array($checkAffiliate, $this->gdmIds) || $powerswabsAllAffiliate || $sheerScienceAllAffiliate) {
            $summary = [
                'Total Coupon Sales Count'   => $totalCoupons,
                'Total Phone Sales Count'    => $totalPhones,
                'Total Coupon & Phone'       => ($totalCoupons + $totalPhones),
            ];

            if ($type === 'customer') {
                $summary['Total Fee']  = $totalFee;
            } else {
                $summary['Affiliate Fee'] = $affiliateFee;
            }
        } else {
            $summary = [
                'Total Coupon Sales'         => $totalCouponsSales,
                'Total Coupon Sales Count'   => $totalCoupons,
                'Total Phone Sales'          => $totalPhonesSales,
                'Total Phone Sales Count'    => $totalPhones,
                'Total Coupon & Phone'       => ($totalCoupons + $totalPhones),
                'Total Coupon & Phone Sales' => ($totalCouponsSales + $totalPhonesSales),
            ];

            if ($type === 'customer') {
                $summary['Total Fee']  = $totalFee;
                $summary['Net Amount'] = $netAmount;
            } else {
                $summary['Affiliate Fee'] = $affiliateFee;
            }
        }

        return $summary;
    }

    protected function cashBuySummary($salesData, $type)
    {
        $summary          = [];
        $cashBuy          = 0;
        $ConsumerEXPFee   = 0;
        $phoneOrders      = 0;
        $phonePayouts     = 0;
        $ecommerceOrders  = 0;
        $ecommercePayouts = 0;

        foreach ($salesData as $data) {
            if (isset($data->{'Coupon Code'}) && $data->{'Coupon Code'} != "") {
                $ecommerceOrders  += (int) $data->Quantity;
                $ecommercePayouts += $data->Payout * ((int) $data->Quantity);
            } elseif (isset($data->Dialed) && $data->Dialed != "") {
                $phoneOrders  += (int) $data->Quantity;
                $phonePayouts += $data->Payout * ((int) $data->Quantity);
            }

            $cashBuy += $data->Payout * ((int) $data->Quantity);

            if ($type === 'customer') {
                $ConsumerEXPFee += $data->{'ConsumerEXP Fee'} * ((int) $data->Quantity);
            }
        }

        $phonePayoutsPercentage     = round($cashBuy) != 0 ? (round((($phonePayouts) / round($cashBuy) * 100), 2)) : 0;
        $ecommercePayoutsPercentage = round($cashBuy) != 0 ? (round((($ecommercePayouts) / round($cashBuy) * 100), 2)) : 0;
        $cashBuyPercentage          = round($cashBuy) != 0 ? '(100%)' : '(0%)';

        $summary['Phone Orders']       = (string) $phoneOrders;
        $summary['Phone Payouts']      = round($phonePayouts) . " ({$phonePayoutsPercentage}%)";
        $summary['E-commerce Orders']  = (string) $ecommerceOrders;
        $summary['E-commerce Payouts'] = round($ecommercePayouts) . " ({$ecommercePayoutsPercentage}%)";
        $summary['Cash Buy']           = round($cashBuy) . " {$cashBuyPercentage}";

        if ($type === 'customer') {
            $summary['ConsumerEXP Fee'] = (string) round($ConsumerEXPFee);
        }

        return $summary;
    }

    protected function cashBuyMarketTargetSummary($salesData)
    {
        $summary       = [];
        $totalQuantity = 0;
        $totalAmount   = 0;

        foreach ($salesData as $data) {
            $totalQuantity += $data['Total Quantity'];
            $totalAmount   += $data['Total Revenue'];
        }

        $summary['Total Quantity'] = $totalQuantity;
        $summary['Total Amount']   = round($totalAmount);

        return $summary;
    }

    protected function cashBuySummarySummary($salesData)
    {
        $summary          = [];
        $phoneOrders      = 0;
        $phonePayouts     = 0;
        $ecommerceOrders  = 0;
        $ecommercePayouts = 0;
        $totalOrders      = 0;
        $totalPayouts     = 0;

        foreach ($salesData as $data) {
            if (isset($data->{'Coupon Code'}) && $data->{'Coupon Code'} != "") {
                $ecommerceOrders  += (int) $data->{'Total Quantity'};
                $ecommercePayouts += $data->{'Total Amount'};
            } elseif (isset($data->Dialed) && $data->Dialed != "") {
                $phoneOrders  += (int) $data->{'Total Quantity'};
                $phonePayouts += $data->{'Total Amount'};
            }

            $totalOrders  += $data->{'Total Quantity'};
            $totalPayouts += $data->{'Total Amount'};
        }

        $phoneOrdersPercentage         = $totalOrders != 0 ? (round((($phoneOrders / $totalOrders) * 100), 2)) : 0;
        $ecommerceOrdersPercentage     = $totalOrders != 0 ? (round((($ecommerceOrders / $totalOrders) * 100), 2)) : 0;

        $summary['Phone Orders']       = $phoneOrders . ' (' . $phoneOrdersPercentage . '%)';
        $summary['Phone Payouts']      = (string) $phonePayouts;
        $summary['E-commerce Orders']  = $ecommerceOrders . ' (' . $ecommerceOrdersPercentage . '%)';
        $summary['E-commerce Payouts'] = (string) $ecommercePayouts;
        $summary['Total Orders']       = (string) $totalOrders;
        $summary['Total Payouts']      = (string) $totalPayouts;

        return $summary;
    }

    protected function getEmailCriteria($requestData, $salesData)
    {
        // $reportOn         = str_replace(['payPerOrder', 'cashBuy'], ['Pay Per Order', 'Cash Buy'], $requestData->reportFor);
        $reportOn         = ucwords(str_replace('marketTarget', 'Market Target', $requestData->reportOn)) . ' Report';
        $reportOrderType  = $requestData->orderType === 'both' ? 'E-Commerce & Phone' : ($requestData->orderType === '1' ? 'E-Commerce' : 'Phone');
        $reportOn        .= " <br> {$reportOrderType} {$reportOn}";

        if (!empty($requestData->customer_id)) {
            $getCustomers = Customer::Tobase()->whereIn('id', $requestData->customer_id)->pluck('customer_name');
            $customers    = implode(', ', $getCustomers->toArray());

            if (!empty($customers) && $requestData->type === "customer") {
                $reportOn .= " <br> Customers ({$customers})";
            }
        }

        if (!empty($requestData->affiliate_id)) {
            $getAffiliates = Affiliate::toBase()->whereIn('id', $requestData->affiliate_id)->pluck('affiliate_name');
            $affiliates    = implode(', ', $getAffiliates->toArray());

            if (!empty($affiliates) && $requestData->type === "affiliate") {
                $reportOn .= " <br> Affiliate ({$affiliates})";
            }
        }

        if (!empty($requestData->campaign_id)) {
            $getCampaigns = EcommerceCampaign::toBase()->whereIn('id', $requestData->campaign_id)->pluck('campaign_name');
            $campaigns    = implode(', ', $getCampaigns->toArray());

            if (!empty($campaigns)) {
                $reportOn .= " <br> Campaigns ({$campaigns})";
            }
        }

        if (!empty($requestData->year)) {
            $selectedYears  = implode(', ', $requestData->year);
            $yearNaming     = (count($requestData->year) > 1) ? 'Years' : 'Year';
            $reportOn      .= " <br> {$yearNaming} ({$selectedYears})";
        } elseif (!empty($requestData->start_date) && !empty($requestData->end_date)) {
            $startingDate  = date_format(date_create($requestData->start_date), 'd-M-Y');
            $endingDate    = date_format(date_create($requestData->end_date), 'd-M-Y');
            $reportOn     .= " <br> Date Range ({$startingDate} To {$endingDate})";
        }

        if ($requestData->reportFor === "payPerOrder" && ($requestData->reportOn === "detail" || $requestData->reportOn === "summary")) {
            if ($requestData->type === "customer") {
                $totalFee = $salesData->sum(function ($item) {
                    return (float) $item->{'Total Fee'};
                });
                $reportOn .= '<br> <p style="font-size: 18px;"><strong>Total Fee: $' . $totalFee . '</strong></p>';
            } else {
                $affiliateFee = $salesData->sum(function ($item) {
                    return (float) $item->{'Affiliate Fee'};
                });
                $reportOn .= '<br> <p style="font-size: 18px;"><strong>Net Payout: $' . $affiliateFee . '</strong></p>';
            }
        }

        return $reportOn;
    }

    protected function getHeader($requestData)
    {
        $header       = [];
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $preparedTime = Carbon::now('America/New_York')->format('F d, Y h:iA');

        if ($requestData->orderType === 'both') {
            $type = 'E-commerce & Phone';
        } elseif ($requestData->orderType === '1') {
            $type = 'E-commerce';
        } elseif ($requestData->orderType === '2') {
            $type = 'Phone';
        } else {
            $type = '';
        }

        if (!empty($requestData->campaign_id)) {
            $getCampaigns = EcommerceCampaign::toBase()->whereIn('id', $requestData->campaign_id)->pluck('campaign_name');
            $campaigns    = implode(', ', $getCampaigns->toArray());
        } else {
            $campaigns = '';
        }

        if (!empty($requestData->customer_id)) {
            $getCustomers = Customer::Tobase()->whereIn('id', $requestData->customer_id)->pluck('customer_name');
            $customers    = implode(', ', $getCustomers->toArray());
        } else {
            $customers = '';
        }

        if (!empty($requestData->affiliate_id)) {
            $getAffiliates = Affiliate::toBase()->whereIn('id', $requestData->affiliate_id)->pluck('affiliate_name');
            $affiliates    = implode(', ', $getAffiliates->toArray());
        } else {
            $affiliates = '';
        }

        if (!empty($requestData->year)) {
            $selectedYears = implode(', ', $requestData->year);
            $dateRange     = $selectedYears;
        } elseif (isset($requestData->start_date) && isset($requestData->end_date)) {
            $startingDate = date_format(date_create($requestData->start_date), 'd-M-Y');
            $endingDate   = date_format(date_create($requestData->end_date), 'd-M-Y');
            $dateRange    = "{$startingDate} - {$endingDate}";
        } else {
            $dateRange = '';
        }

        if ($requestData->reportOn === 'detail') {
            $header = [
                'Detail Report' => '',
                'Criteria'      => ''
            ];

            if (!empty($customers)) {
                $header['Criteria'] = $customers;
            }

            if (!empty($campaigns)) {
                if (!empty($header['Criteria'])) {
                    $header['Criteria'] .= ', ';
                }
                $header['Criteria'] .= $campaigns;
            }

            if (!empty($affiliates)) {
                if (!empty($header['Criteria'])) {
                    $header['Criteria'] .= ', ';
                }
                $header['Criteria'] .= $affiliates;
            }

            $header['Prepared by'] = $userFullName;
            $header['Prepared on'] = $preparedTime;
            $header['ConsumerEXP'] = 'www.consumerexp.com';
        }

        if ($requestData->reportOn === 'summary') {
            $header['Type']          = $type;
            $header['Affiliates']    = $affiliates;
            $header['Date Range']    = $dateRange;
            $header['Prepared by']   = $userFullName;
            $header['ConsumerEXP']   = 'www.consumerexp.com';
            $header['Prepared Time'] = $preparedTime;
        }

        if ($requestData->reportOn === 'marketTarget') {
            $header['Market Target Report'] = '';
            $header['Type']                 = $type;
            $header['Affiliates']           = $affiliates;
            $header['Date Range']           = $dateRange;
            $header['Campaign']             = $campaigns;
            $header['Prepared by']          = $userFullName;
            $header['ConsumerEXP']          = 'www.consumerexp.com';
            $header['Prepared Date']        = $preparedTime;
        }

        return $header;
    }

    protected function payPerOrderSummaryReportOrderBy($affiliate, $type, $selectedCampaigns, $selectedCustomers, $amGdmIds, $queryData)
    {
        if (!empty($affiliate)) {
            $checkAffiliate = intval($affiliate[0]);
        } else {
            $checkAffiliate = '';
        }

        if (!empty($selectedCampaigns)) {
            $powerswabsAllAffiliate = (in_array($this->paId, $selectedCampaigns) || in_array($this->plexId, $selectedCampaigns));
        } else {
            $powerswabsAllAffiliate = false;
        }

        if (!empty($selectedCustomers)) {
            $sheerScienceAllAffiliate = in_array($this->ssId, $selectedCustomers);
        } else {
            $sheerScienceAllAffiliate = false;
        }

        return $queryData->sortByDesc(function ($item) use ($checkAffiliate, $amGdmIds, $type, $powerswabsAllAffiliate, $sheerScienceAllAffiliate) {
            if ((in_array($checkAffiliate, $amGdmIds) || $powerswabsAllAffiliate || $sheerScienceAllAffiliate) && $type === 'customer') {
                return (float) $item->{'Total Fee'};
            } elseif ((in_array($checkAffiliate, $amGdmIds) || $powerswabsAllAffiliate || $sheerScienceAllAffiliate) && $type === 'affiliate') {
                return (float) $item->{'Affiliate Fee'};
            } else {
                return (float) $item->{'Total Amount'};
            }
        });
    }

    // ----- Home Shopping report (sales + returns aware) -----

    public function homeShoppingReport()
    {
        $campaigns = EcommerceCampaign::active()->select('id', 'campaign_name', 'customer_id')->get();
        $customers = Customer::active()->get();
        $affiliates = Affiliate::active()->orderBy('affiliate_name')->select('id', 'affiliate_name', 'market')->get();
        $states = ZipcodeByTelevisionMarket::select('state')->orderBy('state')->distinct()->get();
        $markets = ZipcodeByTelevisionMarket::select('market')->orderBy('market')->distinct()->get();
        $stations = EcommerceSale::select('station')->whereNotNull('station')->distinct()->orderBy('station')->pluck('station');
        $allCorporations = app(\App\Services\CorporationService::class)->all();
        $columnsData = \App\Models\TableDetails::all()->pluck('column_details');
        $savedReports = SavedEcommerceReport::where('user_id', auth()->id())
            ->where('report_for', 'home_shopping')
            ->latest()
            ->get();

        return Inertia::render('GenerateReport/HomeShoppingReport', compact(
            'campaigns',
            'customers',
            'affiliates',
            'states',
            'markets',
            'stations',
            'allCorporations',
            'columnsData',
            'savedReports'
        ));
    }

    public function saveHomeShoppingReport(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'filters'               => ['required', 'array'],
            'recurrence_frequency'  => ['nullable', 'in:weekly,monthly'],
            'recipients'            => ['nullable', 'array'],
            'recipients.*'          => ['email'],
        ]);

        SavedEcommerceReport::create([
            'user_id'              => auth()->id(),
            'report_for'           => 'home_shopping',
            'name'                 => $data['name'],
            'filters'              => $data['filters'],
            'is_active'            => true,
            'recurrence_frequency' => $data['recurrence_frequency'] ?? null,
            'recipients'           => $data['recipients'] ?? null,
        ]);

        return response()->json(['message' => 'Saved.'], 201);
    }

    public function updateHomeShoppingReport(Request $request, $id)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'filters'               => ['required', 'array'],
            'recurrence_frequency'  => ['nullable', 'in:weekly,monthly'],
            'recipients'            => ['nullable', 'array'],
            'recipients.*'          => ['email'],
        ]);

        $report = SavedEcommerceReport::where('id', $id)
            ->where('user_id', auth()->id())
            ->where('report_for', 'home_shopping')
            ->firstOrFail();

        $report->update([
            'name'                 => $data['name'],
            'filters'              => $data['filters'],
            'recurrence_frequency' => $data['recurrence_frequency'] ?? null,
            'recipients'           => $data['recipients'] ?? null,
        ]);

        return response()->json(['message' => 'Updated.'], 200);
    }

    public function deleteHomeShoppingReport($id)
    {
        $report = SavedEcommerceReport::where('id', $id)
            ->where('user_id', auth()->id())
            ->where('report_for', 'home_shopping')
            ->firstOrFail();
        $report->delete();
        return response()->json(['message' => 'Deleted.'], 200);
    }

    public function homeShoppingReportGenerate(Request $request)
    {
        $reportOn = $request->input('reportOn', 'detail');
        $base = $this->homeShoppingBaseQuery($request);

        switch ($reportOn) {
            case 'householdSummary':
                $data = (clone $base)
                    ->select([
                        DB::raw('DATE_FORMAT(MAX(ecommerce_sales.created_at), "%Y-%m-%d") AS create_date'),
                        'ecommerce_sales.customer_id',
                        'ecommerce_sales.campaign_id',
                        'ecommerce_sales.ani',
                        'ecommerce_sales.shipping_zip',
                        'ecommerce_sales.shipping_city',
                        'ecommerce_sales.shipping_state',
                        DB::raw('COALESCE(NULLIF(ecommerce_sales.dialed, ""), NULLIF(ecommerce_sales.coupon_code, ""), NULLIF(ecommerce_sales.tracking_url, "")) AS channel_id'),
                        DB::raw('SUM(CASE WHEN ecommerce_sales.record_kind = "SALE" THEN ecommerce_sales.total ELSE 0 END) AS gross_sales'),
                        DB::raw('SUM(CASE WHEN ecommerce_sales.record_kind = "RETURN" THEN ecommerce_sales.total ELSE 0 END) AS returns_amount'),
                        DB::raw('SUM(ecommerce_sales.total) AS net_sales'),
                        DB::raw('SUM(ecommerce_sales.vendor_fee) AS net_vendor_fee'),
                        DB::raw('SUM(ecommerce_sales.consumerexp_fee) AS net_consumerexp_fee'),
                        DB::raw('SUM(ecommerce_sales.total - COALESCE(ecommerce_sales.vendor_fee, 0) - COALESCE(ecommerce_sales.consumerexp_fee, 0)) AS net_revenue_to_vendor'),
                    ])
                    ->groupBy(
                        'ecommerce_sales.customer_id',
                        'ecommerce_sales.campaign_id',
                        'ecommerce_sales.ani',
                        'ecommerce_sales.shipping_zip',
                        'ecommerce_sales.shipping_city',
                        'ecommerce_sales.shipping_state',
                        'channel_id'
                    )
                    ->orderByDesc('net_sales')
                    ->get();
                break;

            case 'vendorReport':
                // Pro-rata station split: when N affiliates linked to the same (customer, campaign)
                // share a DMA, a single sale attributed via shared 800#/promo gets divided N ways.
                // station_count is computed in a derived subquery joined on (customer, campaign, market).
                $stationCountSub = DB::raw('(
                    SELECT ea.customer_id, ea.campaign_id, a.market,
                           COUNT(DISTINCT ea.affiliate_id) AS station_count
                    FROM ecommerce_affiliates ea
                    JOIN affiliates a ON a.id = ea.affiliate_id
                    WHERE a.market IS NOT NULL AND a.market <> ""
                    GROUP BY ea.customer_id, ea.campaign_id, a.market
                ) AS sc');

                $data = (clone $base)
                    ->leftJoin('zipcode_by_television_markets as zbtm', 'zbtm.zip_code', '=', 'ecommerce_sales.shipping_zip')
                    ->leftJoin($stationCountSub, function ($join) {
                        $join->on('sc.customer_id', '=', 'ecommerce_sales.customer_id')
                            ->on('sc.campaign_id', '=', 'ecommerce_sales.campaign_id')
                            ->on('sc.market', '=', 'zbtm.market');
                    })
                    ->select([
                        DB::raw('DATE_FORMAT(MAX(ecommerce_sales.created_at), "%Y-%m-%d") AS create_date'),
                        DB::raw('COALESCE(zbtm.market, "Unknown Market") AS market'),
                        DB::raw('COALESCE(ecommerce_sales.station, "Unknown Station") AS station'),
                        DB::raw('COALESCE(sc.station_count, 1) AS station_count'),
                        DB::raw('ROUND(SUM(CASE WHEN ecommerce_sales.record_kind = "SALE" THEN ecommerce_sales.total ELSE 0 END / COALESCE(sc.station_count, 1)), 2) AS gross_sales'),
                        DB::raw('ROUND(SUM(CASE WHEN ecommerce_sales.record_kind = "RETURN" THEN ecommerce_sales.total ELSE 0 END / COALESCE(sc.station_count, 1)), 2) AS returns_amount'),
                        DB::raw('ROUND(SUM(ecommerce_sales.total / COALESCE(sc.station_count, 1)), 2) AS net_sales'),
                        DB::raw('ROUND(SUM(ecommerce_sales.vendor_fee / COALESCE(sc.station_count, 1)), 2) AS net_vendor_fee'),
                        DB::raw('ROUND(SUM(ecommerce_sales.consumerexp_fee / COALESCE(sc.station_count, 1)), 2) AS net_consumerexp_fee'),
                        DB::raw('COUNT(CASE WHEN ecommerce_sales.record_kind = "SALE" THEN 1 END) AS sale_count'),
                        DB::raw('COUNT(CASE WHEN ecommerce_sales.record_kind = "RETURN" THEN 1 END) AS return_count'),
                    ])
                    ->groupBy('market', 'station', 'station_count')
                    ->orderByDesc('net_sales')
                    ->get();
                break;

            case 'detail':
            default:
                $data = (clone $base)
                    ->leftJoin('zipcode_by_television_markets as zbtm', 'zbtm.zip_code', '=', 'ecommerce_sales.shipping_zip')
                    ->select([
                        DB::raw('DATE_FORMAT(ecommerce_sales.created_at, "%Y-%m-%d %H:%i") AS `Create Date`'),
                        'ecommerce_sales.dialed AS Dialed',
                        'ecommerce_sales.order_type AS Order Type',
                        'ecommerce_sales.coupon_code AS Promo Code',
                        'ecommerce_sales.tracking_url AS Tracking URL',
                        DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%Y-%m-%d") AS `Order Date`'),
                        DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%H:%i") AS `Order Time`'),
                        'ecommerce_sales.order_no AS Order Number',
                        'ecommerce_sales.ani AS Telephone',
                        'ecommerce_sales.shipping_city AS Ship City',
                        'ecommerce_sales.shipping_state AS Ship State',
                        'ecommerce_sales.shipping_zip AS Zip',
                        'ecommerce_sales.order_description AS Order Description',
                        'ecommerce_sales.total AS Total Sales',
                        DB::raw('ROUND(COALESCE(ecommerce_sales.vendor_fee, 0) + COALESCE(ecommerce_sales.consumerexp_fee, 0), 4) AS `Commission`'),
                        DB::raw('ROUND(ecommerce_sales.total - COALESCE(ecommerce_sales.vendor_fee, 0) - COALESCE(ecommerce_sales.consumerexp_fee, 0), 4) AS `Net Sales`'),
                        'ecommerce_sales.record_kind AS Record Kind',
                        'ecommerce_sales.station AS Station',
                        DB::raw('zbtm.market AS Market'),
                    ])
                    ->orderBy('ecommerce_sales.order_at')
                    ->get();
                break;
        }

        return response()->json([
            'data'    => $data,
            'summary' => $this->homeShoppingSummary($base),
        ], 200);
    }

    protected function homeShoppingBaseQuery(Request $request)
    {
        $q = DB::table('ecommerce_sales');

        if (!empty($request->customer_id)) {
            $q->whereIn('ecommerce_sales.customer_id', (array) $request->customer_id);
        }
        if (!empty($request->campaign_id)) {
            $q->whereIn('ecommerce_sales.campaign_id', (array) $request->campaign_id);
        }
        if (!empty($request->dialed)) {
            $q->whereIn('ecommerce_sales.dialed', (array) $request->dialed);
        }
        if (!empty($request->couponCodes)) {
            $q->whereIn('ecommerce_sales.coupon_code', (array) $request->couponCodes);
        }
        if (!empty($request->stations)) {
            $q->whereIn('ecommerce_sales.station', (array) $request->stations);
        }
        if (!empty($request->record_kind)) {
            $q->where('ecommerce_sales.record_kind', $request->record_kind);
        }
        // Optional Order Type filter — lets this report double as the "Percentage of Sales"
        // view filtered to Phone / E-commerce / Block, etc.
        if (!empty($request->order_type)) {
            $q->whereIn('ecommerce_sales.order_type', (array) $request->order_type);
        }
        if (!empty($request->start_date) && !empty($request->end_date)) {
            $q->whereDate('ecommerce_sales.order_at', '>=', $request->start_date)
                ->whereDate('ecommerce_sales.order_at', '<=', $request->end_date);
        }

        // State / market filters resolve via ZIP -> DMA lookup on the ship_zip column.
        if (!empty($request->states) || !empty($request->markets)) {
            $q->whereExists(function ($sub) use ($request) {
                $sub->from('zipcode_by_television_markets')
                    ->whereColumn('zipcode_by_television_markets.zip_code', 'ecommerce_sales.shipping_zip');
                if (!empty($request->states)) {
                    $sub->whereIn('zipcode_by_television_markets.state', (array) $request->states);
                }
                if (!empty($request->markets)) {
                    $sub->whereIn('zipcode_by_television_markets.market', (array) $request->markets);
                }
            });
        }

        // Corporation filter — scope to sales whose affiliate (via ecommerce_affiliates)
        // is linked to the chosen corporation. When apply_to_all_affiliates is on we resolve
        // every affiliate; otherwise we intersect with the optional affiliate_ids picks.
        if (!empty($request->corporation_type) && !empty($request->corporation_id)) {
            $service = app(\App\Services\CorporationService::class);
            $affiliateIds = $service->resolveSelection([
                'corporation_type'        => $request->corporation_type,
                'corporation_id'          => (int) $request->corporation_id,
                'apply_to_all_affiliates' => $request->boolean('apply_to_all_affiliates', true),
                'affiliate_ids'           => (array) $request->input('affiliate_ids', []),
            ])->all();

            if (!empty($affiliateIds)) {
                $q->whereExists(function ($sub) use ($affiliateIds) {
                    $sub->from('ecommerce_affiliates')
                        ->whereColumn('ecommerce_affiliates.campaign_id', 'ecommerce_sales.campaign_id')
                        ->whereIn('ecommerce_affiliates.affiliate_id', $affiliateIds)
                        ->where(function ($w) {
                            $w->whereColumn('ecommerce_affiliates.coupon_code', 'ecommerce_sales.coupon_code')
                                ->orWhereColumn('ecommerce_affiliates.dialed', 'ecommerce_sales.dialed');
                        });
                });
            } else {
                // Corporation has no linked affiliates → no rows.
                $q->whereRaw('1 = 0');
            }
        }

        return $q;
    }

    protected function homeShoppingSummary($base): array
    {
        $row = (clone $base)
            ->selectRaw('
                SUM(CASE WHEN record_kind = "SALE" THEN total ELSE 0 END) AS gross_sales,
                SUM(CASE WHEN record_kind = "RETURN" THEN total ELSE 0 END) AS returns_amount,
                SUM(total) AS net_sales,
                SUM(vendor_fee) AS vendor_fee,
                SUM(consumerexp_fee) AS consumerexp_fee
            ')
            ->first();

        $vendorFee = (float) ($row->vendor_fee ?? 0);
        $cexpFee   = (float) ($row->consumerexp_fee ?? 0);
        $netSales  = (float) ($row->net_sales ?? 0);

        return [
            'Gross Sales'            => round((float) ($row->gross_sales ?? 0), 2),
            'Returns'                => round((float) ($row->returns_amount ?? 0), 2),
            'Net Sales'              => round($netSales, 2),
            'Vendor Fee'             => round($vendorFee, 2),
            'ConsumerEXP Fee'        => round($cexpFee, 2),
            'Total Commission'       => round($vendorFee + $cexpFee, 2),
            'Net Revenue to Vendor'  => round($netSales - $vendorFee - $cexpFee, 2),
        ];
    }
}
