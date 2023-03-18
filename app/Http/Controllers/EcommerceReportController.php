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
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EcommerceReportController extends Controller
{
    private static $acesMarketingId;

    public function __construct()
    {
        $aId = Affiliate::where('affiliate_name', 'Aces Marketing')->get('id');
        self::$acesMarketingId = $aId[0]->id;
    }

    public function ecommerceReport()
    {
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $states = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $acesMarketingId = self::$acesMarketingId;

        return Inertia::render('GenerateReport/EcommerceReport', compact('campaigns', 'customers', 'broadCastMonths', 'broadCastWeeks', 'states', 'markets', 'acesMarketingId'));
    }

    public function selectionWiseData(Request $request)
    {
        try {
            $selectionWiseData = EcommerceAffiliate::with('affiliate:id,affiliate_name,email,market')
                ->when($request->campaign_ids, fn ($q) => $q->whereIn('campaign_id', $request->campaign_ids))
                ->when($request->customer_ids, fn ($q) => $q->whereIn('customer_id', $request->customer_ids))
                ->get(['coupon_code', 'dialed', 'affiliate_id']);

            $couponCodes = array_filter($selectionWiseData->pluck('coupon_code')->unique()->toArray());
            $dialedPhones = array_filter($selectionWiseData->pluck('dialed')->unique()->toArray());
            $affiliates = $selectionWiseData->map(fn ($item) => [
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
        $salesData = $this->queryReport($request);

        if (in_array(self::$acesMarketingId, $request->affiliate_id)) {
            $aMarketingData = [];
            foreach ($salesData as $sale) {
                $sale->{'Vendor Code'} = 'new field';
                $sale->{'Product Code'} = 'new field';
                $sale->{'Caller Country'} = 'USA';
                $sale->{'Call Length'} = 'new field';
                $sale->{'R1 Calls'} = '0';
                array_push(
                    $aMarketingData,
                    $sale
                );
            }
            $salesData = collect($aMarketingData);
        }

        $summaryCampaigns = [];

        if (isset($request->campaign_id)) {
            $summaryCampaigns = EcommerceCampaign::whereIn('id', $request->campaign_id)->select('campaign_name')->pluck('campaign_name')->toArray();
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

        if (!in_array(self::$acesMarketingId, $request->affiliate_id)) {
            $summary = $this->getReportSummary($request->reportFor, $request->reportOn, $request->type, $salesData, $summaryCampaigns);

            if (!empty($request->year)) {
                $selectedYears        = implode(', ', $request->year);
                $yearNaming           = (count($request->year) > 1) ? 'Years' : 'Year';
                $summary[$yearNaming] = $selectedYears;
            } elseif (isset($request->start_date) && isset($request->end_date)) {
                $summary['From'] = date_format(date_create($request->start_date), 'd-M-Y');
                $summary['To']   = date_format(date_create($request->end_date), 'd-M-Y');
            }
        }

        if ($request->report_type === 'email-report') {
            $emails = $request->type === 'affiliate' ? $request->affiliatesEmail : $request->emails;

            if (empty($emails)) {
                return response()->json(['success' => false, 'message' => 'No email found.'], 422);
            }

            if ($request->reportFor === 'cashBuy' && $request->reportOn != 'summary') {
                $salesData = collect($salesData);
            }

            $emailCriteria = $this->getEmailCriteria($request);
            $summary       = ['Summary' => ''] + $summary;
            $sendMailCtrl  = new SendMailController();

            $sendMailCtrl->sendMail($salesData, $summary, [], $request->file_name, $emails, $emailCriteria);

            return response()->json(['message' => 'Email sent successfully.'], 200);
        }

        if (in_array(self::$acesMarketingId, $request->affiliate_id)) {
            $summary = [];
        }

        return response()->json([
            'data'    => $salesData,
            'summary' => $summary,
        ], 200);
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
        $queryData   = DB::table('ecommerce_sales')
            ->when(
                $orderType,
                fn ($q) => $q->join('ecommerce_affiliates', function ($join) use ($orderType) {
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
            ->when(($reportFor === 'payPerOrder' && $reportGenOn === 'detail'), fn ($q) => $q->join('ecommerce_campaigns', 'ecommerce_campaigns.id', '=', 'ecommerce_sales.campaign_id'))
            ->when(($reportFor === 'payPerOrder' && $reportGenOn === 'detail'), fn ($q) => $q->join('customers', 'customers.id', '=', 'ecommerce_sales.customer_id'))
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->leftJoin('zipcode_by_television_markets', 'zipcode_by_television_markets.zip_code', '=', 'ecommerce_sales.shipping_zip')
            ->leftJoin('t_v_households', 't_v_households.market', '=', 'zipcode_by_television_markets.market')
            ->when(!empty($request->campaign_id), fn ($q) => $q->whereIn('ecommerce_affiliates.campaign_id', $request->campaign_id))
            ->when(!empty($request->customer_id), fn ($q) => $q->whereIn('ecommerce_affiliates.customer_id', $request->customer_id))
            ->when(!empty($affiliate) && !in_array('allAffiliates', $affiliate), fn ($q) => $q->whereIn('ecommerce_affiliates.affiliate_id', $affiliate))
            ->when(!empty($states) && !in_array('allStates', $states), fn ($q) => $q->whereIn('zipcode_by_television_markets.state', $states))
            ->when(!empty($markets) && !in_array('allMarkets', $markets), fn ($q) => $q->whereIn('zipcode_by_television_markets.market', $markets))
            ->when(!empty($couponCodes) && empty($dialed), fn ($q) => $q->whereIn('ecommerce_sales.coupon_code', $couponCodes))
            ->when(!empty($dialed) && empty($couponCodes), fn ($q) => $q->whereIn('ecommerce_sales.dialed', $dialed))
            ->when(
                !empty($dialed) && !empty($couponCodes),
                fn ($q) => $q->whereIn('ecommerce_sales.coupon_code', $couponCodes)->whereIn('ecommerce_sales.dialed', $dialed, 'or')
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
                fn ($q) => $q
                    ->whereDate('ecommerce_sales.order_at', '>=', $startDate)
                    ->whereDate('ecommerce_sales.order_at', '<=', $endDate)
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'detail'),
                fn ($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->groupBy('ecommerce_sales.id')
                    ->select($this->payPerOrderDetailReportColumns($type, $orderType, $affiliate))
                    ->orderBy('ecommerce_sales.order_at')
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'marketTarget'),
                fn ($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->whereNotNull('zipcode_by_television_markets.market')
                    ->groupBy('zipcode_by_television_markets.market')
                    ->select($this->payPerOrderMarketTargetReportColumns())
                    ->orderBy('Homes Per Sales')
            )
            ->when(
                ($reportFor === 'payPerOrder' && $reportGenOn === 'summary'),
                fn ($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 1)
                    ->groupBy('ecommerce_sales.coupon_code', 'ecommerce_sales.dialed')
                    ->select($this->payPerOrderSummaryReportColumns())
                    ->orderByDesc('Total Amount')
            )
            ->when(
                ($reportFor === 'cashBuy' && $reportGenOn != 'summary'),
                fn ($q) => $this->queryForCashBuy($q, $orderType, $affiliate, $type, $reportGenOn)
            )
            ->when(
                ($reportFor === 'cashBuy' && $reportGenOn === 'summary'),
                fn ($q) => $q
                    ->where('ecommerce_affiliates.affiliate_fee_type', '=', 2)
                    ->groupBy('ecommerce_sales.coupon_code', 'ecommerce_sales.dialed')
                    ->select($this->cashBuySummaryReportColumns())
            )
            ->get();

        if ($reportFor === 'cashBuy' && $reportGenOn != 'summary') {
            if (!empty($markets) && !in_array('allMarkets', $markets)) {
                $queryData = $queryData->whereIn(($reportGenOn === 'detail' ? 'Customer Market' : 'Market'), $markets);
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
                $marketTargetQuery = $queryData->groupBy('Market')->map(function ($items) {
                    $totalQuantity = 0;
                    $totalRevenue  = 0;

                    foreach ($items as $item) {
                        $data = [
                            'Market'         => $item->Market,
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
            ->when($orderType === 'both', fn ($q) => $q->groupBy('coupon_code'))
            ->when($orderType === '1', fn ($q) => $q->groupBy('ecommerce_sales.coupon_code'))
            ->when($orderType === '2', fn ($q) => $q->groupBy('ecommerce_sales.dialed'));

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
            ->when($reportGenOn === 'detail', fn ($q) => $q->select($this->selectColumnSalesCashBuyReport($orderType, $affiliate, $type)))
            ->when($reportGenOn === 'marketTarget', fn ($q) => $q->select($this->cashBuyMarketTargetReportColumns()))
            ->mergeBindings($subQuery)
            ->groupBy('ecommerce_sales.id')
            ->when($reportGenOn === 'detail', fn ($q) => $q->orderBy('ecommerce_sales.order_at'));

        return $finalQuery;
    }

    protected function payPerOrderSummaryReportColumns()
    {
        return [
            'affiliates.affiliate_name AS Affiliate Name',
            'affiliates.market AS Affiliate Market',
            'ecommerce_sales.coupon_code AS Coupon Code',
            'ecommerce_sales.dialed AS Dialed',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Amount`'),
            DB::raw('ROUND(ecommerce_affiliates.revenue * SUM(ecommerce_sales.quantity), 2) AS `Total Fee`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total) - (ecommerce_affiliates.revenue * SUM(ecommerce_sales.quantity)), 2) AS `Net Amount`'),
        ];
    }

    protected function cashBuySummaryReportColumns()
    {
        return [
            'affiliates.affiliate_name AS Affiliate Name',
            'affiliates.market AS Affiliate Market',
            'ecommerce_sales.coupon_code AS Coupon Code',
            'ecommerce_sales.dialed AS Dialed',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            'ecommerce_affiliates.cash_buy AS Total Amount',
            'ecommerce_affiliates.consumerEXP_cash_buy_fee AS Total Fee',
            DB::raw('ecommerce_affiliates.cash_buy - ecommerce_affiliates.consumerEXP_cash_buy_fee AS "Net Amount"'),
        ];
    }

    protected function payPerOrderMarketTargetReportColumns()
    {
        return [
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Households',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(t_v_households.tv_households / SUM(ecommerce_sales.quantity), 2) AS `Homes Per Sales`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Revenue`'),
        ];
    }

    protected function cashBuyMarketTargetReportColumns()
    {
        return [
            'zipcode_by_television_markets.market AS Market',
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
    protected function addColumnToArray($array, $orderType, $offset, $affiliate)
    {
        if (in_array(self::$acesMarketingId, $affiliate)) {
            if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['phone']) {
                $dialedColumn = ['ecommerce_sales.dialed AS 800#', 'ecommerce_sales.coupon_code AS Station Code'];
                array_splice($array, $offset, 0, $dialedColumn);
            }
            if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['e-commerce']) {
                $couponCodeColumn = ['ecommerce_sales.coupon_code AS Station Code'];
                array_splice($array, $offset, 0, $couponCodeColumn);
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

    protected function payPerOrderDetailReportColumns($type, $orderType, $affiliate)
    {
        if ($type === 'customer') {
            $column = 'revenue';
            $alias = 'Total Fee';
        } else {
            $column = 'affiliate_fee';
            $alias = 'Affiliate Fee';
        }

        if (in_array(self::$acesMarketingId, $affiliate)) {
            $selectRows = [
                DB::raw(
                    'DATE_FORMAT(ecommerce_sales.order_at, "%Y/%m/%d") AS `Date of call`'
                ),
                DB::raw(
                    'DATE_FORMAT(ecommerce_sales.order_at, "%H:%i") AS `Time of call`'
                ),
                'affiliates.affiliate_name AS Affiliate Name',
                'ecommerce_sales.shipping_state AS Caller State',
                'ecommerce_sales.shipping_city AS Caller City',
                'ecommerce_sales.shipping_zip AS Caller Zip',
                'ecommerce_sales.inbound AS ANI',
                'ecommerce_sales.quantity AS R2 Orders',
            ];
        } else {
            $selectRows = [
                DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%d-%b-%Y %H:%i") AS `Date`'),
                'customers.customer_name AS Customer Name',
                'ecommerce_campaigns.campaign_name AS Campaign Name',
                'affiliates.affiliate_name AS Affiliate Name',
                'affiliates.market AS Affiliate Market',
                'ecommerce_sales.shipping_state AS State',
                'ecommerce_sales.shipping_city AS City',
                'ecommerce_sales.shipping_zip AS Zip Code',
                'zipcode_by_television_markets.market AS Customer Market',
                't_v_households.tv_households AS TV Market Households',
                'ecommerce_sales.quantity AS Total Quantity',
                'ecommerce_sales.total AS Total Amount',
                DB::raw('ROUND(ecommerce_affiliates.' . $column . ' * ecommerce_sales.quantity, 2) AS `' . $alias . '`'),
            ];
        }

        $selectRows = $this->addColumnToArray($selectRows, $orderType, 5, $affiliate);

        if ($type === 'customer' && !in_array(self::$acesMarketingId, $affiliate)) {
            return array_merge($selectRows, [
                DB::raw('ROUND(ecommerce_sales.total - (ecommerce_affiliates.revenue * ecommerce_sales.quantity), 2) AS `Net Amount`'),
            ]);
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
            'affiliates.market AS Affiliate Market',
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

        return $this->addColumnToArray($selectRows, $orderType, 5, $affiliate);
    }

    protected function getReportSummary($reportFor, $reportGenOn, $type, $salesData, $summaryCampaigns)
    {
        if ($reportFor === 'payPerOrder' && $reportGenOn === 'detail') {
            if ($type === 'customer') {
                if (!empty($summaryCampaigns) && !empty($salesData->toArray())) {
                    return $this->customerCampaignSeparatedSummary($salesData, $summaryCampaigns);
                } else {
                    return $this->customerSummary($salesData);
                }
            }
            if (!empty($summaryCampaigns) && !empty($salesData->toArray())) {
                return $this->affiliateCampaignSeparatedSummary($salesData, $summaryCampaigns);
            } else {
                return $this->affiliateSummary($salesData);
            }
        } elseif ($reportFor === 'payPerOrder' && $reportGenOn === 'marketTarget') {
            return $this->marketTargetSummary($salesData);
        } elseif ($reportFor === 'payPerOrder' && $reportGenOn === 'summary') {
            return $this->summarySummary($salesData);
        } elseif ($reportFor === 'cashBuy' && $reportGenOn === 'detail') {
            return $this->cashBuySummary($salesData, $type);
        } elseif ($reportFor === 'cashBuy' && $reportGenOn === 'marketTarget') {
            return $this->cashBuyMarketTargetSummary($salesData);
        } elseif ($reportFor === 'cashBuy' && $reportGenOn === 'summary') {
            return $this->cashBuySummarySummary($salesData);
        }
        return [];
    }

    protected function customerSummary($salesData)
    {
        $summary = ['Total Order' => $salesData->count(), 'Total Quantity' => 0, 'Total Amount' => 0, 'Total Fee' => 0, 'Net Amount' => 0];

        $salesData->each(function ($item) use (&$summary) {
            $summary['Total Quantity'] += $item->{'Total Quantity'};
            $summary['Total Amount'] += $item->{'Total Amount'};
            $summary['Net Amount'] += $item->{'Net Amount'};
            $summary['Total Fee'] += $item->{'Total Fee'};
        });
        return $summary;
    }

    protected function customerCampaignSeparatedSummary($salesData, $summaryCampaigns)
    {
        foreach ($summaryCampaigns as $summaryCampaign) {
            $summary = [];
            $i = 1;
            $totalQuantity = 0;
            $totalAmount = 0;
            $netAmount = 0;
            $totalFee = 0;

            foreach ($salesData as $data) {
                if ($summaryCampaign == $data->{'Campaign Name'}) {
                    $totalQuantity += $data->{'Total Quantity'};
                    $totalAmount += $data->{'Total Amount'};
                    $netAmount += $data->{'Net Amount'};
                    $totalFee += $data->{'Total Fee'};

                    $summary["{$summaryCampaign} Total Order"] = $i++;
                    $summary["{$summaryCampaign} Total Quantity"] = $totalQuantity;
                    $summary["{$summaryCampaign} Total Amount"] = $totalAmount;
                    $summary["{$summaryCampaign} Total Fee"] = $totalFee;
                    $summary["{$summaryCampaign} Net Amount"] = $netAmount;
                    $summary[''] = '';
                }
            }
            $allSummary[] = $summary;
        }
        $campaignSeparatedSummary = array_merge(...$allSummary);

        return $campaignSeparatedSummary;
    }

    protected function affiliateSummary($salesData)
    {
        $summary = ['Total Order' => $salesData->count(), 'Total Quantity' => 0, 'Total Amount' => 0, 'Affiliate Fee' => 0];
        $salesData->each(function ($item) use (&$summary) {
            $summary['Total Quantity'] += $item->{'Total Quantity'};
            $summary['Total Amount'] += $item->{'Total Amount'};
            $summary['Affiliate Fee'] += $item->{'Affiliate Fee'};
        });
        return $summary;
    }

    protected function affiliateCampaignSeparatedSummary($salesData, $summaryCampaigns)
    {
        foreach ($summaryCampaigns as $summaryCampaign) {
            $summary = [];
            $i = 1;
            $totalQuantity = 0;
            $totalAmount = 0;
            $AffiliateFee = 0;

            foreach ($salesData as $data) {
                if ($summaryCampaign == $data->{'Campaign Name'}) {
                    $totalQuantity += $data->{'Total Quantity'};
                    $totalAmount += $data->{'Total Amount'};
                    $AffiliateFee += $data->{'Affiliate Fee'};

                    $summary["{$summaryCampaign} Total Order"] = $i++;
                    $summary["{$summaryCampaign} Total Quantity"] = $totalQuantity;
                    $summary["{$summaryCampaign} Total Amount"] = $totalAmount;
                    $summary["{$summaryCampaign} Affiliate Fee"] = $AffiliateFee;
                    $summary[''] = '';
                }
            }
            $allSummary[] = $summary;
        }
        $campaignSeparatedSummary = array_merge(...$allSummary);

        return $campaignSeparatedSummary;
    }

    protected function marketTargetSummary($salesData)
    {
        $summary = ['Total Quantity' => 0, 'Total Amount' => 0];
        $salesData->each(function ($item) use (&$summary) {
            $summary['Total Quantity'] += $item->{'Total Quantity'};
            $summary['Total Amount'] += $item->{'Total Revenue'};
        });
        return $summary;
    }

    protected function summarySummary($salesData)
    {
        $summary = [
            'Total Coupon Sales' => 0, 'Total Coupon Sales Count' => 0, 'Total Phone Sales' => 0, 'Total Phone Sales Count' => 0,
            'Total Coupon & Phone' => 0, 'Total Coupon & Phone Sales' => 0, 'Total Fee' => 0, 'Net Amount' => 0
        ];

        $salesData->each(function ($item) use (&$summary) {
            if (!empty($item->{'Coupon Code'})) {
                $summary['Total Coupon Sales'] += $item->{'Total Amount'};
                $summary['Total Coupon Sales Count'] += $item->{'Total Quantity'};
            }
            if (!empty($item->{'Dialed'})) {
                $summary['Total Phone Sales'] += $item->{'Total Amount'};
                $summary['Total Phone Sales Count'] += $item->{'Total Quantity'};
            }
            $summary['Total Fee'] += $item->{'Total Fee'};
            $summary['Net Amount'] += $item->{'Net Amount'};
        });

        $summary['Total Coupon & Phone']       = $summary['Total Coupon Sales Count'] + $summary['Total Phone Sales Count'];
        $summary['Total Coupon & Phone Sales'] = $summary['Total Coupon Sales'] + $summary['Total Phone Sales'];

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

        $summary['Phone Orders']       = $phoneOrders;
        $summary['Phone Payouts']      = round($phonePayouts);
        $summary['E-commerce Orders']  = $ecommerceOrders;
        $summary['E-commerce Payouts'] = round($ecommercePayouts);
        $summary['Cash Buy']           = round($cashBuy);

        if ($type === 'customer') {
            $summary['ConsumerEXP Fee'] = round($ConsumerEXPFee);
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

        $summary['Phone Orders']       = $phoneOrders . ' (' . round((($phoneOrders / $totalOrders) * 100), 2) . '%)';
        $summary['Phone Payouts']      = (string) $phonePayouts;
        $summary['E-commerce Orders']  = $ecommerceOrders . ' (' . round((($ecommerceOrders / $totalOrders) * 100), 2) . '%)';
        $summary['E-commerce Payouts'] = (string) $ecommercePayouts;
        $summary['Total Orders']       = (string) $totalOrders;
        $summary['Total Payouts']      = (string) $totalPayouts;

        return $summary;
    }

    protected function getEmailCriteria($requestData)
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

        return $reportOn;
    }
}
