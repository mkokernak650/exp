<?php

namespace App\Http\Controllers;

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
    public function ecommerceReport()
    {
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $states = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();

        return Inertia::render('GenerateReport/EcommerceReport', compact('campaigns', 'customers', 'broadCastMonths', 'broadCastWeeks', 'states', 'markets'));
    }

    public function selectionWiseData(Request $request)
    {
        try {
            $selectionWiseData = EcommerceAffiliate::with('affiliate:id,affiliate_name,email')
                ->when($request->campaign_ids, fn ($q) => $q->whereIn('campaign_id', $request->campaign_ids))
                ->when($request->customer_ids, fn ($q) => $q->whereIn('customer_id', $request->customer_ids))
                ->get(['coupon_code', 'dialed', 'affiliate_id']);

            $couponCodes = array_filter($selectionWiseData->pluck('coupon_code')->unique()->toArray());
            $dialedPhones = array_filter($selectionWiseData->pluck('dialed')->unique()->toArray());
            $affiliates = $selectionWiseData->map(fn ($item) => [$item?->affiliate?->id, $item?->affiliate?->affiliate_name, $item?->affiliate?->email])->unique()->toArray();

            return response()->json(['success' => true, 'affiliates' => $affiliates, 'couponCodes' => $couponCodes, 'dialedPhones' => $dialedPhones]);
        } catch (\Throwable $th) {
            return response()->json(['success' => false], 422);
        }
    }

    public function ecommerceReportGenerate(Request $request)
    {
        // dd($this->queryReport($request));
        $salesData = $this->queryReport($request);
        $summaryCampaigns = [];
        if (isset($request->campaign_id)) {
            $summaryCampaigns = EcommerceCampaign::whereIn('id', $request->campaign_id)->select('campaign_name')->pluck('campaign_name')->toArray();
        }

        if ($request->reportFor === 'marketTarget') {
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
        $summary = $this->getReportSummary($request->reportFor, $request->type, $salesData);
        if (isset($request->campaign_id)) {
            $summary = array_reverse($summary);
            $summary['Campaign Name'] = implode(', ', $summaryCampaigns);
            $summary = array_reverse($summary);
        }
        if (isset($request->start_date) && isset($request->end_date)) {
            $summary['From'] = $request->start_date;
            $summary['To'] = $request->end_date;
        }

        if ($request->report_type === 'email-report') {
            $request->emails = $request->type === 'affiliate' ? $request->affiliatesEmail : $request->emails;
            if (empty($request->emails)) {
                return response()->json(['success' => false, 'message' => 'No email found.'], 422);
            }

            $summary = ['Summary' => ''] + $summary;
            $sendMailCtrl = new SendMailController();
            $sendMailCtrl->sendMail($salesData, $summary, [], $request->file_name, $request->emails);

            return response()->json(['message' => 'Email sent successfully.'], 200);
        }
        // dd($salesData);

        return response()->json([
            'data'    => $salesData,
            'summary' => $summary,
        ], 200);
    }

    protected function queryReport($request)
    {
        $couponCodes = $request->couponCodes;
        $dialed = $request->dialed;
        $year = $request->year;
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $type = $request->type;
        $states = $request->states;
        $markets = $request->markets;
        $reportFor = $request->reportFor;
        $orderType = $request->orderType;

        $queryData = DB::table('ecommerce_sales')
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
            ->when($reportFor === 'sales', fn ($q) => $q->join('ecommerce_campaigns', 'ecommerce_campaigns.id', '=', 'ecommerce_sales.campaign_id'))
            ->when($reportFor === 'sales', fn ($q) => $q->join('customers', 'customers.id', '=', 'ecommerce_sales.customer_id'))
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->leftJoin('zipcode_by_television_markets', 'zipcode_by_television_markets.zip_code', '=', 'ecommerce_sales.shipping_zip')
            ->leftJoin('t_v_households', 't_v_households.market', '=', 'zipcode_by_television_markets.market')
            ->when(!empty($request->campaign_id), fn ($q) => $q->whereIn('ecommerce_affiliates.campaign_id', $request->campaign_id))
            ->when(!empty($request->customer_id), fn ($q) => $q->whereIn('ecommerce_affiliates.customer_id', $request->customer_id))
            ->when(!empty($request->affiliate_id) && !in_array('allAffiliates', $request->affiliate_id), fn ($q) => $q->whereIn('ecommerce_affiliates.affiliate_id', $request->affiliate_id))
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
                $reportFor === 'sales',
                fn ($q) => $q
                    ->groupBy('ecommerce_sales.id')
                    ->select($this->selectColumnSalesReport($type, $orderType))
                    ->orderBy('ecommerce_sales.order_at')
            )
            ->when(
                $reportFor === 'cash_buy' && ($orderType == EcommerceSale::ORDER_TYPE['e-commerce'] || $orderType == 'both'),
                fn ($q) => $q
                    ->select($this->selectColumnSalesCashBuyReport($orderType, $reportFor))
                    ->groupBy('ecommerce_sales.coupon_code')
            )
            ->when(
                $reportFor === 'cash_buy' && $orderType == EcommerceSale::ORDER_TYPE['phone'],
                fn ($q) => $q
                    ->select($this->selectColumnSalesCashBuyReport($orderType, $reportFor))
                    ->groupBy('ecommerce_sales.dialed')
            )
            ->when(
                $reportFor === 'marketTarget',
                fn ($q) => $q
                    ->whereNotNull('zipcode_by_television_markets.market')
                    ->groupBy('zipcode_by_television_markets.market')
                    ->select($this->selectColumnMarketTargetReport())
                    ->orderByDesc('Total Quantity')
            )
            ->when(
                $reportFor === 'summary',
                fn ($q) => $q
                    ->groupBy('ecommerce_sales.coupon_code', 'ecommerce_sales.dialed')
                    ->select($this->selectColumnSummaryReport())
                    ->orderBy('ecommerce_sales.dialed')
                    ->orderBy('ecommerce_sales.coupon_code')
            )
            ->get();

        return $queryData;
    }

    protected function selectColumnSummaryReport()
    {
        return [
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_sales.coupon_code AS Coupon Code',
            'ecommerce_sales.dialed AS Dialed',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Amount`'),
            DB::raw('ROUND(ecommerce_affiliates.revenue * SUM(ecommerce_sales.quantity), 2) AS `Total Fee`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total) - (ecommerce_affiliates.revenue * SUM(ecommerce_sales.quantity)), 2) AS `Net Amount`'),
        ];
    }

    protected function selectColumnMarketTargetReport()
    {
        return [
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Households',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(t_v_households.tv_households / SUM(ecommerce_sales.quantity), 2) AS `Homes Per Sales`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Revenue`'),
        ];
    }

    // add new column for detailed sales report depending on order type
    protected function addColumnToArray($array, $orderType, $offset)
    {
        if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['phone']) {
            $dialedColumn = ['ecommerce_sales.dialed AS Dialed'];
            array_splice($array, $offset, 0, $dialedColumn);
        }
        if ($orderType === 'both' || $orderType == EcommerceSale::ORDER_TYPE['e-commerce']) {
            $couponCodeColumn = ['ecommerce_sales.coupon_code AS Coupon Code'];
            array_splice($array, $offset, 0, $couponCodeColumn);
        }
        return $array;
    }

    protected function selectColumnSalesReport($type, $orderType)
    {
        if ($type === 'customer') {
            $column = 'revenue';
            $alias = 'Total Fee';
        } else {
            $column = 'affiliate_fee';
            $alias = 'Affiliate Fee';
        }

        $selectRows = [
            DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%d-%b-%Y %H:%i") AS `Date`'),
            'ecommerce_campaigns.campaign_name AS Campaign Name',
            'customers.customer_name AS Customer Name',
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_sales.shipping_state AS State',
            'ecommerce_sales.shipping_city AS City',
            'ecommerce_sales.shipping_zip AS Zip Code',
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Market Households',
            'ecommerce_sales.quantity AS Total Quantity',
            'ecommerce_sales.total AS Total Amount',
            DB::raw('ROUND(ecommerce_affiliates.' . $column . ' * ecommerce_sales.quantity, 2) AS `' . $alias . '`'),
        ];

        $selectRows = $this->addColumnToArray($selectRows, $orderType, 2);

        if ($type === 'customer') {
            return array_merge($selectRows, [
                DB::raw('ROUND(ecommerce_sales.total - (ecommerce_affiliates.revenue * ecommerce_sales.quantity), 2) AS `Net Amount`'),
            ]);
        }
        // dd($selectRows);
        return $selectRows;
    }

    protected function selectColumnSalesCashBuyReport($orderType)
    {
        $selectRows = [
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_affiliates.cash_buy AS Cash Buy',
            DB::raw('count(ecommerce_sales.id) AS `Total Order`'),
            DB::raw('ROUND(ecommerce_affiliates.cash_buy /count(ecommerce_sales.id),2) AS `Average Order Cost`'),
        ];

        return $this->addColumnToArray($selectRows, $orderType, 1);
    }

    protected function getReportSummary($reportFor, $type, $salesData)
    {
        if ($reportFor === 'sales') {
            if ($type === 'customer') {
                return $this->customerSummary($salesData);
            }
            return $this->affiliateSummary($salesData);
        } elseif ($reportFor === 'marketTarget') {
            return $this->marketTargetSummary($salesData);
        } elseif ($reportFor === 'summary') {
            return $this->summarySummary($salesData);
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
        $summary = ['Total Coupon Sales' => 0, 'Total Coupon Sales Count' => 0, 'Total Phone Sales' => 0, 'Total Phone Sales Count' => 0, 'Net Amount' => 0];
        $salesData->each(function ($item) use (&$summary) {
            if (!empty($item->{'Coupon Code'})) {
                $summary['Total Coupon Sales'] += $item->{'Total Amount'};
                $summary['Total Coupon Sales Count'] += $item->{'Total Quantity'};
            }
            if (!empty($item->{'Dialed'})) {
                $summary['Total Phone Sales'] += $item->{'Total Amount'};
                $summary['Total Phone Sales Count'] += $item->{'Total Quantity'};
            }
            $summary['Net Amount'] += $item->{'Net Amount'};
        });
        return $summary;
    }
}
