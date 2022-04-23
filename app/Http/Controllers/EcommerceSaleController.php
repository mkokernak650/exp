<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Imports\EcommerceSaleImport;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\EcommerceSale;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class EcommerceSaleController extends Controller
{
    public function index()
    {
        $sales = EcommerceSale::select('*', DB::raw("DATE_FORMAT(order_at, '%d %M,%Y %H:%i:%s') as formatted_order_at"))->get();

        return Inertia::render('Ecommerce/SalesIndex', compact('sales'));
    }

    public function update(Request $request, EcommerceSale $ecommerceSale)
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string', 'max:255'],
            'coupon_code' => ['required', 'string', 'max:255'],
            'shipping_city' => ['nullable', 'string', 'max:255'],
            'shipping_state' => ['nullable', 'string', 'max:255'],
            'shipping_zip' => ['nullable', 'string', 'max:255'],
            'billing_zip' => ['nullable', 'string', 'max:255'],
            'quantity' => ['nullable', 'string', 'max:255'],
            'subtotal' => ['nullable', 'string', 'max:255'],
            'shipping_cost' => ['nullable', 'string', 'max:255'],
            'total' => ['nullable', 'string', 'max:255'],
        ]);

        if ($ecommerceSale->update($validated)) {
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
        return response()->json(['msg' => 'Try Again!'], 422);
    }

    public function import()
    {
        return Inertia::render('Ecommerce/SalesImport');
    }

    public function importStore(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file'],
            'fieldMap' => ['required', 'string'],
        ]);

        $filterFields = [];
        foreach (json_decode($request->input('fieldMap')) as $value) {
            if (!empty($value->applicationField) && !empty($value->reportField)) {
                $filterFields[$value->applicationField] = Str::slug($value->reportField, '_');
            }
        }

        $salesData = EcommerceSale::select('id', 'order_no', 'coupon_code', 'shipping_zip', 'total')->get();

        Excel::import(new EcommerceSaleImport($filterFields, $salesData), $request->file('file'));

        return response()->json(['msg' => 'Imported Successfully.'], 201);
    }

    public function deleteSelected(Request $request)
    {
        EcommerceSale::whereIn('id', $request->selectedRowIds)->delete();
        return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 204]);
    }

    public function ecommerceSalesReport()
    {
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
        $affiliates = Affiliate::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $couponCodes = EcommerceAffiliate::active()->get('coupon_code');
        $states = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();

        return Inertia::render('GenerateReport/SalesReport', compact('campaigns', 'customers', 'affiliates', 'broadCastMonths', 'broadCastWeeks', 'couponCodes', 'states', 'markets'));
    }

    public function ecommerceSalesReportGenerate(Request $request)
    {
        $zipCodes = $this->getZipCodesByStateOrMarkets($request->input('states'), $request->input('markets'));
        $salesData = $this->querySalesReport($request, $zipCodes);

        if ($salesData->count() < 1) {
            return response()->json([], 204);
        }

        return response()->json([
            'data' => $salesData,
            'summary' => $this->getReportSummary($request->input('type'), $request->input('detailed'), $salesData)
        ], 200);
    }

    protected function getZipCodesByStateOrMarkets($states, $markets)
    {
        if (!empty($states) || !empty($markets)) {
            return ZipcodeByTelevisionMarket::when(!empty($states), function ($q) use ($states) {
                $q->whereIn('state', $states);
            })->when(!empty($markets), function ($q) use ($markets) {
                $q->whereIn('market', $markets);
            })->get('zip_code')->pluck('zip_code');
        }
        return [];
    }

    protected function querySalesReport($request, $zipCodes)
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

        return DB::table('ecommerce_sales')
            ->join('ecommerce_affiliates', 'ecommerce_affiliates.coupon_code', '=', 'ecommerce_sales.coupon_code')
            // ->when($isDetailed, function ($q) {
            //     $q->join('ecommerce_campaigns', 'ecommerce_campaigns.id', '=', 'ecommerce_affiliates.campaign_id');
            // })
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->when(!empty($campaignIds), function ($q) use ($campaignIds) {
                $q->whereIn('ecommerce_affiliates.campaign_id', $campaignIds);
            })
            ->when(!empty($customerIds), function ($q) use ($customerIds) {
                $q->whereIn('ecommerce_affiliates.customer_id', $customerIds);
            })
            ->when(!empty($affiliateIds), function ($q) use ($affiliateIds) {
                $q->whereIn('ecommerce_affiliates.affiliate_id', $affiliateIds);
            })
            ->when(!empty($zipCodes), function ($q) use ($zipCodes) {
                $q->whereIn('shipping_zip', $zipCodes);
            })
            ->when(!empty($couponCodes), function ($q) use ($couponCodes) {
                $q->whereIn('ecommerce_sales.coupon_code', $couponCodes);
            })
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
            ->when(empty($year) && !empty($startDate) && !empty($endDate), function ($q) use ($startDate, $endDate) {
                $q->whereDate('ecommerce_sales.order_at', '>=', $startDate)
                    ->whereDate('ecommerce_sales.order_at', '<=', $endDate);
            })
            ->when(!$isDetailed, function ($q) {
                $q->groupBy(
                    'ecommerce_sales.coupon_code',
                    // DB::raw('YEAR(ecommerce_sales.order_at)'),
                    // DB::raw('MONTH(ecommerce_sales.order_at)'),
                );
            })
            ->select($isDetailed ? $this->selectColumnByTypeDetailed($type) : $this->selectColumnByType($type))
            ->orderBy('ecommerce_sales.coupon_code')
            ->orderBy('ecommerce_sales.order_at')
            ->get();
    }

    protected function selectColumnByTypeDetailed($type)
    {
        if ($type === 'customer') {
            $fee = 'revenue';
            $text = 'Total Fee';
        } else {
            $fee = 'affiliate_fee';
            $text = 'Affiliate Fee';
        }

        $selectRows = [
            DB::raw('DATE_FORMAT(ecommerce_sales.order_at, "%d-%b-%Y %H:%i") AS `Date`'),
            'affiliates.affiliate_name AS Affiliate Name',
            'ecommerce_sales.coupon_code AS Coupon Code',
            // 'ecommerce_campaigns.campaign_name AS Campaign',
            'ecommerce_sales.shipping_state AS State',
            'ecommerce_sales.shipping_city AS City',
            'ecommerce_sales.shipping_zip AS Zip Code',
            'ecommerce_sales.quantity AS Total Quantity',
            'ecommerce_sales.total AS Total Amount',
            DB::raw('ROUND(ecommerce_affiliates.' . $fee . ' * ecommerce_sales.quantity) AS `' . $text . '`'),
        ];

        if ($type === 'customer') {
            return array_merge($selectRows, [
                DB::raw('ROUND(ecommerce_sales.total - (ecommerce_affiliates.' . $fee . ' * ecommerce_sales.quantity)) AS `Net Amount`'),
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

    protected function getReportSummary($type, $isDetailed, $salesData)
    {
        $totalOrder = $salesData->count();
        $summary = ['Total Order' => 0, 'Total Quantity' => 0, 'Total Amount' => 0, 'Total Fee' => 0, 'Affiliate Fee' => 0, 'Net Amount' => 0];
        $salesData->each(function ($item) use (&$summary, $type, $totalOrder, $isDetailed) {
            $summary['Total Amount'] += $item->{'Total Amount'};
            $summary['Total Quantity'] += $item->{'Total Quantity'};

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
        });

        return $summary;
    }
}
