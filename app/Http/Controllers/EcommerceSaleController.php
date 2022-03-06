<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Imports\EcommerceSaleImport;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceSale;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class EcommerceSaleController extends Controller
{
    public function index()
    {
        $sales = EcommerceSale::all();
        return Inertia::render('Ecommerce/SalesIndex', compact('sales'));
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
        Excel::import(new EcommerceSaleImport($filterFields), $request->file('file'));

        return response()->json(['msg' => 'Imported Successfully.']);
    }

    public function deleteSelected(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  EcommerceSale::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    public function ecommerceSalesReport()
    {
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();
        return Inertia::render('GenerateReport/SalesReport', compact('affiliates', 'broadCastMonths', 'broadCastWeeks'));
    }

    public function ecommerceSalesReportGenerate(Request $request)
    {
        $affiliateIds = $request->input('affiliate_id');
        $couponCode = $request->input('coupon_code');
        $year = $request->input('year');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // $affiliateArray = [];
        // EcommerceAffiliate::select('id', 'coupon_code', 'percentage')->get()->each(function ($item) use (&$affiliateArray) {
        //     $affiliateArray[$item->coupon_code] = $item->percentage;
        // })->toArray();

        $salesData = DB::table('ecommerce_sales')
            ->join('ecommerce_affiliates', 'ecommerce_affiliates.coupon_code', '=', 'ecommerce_sales.coupon_code')
            ->join('affiliates', 'affiliates.id', '=', 'ecommerce_affiliates.affiliate_id')
            ->when(isset($affiliateIds) && is_array($affiliateIds), function ($q) use ($affiliateIds) {
                $q->whereIn('ecommerce_affiliates.affiliate_id', $affiliateIds);
            })
            ->when(!empty($couponCode), function ($q) use ($couponCode) {
                $q->where('ecommerce_sales.coupon_code', $couponCode);
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
            ->groupBy(
                'ecommerce_sales.coupon_code',
                // DB::raw('YEAR(ecommerce_sales.order_at)'),
                // DB::raw('MONTH(ecommerce_sales.order_at)'),
                // DB::raw('DAY(ecommerce_sales.order_at)'),
            )
            ->select(
                // DB::raw("DATE_FORMAT(ecommerce_sales.order_at, '%M, %Y') as `Order Date`"),
                'affiliates.affiliate_name AS Affiliate',
                'ecommerce_sales.coupon_code AS Coupon Code',
                'ecommerce_affiliates.percentage AS Percentage %',
                DB::raw('ROUND(SUM(ecommerce_sales.shipping_cost), 2) AS `Shipping Cost`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total), 2) AS `Total Amount`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total) * ecommerce_affiliates.percentage / 100, 2) AS `Commission`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total) - (SUM(ecommerce_sales.total) * ecommerce_affiliates.percentage / 100), 2) AS `Net Amount`'),
                DB::raw('COUNT(ecommerce_sales.id) AS `No. of Orders`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total) / COUNT(ecommerce_sales.id), 2) AS `Avg. Order Value`'),
                DB::raw('ROUND(SUM(ecommerce_sales.total) / COUNT(ecommerce_sales.id) * ecommerce_affiliates.percentage / 100, 2) AS `Avg. Commission`'),
                DB::raw('ROUND((SUM(ecommerce_sales.total) - (SUM(ecommerce_sales.total) * ecommerce_affiliates.percentage / 100)) / COUNT(ecommerce_sales.id), 2) AS `Avg. Order Value After Commission`'),
            )
            ->orderBy('ecommerce_sales.coupon_code')
            ->orderBy('ecommerce_sales.order_at')
            ->get();

        $summary = ['Total Amount' => 0, 'Total Commission' => 0, 'Net Amount' => 0, 'Total Order' => 0];

        $salesData->each(function ($item) use (&$summary) {
            $summary['Total Amount'] += $item->{'Total Amount'};
            $summary['Total Commission'] += $item->Commission;
            $summary['Net Amount'] += $item->{'Net Amount'};
            $summary['Total Order'] += $item->{'No. of Orders'};
        });

        if ($salesData->count() < 1) {
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'         => $salesData,
            'summary' => $summary,
        ];
    }
}
