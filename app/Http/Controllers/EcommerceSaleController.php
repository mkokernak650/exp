<?php

namespace App\Http\Controllers;

use App\Exports\EcommerceSalesExport;
use App\Http\Requests\EcommerceSaleRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Imports\EcommerceSaleImport;
use App\Models\Customer;
use App\Models\EcommerceCampaign;
use App\Models\EcommerceSale;
use App\Models\TableDetails;
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
            ->select(
                '*',
                DB::raw("DATE_FORMAT(order_at, '%d %M,%Y %H:%i:%s') as formatted_order_at"),
                DB::raw("(SELECT affiliate_name FROM affiliates WHERE affiliates.id = 
                                    (SELECT affiliate_id FROM ecommerce_affiliates WHERE ecommerce_affiliates.coupon_code = 
                                    ecommerce_sales.coupon_code OR ecommerce_affiliates.dialed = ecommerce_sales.dialed LIMIT 1)) 
                                    as affiliate_name")
            )
            ->with('campaign:id,campaign_name')
            ->with('customer:id,customer_name')
            ->paginate(request('itemPerPage') ?? 10);

        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $salesQuery = EcommerceSale::query()
                ->select(
                    '*',
                    DB::raw("DATE_FORMAT(order_at, '%d %M,%Y %H:%i:%s') as formatted_order_at"),
                    DB::raw("(SELECT affiliate_name FROM affiliates WHERE affiliates.id = 
                                        (SELECT affiliate_id FROM ecommerce_affiliates WHERE ecommerce_affiliates.coupon_code = 
                                        ecommerce_sales.coupon_code OR ecommerce_affiliates.dialed = ecommerce_sales.dialed LIMIT 1)) 
                                        as affiliate_name")
                )
                ->with('campaign:id,campaign_name')
                ->with('customer:id,customer_name');

            if (!empty(request('filterByCampaigns'))) {
                $filterByCampaigns = explode(',', request('filterByCampaigns'));
                $salesQuery->whereIn('campaign_id', $filterByCampaigns);
            }

            if (!empty(request('filterByCustomers'))) {
                $filterByCustomers = explode(',', request('filterByCustomers'));
                $salesQuery->whereIn('customer_id', $filterByCustomers);
            }

            $filterByDate = json_decode(request('filterByDate'));

            if (!empty($filterByDate->startDate) && !empty($filterByDate->endDate)) {
                $salesQuery->whereDate('order_at', '>=', $filterByDate->startDate)
                    ->whereDate('order_at', '<=', $filterByDate->endDate);
            }

            return $salesQuery->paginate(request('itemPerPage') ?? 10);

            // $firstCond = $conditions->items[0];
            // $field = $this->fieldName($firstCond->field);
            // $val = $this->valueCehckById($firstCond->field, $firstCond->value);

            // $this->makeConditionQuery($salesQuery, 'where', $field, $firstCond->operator, $val);
            // for ($i = 1; $i < count($conditions->items); $i++) {
            //     $cond = $conditions->items[$i];
            //     $multiConField = $this->fieldName($cond->field);
            //     $multiConVal = $this->valueCehckById($cond->field, $cond->value);

            //     $this->makeConditionQuery($salesQuery, $conditions->groupName, $multiConField, $cond->operator, $multiConVal);
            // }

            // return $salesQuery->paginate(request('itemPerPage') ?? 10);
        }

        if (request('page')) {
            return $sales;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ecommerce/SalesIndex', compact('sales', 'campaigns', 'customers', 'columnsData'));
    }

    public function valueCehckById($key, $val)
    {
        switch ($key) {
            case 'campaign':
                $result = EcommerceCampaign::where('campaign_name', $val)->pluck('id');
                if (count($result)) {
                    return $result[0];
                } else {
                    return $val;
                }

                // no break
            case 'customer':
                $result = Customer::where('customer_name', $val)->pluck('id');
                if (count($result)) {
                    return $result[0];
                } else {
                    return $val;
                }
                // no break
            case 'order_type':
                if ($val === 'E-commerce') {
                    return 1;
                } elseif ($val === 'Phone') {
                    return 2;
                } else {
                    return $val;
                }
                // no break
            default:
                return $val;
        }
    }

    public function fieldName($key)
    {
        switch ($key) {
            case 'campaign':
                return 'campaign_id';
            case 'customer':
                return 'customer_id';
            default:
                return $key;
        }
    }

    public function update(EcommerceSaleRequest $request, EcommerceSale $ecommerceSale)
    {
        $id           = $request->id;
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;

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
            activity('Ecommerce Sales')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("An item has been updated");
            return response()->json(['msg' => 'Updated Successfully.', 'data' => $validated, 'updated_at' => $ecommerceSale->updated_at], 201);
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
            'coupon_code',
            'dialed',
            'inbound',
            'shipping_zip',
            'total',
            DB::raw("DATE_FORMAT(order_at, '%Y-%m-%d %H:%i:%s') as formatted_order_at")
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
        return response()->json(['msg' => $msg, 'alreadyExists' => $data], 201);
    }

    public function export(Request $request)
    {
        return Excel::download(new EcommerceSalesExport($request->filterValue), 'E-Commerce-Sales.' . 'xlsx');
    }

    public function deleteSelected(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';

        $result = EcommerceSale::whereIn('id', $ids)->delete();

        if ($result) {
            activity('Ecommerce Sales')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 204]);
        }
    }
}
