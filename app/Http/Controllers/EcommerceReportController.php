<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EcommerceReportController extends Controller
{
    public function ecommerceReport()
    {
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
        $affiliates = Affiliate::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $couponCodes = EcommerceAffiliate::active()->get('coupon_code');
        $states = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();

        return Inertia::render('GenerateReport/EcommerceReport', compact('campaigns', 'customers', 'affiliates', 'broadCastMonths', 'broadCastWeeks', 'couponCodes', 'states', 'markets'));
    }

    public function ecommerceReportGenerate(Request $request)
    {
        $salesData = $this->queryReport($request);

        if ($salesData->count() < 1) {
            return response()->json([], 204);
        }

        $salesData->transform(function ($item) {
            $item->{'TV Households'} = $item->{'TV Households'} ? number_format($item->{'TV Households'}, 0, '.', ',') : null;
            $item->{'Homes Per Sales'} = $item->{'Homes Per Sales'} ? number_format($item->{'Homes Per Sales'}, 0, '.', ',') : null;
            return $item;
        });

        return response()->json([
            'data'    => $salesData,
            'summary' => $this->getReportSummary($request->input('reportFor'), $request->input('type'), $request->input('detailed'), $salesData)
        ], 200);
    }

    protected function queryReport($request)
    {
        $campaignIds = $request->input('campaign_id');
        $customerIds = $request->input('customer_id');
        $affiliateIds = $request->input('affiliate_id');
        $couponCodes = $request->input('couponCodes');
        $year = $request->input('year');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $type = $request->input('type');
        $isDetailed = $request->input('detailed');
        $states = $request->input('states');
        $markets = $request->input('markets');
        $reportFor = $request->input('reportFor');

        return DB::table('ecommerce_sales')
            ->join('ecommerce_affiliates', 'ecommerce_affiliates.coupon_code', '=', 'ecommerce_sales.coupon_code')
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->leftJoin('zipcode_by_television_markets', 'zipcode_by_television_markets.zip_code', '=', 'ecommerce_sales.shipping_zip')
            ->leftJoin('t_v_households', 't_v_households.market', '=', 'zipcode_by_television_markets.market')
            ->when(!empty($campaignIds), fn ($q) => $q->whereIn('ecommerce_affiliates.campaign_id', $campaignIds))
            ->when(!empty($customerIds), fn ($q) => $q->whereIn('ecommerce_affiliates.customer_id', $customerIds))
            ->when(!empty($affiliateIds), fn ($q) => $q->whereIn('ecommerce_affiliates.affiliate_id', $affiliateIds))
            ->when(!empty($states) && !in_array('allStates', $states), fn ($q) => $q->whereIn('zipcode_by_television_markets.state', $states))
            ->when(!empty($markets) && !in_array('allMarkets', $markets), fn ($q) => $q->whereIn('zipcode_by_television_markets.market', $markets))
            ->when(!empty($couponCodes), fn ($q) => $q->whereIn('ecommerce_sales.coupon_code', $couponCodes))
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
            })->when(
                empty($year) && !empty($startDate) && !empty($endDate),
                fn ($q) => $q
                    ->whereDate('ecommerce_sales.order_at', '>=', $startDate)
                    ->whereDate('ecommerce_sales.order_at', '<=', $endDate)
            )->when(
                // For Sales Report
                $reportFor === 'sales',
                fn ($q) => $q
                    ->when(!$isDetailed, fn ($q) => $q->groupBy('ecommerce_sales.coupon_code'))
                    ->select($isDetailed ? $this->selectColumnByTypeDetailed($type) : $this->selectColumnByType($type))
                    ->orderBy('ecommerce_sales.coupon_code')
                    ->orderBy('ecommerce_sales.order_at')
            )->when(
                // For Market Target Report
                $reportFor === 'marketTarget',
                function ($q) {
                    $q->whereNotNull('zipcode_by_television_markets.market')
                        ->groupBy('zipcode_by_television_markets.market')
                        ->select($this->selectColumnMarketTarget())
                        ->orderBy('zipcode_by_television_markets.market');
                }
            )->get();
    }

    protected function selectColumnMarketTarget()
    {
        return [
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Households',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(t_v_households.tv_households / SUM(ecommerce_sales.quantity)) AS `Homes Per Sales`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total)) AS `Total Revenue`'),
        ];
    }

    protected function selectColumnByTypeDetailed($type)
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
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_sales.coupon_code AS Coupon Code',
            'ecommerce_sales.shipping_state AS State',
            'ecommerce_sales.shipping_city AS City',
            'ecommerce_sales.shipping_zip AS Zip Code',
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Market Households',
            'ecommerce_sales.quantity AS Total Quantity',
            'ecommerce_sales.total AS Total Amount',
            DB::raw('ROUND(ecommerce_affiliates.' . $column . ' * ecommerce_sales.quantity) AS `' . $alias . '`'),
        ];

        if ($type === 'customer') {
            return array_merge($selectRows, [
                DB::raw('ROUND(ecommerce_sales.total - (ecommerce_affiliates.revenue * ecommerce_sales.quantity)) AS `Net Amount`'),
            ]);
        }
        return $selectRows;
    }

    protected function selectColumnByType($type)
    {
        $selectRows = [
            'affiliates.affiliate_name AS Affiliate',
            'ecommerce_sales.coupon_code AS Coupon Code',
            DB::raw('COUNT(ecommerce_sales.id) AS `No. of Orders`'),
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Amount`'),
        ];

        if ($type === 'customer') {
            return array_merge($selectRows, [
                'ecommerce_affiliates.revenue AS Fee Per Order',
                DB::raw('ROUND(SUM(ecommerce_sales.quantity) * ecommerce_affiliates.revenue, 2) AS `Total Fee`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total) - (SUM(ecommerce_sales.quantity) * ecommerce_affiliates.revenue), 2) AS `Net Amount`'),
            ]);
        }

        return array_merge($selectRows, [
            'ecommerce_affiliates.affiliate_fee AS Affiliate Fee Per Order',
            DB::raw('ROUND(SUM(ecommerce_sales.quantity) * ecommerce_affiliates.affiliate_fee, 2) AS `Affiliate Fee`'),
        ]);
    }

    protected function getReportSummary($reportFor, $type, $isDetailed, $salesData)
    {
        $totalOrder = $salesData->count();
        $summary = ['Total Order' => 0, 'Total Quantity' => 0, 'Total Amount' => 0, 'Total Fee' => 0, 'Affiliate Fee' => 0, 'Net Amount' => 0];

        $salesData->each(function ($item) use (&$summary, $type, $totalOrder, $isDetailed, $reportFor) {
            $summary['Total Quantity'] += $item->{'Total Quantity'};

            if ($reportFor === 'sales') {
                $summary['Total Amount'] += $item->{'Total Amount'};
                if ($isDetailed) {
                    $summary['Total Order'] = $totalOrder;
                } else {
                    $summary['Total Order'] += $item->{'No. of Orders'};
                }

                if ($type === 'customer') {
                    $summary['Net Amount'] += $item->{'Net Amount'};
                    $summary['Total Fee'] += $item->{'Total Fee'};
                    unset($summary['Affiliate Fee']);
                } else {
                    $summary['Affiliate Fee'] += $item->{'Affiliate Fee'};
                    unset($summary['Total Fee'], $summary['Net Amount']);
                }
            } elseif ($reportFor === 'marketTarget') {
                $summary['Total Amount'] += $item->{'Total Revenue'};
                unset($summary['Total Fee'], $summary['Affiliate Fee'], $summary['Net Amount'], $summary['Total Order']);
            }
        });

        return $summary;
    }
}
