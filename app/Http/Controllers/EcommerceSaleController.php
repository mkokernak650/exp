<?php
namespace App\Http\Controllers;

use App\Http\Requests\EcommerceSaleRequest;
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
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
        $sales = EcommerceSale::query()
            ->select('*', DB::raw("DATE_FORMAT(order_at, '%d %M,%Y %H:%i:%s') as formatted_order_at"))
            ->with('campaign:id,campaign_name')
            ->with('customer:id,customer_name')
            ->lazy();

        return Inertia::render('Ecommerce/SalesIndex', compact('sales', 'campaigns', 'customers'));
    }

    public function update(EcommerceSaleRequest $request, EcommerceSale $ecommerceSale)
    {
        $validated = $request->validated();

        if ($validated['order_type'] === 'E-commerce') {
            $validated['order_type'] = 1;
        } else {
            $validated['order_type'] = 2;
        }

        $eCommerceAffiliate = EcommerceSale::query()
            ->where('id', '!=', $ecommerceSale->id)
            ->where('customer_id', $validated['customer_id'])
            ->where('campaign_id', $validated['campaign_id'])
            ->where('order_type', $validated['order_type'])
            ->where('order_no', $validated['order_no'])
            ->where('shipping_zip', $validated['shipping_zip'])
            ->when(
                $validated['order_type'] == EcommerceSale::ORDER_TYPE['e-commerce'],
                fn ($q) => $q
                    ->where('coupon_code', $validated['coupon_code'])
            )
            ->when(
                $validated['order_type'] == EcommerceSale::ORDER_TYPE['phone'],
                fn ($q) => $q
                    ->where('dialed', $validated['dialed'])
            )
            ->first();

        if ($eCommerceAffiliate) {
            return response()->json(['msg' => 'Already Exists!'], 422);
        }

        if ($validated['order_type'] == EcommerceSale::ORDER_TYPE['e-commerce']) {
            $validated['dialed'] = null;
            $validated['inbound'] = null;
        } else {
            $validated['coupon_code'] = null;
            $validated['user_ip'] = null;
        }

        try {
            $ecommerceSale->update($validated);
            return response()->json(['msg' => 'Updated Successfully.', 'data' => $validated, 'updated_at'=>$ecommerceSale->updated_at], 201);
        } catch (\Throwable $th) {
            return response()->json(['msg' => 'Try Again!'], 422);
        }
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
            'shipping_zip',
            'order_at'
        )->get();

        $saleImport = new EcommerceSaleImport(
            $filterFields,
            $salesData,
            $request->campaign_id,
            $request->customer_id,
            $request->order_type
        );
        Excel::import($saleImport, $request->file('file'));

        $existSales = $saleImport->getAlreadyExist();
        $importedCount = $saleImport->getTotalSales() - count($existSales);

        if ($importedCount < 1) {
            return response()->json(['msg' => 'All Sales Data Already Exist.'], 422);
        }

        $data = false;
        $msg = $importedCount . ' Rows Imported.';
        if (count($existSales) > 0) {
            $msg .= "\n" . count($existSales) . ' Rows Already Exist.';
            $data = $existSales;
        }
        return response()->json(['msg'=> $msg, 'alreadyExists' => $data], 201);
    }

    public function deleteSelected(Request $request)
    {
        EcommerceSale::whereIn('id', $request->selectedRowIds)->delete();
        return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 204]);
    }
}
