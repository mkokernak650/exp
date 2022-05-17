<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Imports\EcommerceSaleImport;
use App\Models\Customer;
use App\Models\EcommerceCampaign;
use App\Models\EcommerceSale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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
            'order_no'       => ['required', 'string', 'max:255'],
            'coupon_code'    => ['required', 'string', 'max:255'],
            'shipping_city'  => ['nullable', 'string', 'max:255'],
            'shipping_state' => ['nullable', 'string', 'max:255'],
            'shipping_zip'   => ['nullable', 'string', 'max:255'],
            'billing_zip'    => ['nullable', 'string', 'max:255'],
            'quantity'       => ['nullable', 'string', 'max:255'],
            'subtotal'       => ['nullable', 'string', 'max:255'],
            'shipping_cost'  => ['nullable', 'string', 'max:255'],
            'total'          => ['nullable', 'string', 'max:255'],
        ]);

        if ($ecommerceSale->update($validated)) {
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
        return response()->json(['msg' => 'Try Again!'], 422);
    }

    public function import()
    {
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
        return Inertia::render('Ecommerce/SalesImport', compact('campaigns', 'customers'));
    }

    public function importStore(Request $request)
    {
        $request->validate([
            'file'        => ['required', 'file'],
            'fieldMap'    => ['required', 'string'],
            'campaign_id' => ['required', Rule::exists('ecommerce_campaigns', 'id')],
            'customer_id' => ['required', Rule::exists('customers', 'id')],
            'order_type'  => ['required', Rule::in(EcommerceSale::ORDER_TYPE)],
        ]);

        $filterFields = [];
        foreach (json_decode($request->input('fieldMap')) as $value) {
            if (!empty($value->applicationField) && !empty($value->reportField)) {
                $filterFields[$value->applicationField] = Str::slug($value->reportField, '_');
            }
        }

        $salesData = EcommerceSale::select(
            'id',
            'campaign_id',
            'customer_id',
            'order_type',
            'order_no',
            'coupon_code',
            'dialed',
            'shipping_zip'
        )->get();

        Excel::import(
            new EcommerceSaleImport(
                $filterFields,
                $salesData,
                $request->input('campaign_id'),
                $request->input('customer_id'),
                $request->input('order_type')
            ),
            $request->file('file')
        );

        return response()->json(['msg' => 'Imported Successfully.'], 201);
    }

    public function deleteSelected(Request $request)
    {
        EcommerceSale::whereIn('id', $request->selectedRowIds)->delete();
        return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 204]);
    }
}
