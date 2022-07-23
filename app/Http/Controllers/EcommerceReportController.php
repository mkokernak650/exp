<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Affiliate;
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
        $affiliates = Affiliate::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $eComAffiliateData = EcommerceAffiliate::active()->get(['coupon_code', 'dialed']);
        $couponCodes = array_filter($eComAffiliateData->pluck('coupon_code')->unique()->toArray());
        $dialedPhones = array_filter($eComAffiliateData->pluck('dialed')->unique()->toArray());
        $states = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();

        return Inertia::render('GenerateReport/EcommerceReport', compact('campaigns', 'customers', 'affiliates', 'broadCastMonths', 'broadCastWeeks', 'couponCodes', 'dialedPhones', 'states', 'markets'));
    }

    public function ecommerceReportGenerate(Request $request)
    {
        $salesData = $this->queryReport($request);

        if ($salesData->count() < 1) {
            return response()->json([], 204);
        }

        if ($request->reportFor === 'marketTarget') {
            $salesData->transform(function ($item) {
                $item->{'TV Households'} = $item->{'TV Households'} ? number_format($item->{'TV Households'}, 0, '.', ',') : null;
                $item->{'Homes Per Sales'} = $item->{'Homes Per Sales'} ? number_format($item->{'Homes Per Sales'}, 0, '.', ',') : null;
                return $item;
            });
        }

        $columns = ['Market', 'TV Households', 'Total Quantity', 'Homes Per Sales', 'Total Revenue'];
        $summary = $this->getReportSummary($request->reportFor, $request->type, $request->detailed, $salesData);
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Summary'] = '   ';
            $newSummary['Total Quantity'] = $summary['Total Quantity'];
            $newSummary['Total Amount'] = $summary['Total Amount'];
            $sendMailCtrl = new SendMailController();
            $sendMailCtrl->sendMail($salesData, $newSummary, [], $columns, $request->file_name, $request->emails);
            return;
        }

        return response()->json([
            'data'    => $salesData,
            'summary' => $summary
        ], 200);
    }

    protected function queryReport($request)
    {
        $campaignIds = $request->campaign_id;
        $customerIds = $request->customer_id;
        $affiliateIds = $request->affiliate_id;
        $couponCodes = $request->couponCodes;
        $dialed = $request->dialed;
        $year = $request->year;
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $type = $request->type;
        $isDetailed = $request->detailed;
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
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->leftJoin('zipcode_by_television_markets', 'zipcode_by_television_markets.zip_code', '=', 'ecommerce_sales.shipping_zip')
            ->leftJoin('t_v_households', 't_v_households.market', '=', 'zipcode_by_television_markets.market')
            ->when(!empty($campaignIds), fn ($q) => $q->whereIn('ecommerce_affiliates.campaign_id', $campaignIds))
            ->when(!empty($customerIds), fn ($q) => $q->whereIn('ecommerce_affiliates.customer_id', $customerIds))
            ->when(!empty($affiliateIds), fn ($q) => $q->whereIn('ecommerce_affiliates.affiliate_id', $affiliateIds))
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
                    ->when(!$isDetailed, fn ($q) => $q->groupBy('ecommerce_sales.coupon_code'))
                    ->select($isDetailed ? $this->selectColumnDetailedSalesReport($type, $orderType) : $this->selectColumnSalesReport($type, $orderType))
                    ->orderBy('ecommerce_sales.coupon_code')
                    ->orderBy('ecommerce_sales.order_at')
            )
            ->when(
                $reportFor === 'marketTarget',
                fn ($q) => $q
                    ->whereNotNull('zipcode_by_television_markets.market')
                    ->groupBy('zipcode_by_television_markets.market')
                    ->select($this->selectColumnMarketTargetReport())
                    ->orderBy('zipcode_by_television_markets.market')
            )
            ->groupBy('ecommerce_sales.id')
            ->get();

        if ($reportFor === 'marketTarget') {
            return $this->mergeDuplicateMarketData($queryData);
        }

        return $queryData;
    }

    public function mergeDuplicateMarketData($queryData)
    {
        $finalData = (array)[];
        foreach ($queryData as $value) {
            $indx = $this->findIndx($finalData, $value);
            if ($indx === false) {
                $object = (object)[
                    'Market'         => $value->Market,
                    'TV Households'  => $value->{'TV Households'},
                    'Total Quantity' => $value->{'Total Quantity'},
                    'Homes Per Sales'=> $value->{'Homes Per Sales'},
                    'Total Revenue'  => $value->{'Total Revenue'},
                ];
                array_push($finalData, $object);
            } else {
                $finalData[$indx]->{'Total Revenue'} += $value->{'Total Revenue'};
                $finalData[$indx]->{'Total Quantity'} += $value->{'Total Quantity'};
                $finalData[$indx]->{'TV Households'} += $value->{'TV Households'};
            }
            $finalData[$indx]->{'Homes Per Sales'} = $finalData[$indx]->{'TV Households'} / $finalData[$indx]->{'Total Quantity'};
        }
        return collect($finalData);
    }

    public function findIndx($array, $data)
    {
        $exist = '';
        if (count($array)) {
            foreach ($array as $key=>$value) {
                if ($value->Market === $data->Market) {
                    $exist = $key;
                    return $exist;
                } else {
                    $exist = false;
                }
            }
        } else {
            $exist = false;
        }
        return $exist;
    }

    protected function selectColumnMarketTargetReport()
    {
        return [
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Households',
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(t_v_households.tv_households / SUM(ecommerce_sales.quantity)) AS `Homes Per Sales`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total)) AS `Total Revenue`'),
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

    protected function selectColumnDetailedSalesReport($type, $orderType)
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
            'ecommerce_sales.shipping_state AS State',
            'ecommerce_sales.shipping_city AS City',
            'ecommerce_sales.shipping_zip AS Zip Code',
            'zipcode_by_television_markets.market AS Market',
            't_v_households.tv_households AS TV Market Households',
            'ecommerce_sales.quantity AS Total Quantity',
            'ecommerce_sales.total AS Total Amount',
            DB::raw('ROUND(ecommerce_affiliates.' . $column . ' * ecommerce_sales.quantity) AS `' . $alias . '`'),
        ];

        $selectRows = $this->addColumnToArray($selectRows, $orderType, 2);

        if ($type === 'customer') {
            return array_merge($selectRows, [
                DB::raw('ROUND(ecommerce_sales.total - (ecommerce_affiliates.revenue * ecommerce_sales.quantity)) AS `Net Amount`'),
            ]);
        }
        return $selectRows;
    }

    protected function selectColumnSalesReport($type, $orderType)
    {
        $selectRows = [
            'affiliates.affiliate_name AS Affiliate',
            DB::raw('COUNT(ecommerce_sales.id) AS `No. of Orders`'),
            DB::raw('SUM(ecommerce_sales.quantity) AS `Total Quantity`'),
            DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Amount`'),
        ];

        $selectRows = $this->addColumnToArray($selectRows, $orderType, 1);

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
