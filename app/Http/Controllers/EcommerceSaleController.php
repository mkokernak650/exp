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
            ->select('ecommerce_sales.*', 'ecommerce_affiliates.percentage', 'ecommerce_affiliates.affiliate_id')
            ->get();



        $total_call = 0;
        $total_seconds = 0;
        $total_revenue = 0;



        $avg_revenue_amount = $total_revenue > 0 ? $total_revenue / $total_call : 0;
        $call_summary['Total number of calls'] = $total_call;
        $call_summary['Total Minutes'] = secondToMinutes($total_seconds);

        $call_summary['Total payout amount'] = (float)number_format($total_revenue, 2, '.', '');
        $call_summary['Average payout per call'] = (float)number_format($avg_revenue_amount, 2, '.', '');

        if (empty($salesData)) {
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'         => $salesData,
            'call_summary' => $call_summary,
        ];
    }
}
