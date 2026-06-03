<?php

namespace App\Http\Controllers;

use App\Exports\EcommerceSalesExport;
use App\Http\Requests\EcommerceSaleRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Imports\EcommerceSaleImport;
use App\Models\Affiliate;
use App\Models\Customer;
use App\Models\EcommerceCampaign;
use App\Models\EcommerceSale;
use App\Models\SalesImportFieldMap;
use App\Models\TableDetails;
use App\Support\ReportTableSort;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class EcommerceSaleController extends Controller
{
    public function index()
    {
        $campaigns  = EcommerceCampaign::active()->get();
        $customers  = Customer::active()->get();
        $affiliates = Affiliate::orderBy('affiliate_name')->select('id', 'affiliate_name')->active()->get();

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

        if (!empty(request('filterByAffiliates'))) {
            $salesQuery->whereRaw("(SELECT id FROM affiliates WHERE affiliates.id =
                                (SELECT affiliate_id FROM ecommerce_affiliates WHERE ecommerce_affiliates.coupon_code =
                                ecommerce_sales.coupon_code OR ecommerce_affiliates.dialed = ecommerce_sales.dialed LIMIT 1))
                                IN (" . request('filterByAffiliates') . ")");
        }

        $filterByDate = json_decode(request('filterByDate'));

        if (!empty($filterByDate->startDate) && !empty($filterByDate->endDate)) {
            $salesQuery->whereDate('order_at', '>=', $filterByDate->startDate)
                ->whereDate('order_at', '<=', $filterByDate->endDate);
        }

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';

            $sortableColumns = [
                'order_no', 'coupon_code', 'user_ip', 'shipping_city', 'shipping_state',
                'shipping_zip', 'billing_zip', 'quantity', 'subtotal', 'shipping_cost',
                'total', 'order_at', 'created_at', 'updated_at', 'dialed', 'inbound',
                'revenue', 'order_type',
            ];

            if ($sortField === 'campaign') {
                $salesQuery->leftJoin('ecommerce_campaigns', 'ecommerce_sales.campaign_id', '=', 'ecommerce_campaigns.id')
                    ->orderBy('ecommerce_campaigns.campaign_name', $sortOrder)
                    ->select('ecommerce_sales.*', DB::raw("DATE_FORMAT(ecommerce_sales.order_at, '%d %M,%Y %H:%i:%s') as formatted_order_at"),
                        DB::raw("(SELECT affiliate_name FROM affiliates WHERE affiliates.id =
                            (SELECT affiliate_id FROM ecommerce_affiliates WHERE ecommerce_affiliates.coupon_code =
                            ecommerce_sales.coupon_code OR ecommerce_affiliates.dialed = ecommerce_sales.dialed LIMIT 1))
                            as affiliate_name"));
            } elseif ($sortField === 'customer') {
                $salesQuery->leftJoin('customers', 'ecommerce_sales.customer_id', '=', 'customers.id')
                    ->orderBy('customers.customer_name', $sortOrder)
                    ->select('ecommerce_sales.*', DB::raw("DATE_FORMAT(ecommerce_sales.order_at, '%d %M,%Y %H:%i:%s') as formatted_order_at"),
                        DB::raw("(SELECT affiliate_name FROM affiliates WHERE affiliates.id =
                            (SELECT affiliate_id FROM ecommerce_affiliates WHERE ecommerce_affiliates.coupon_code =
                            ecommerce_sales.coupon_code OR ecommerce_affiliates.dialed = ecommerce_sales.dialed LIMIT 1))
                            as affiliate_name"));
            } elseif ($sortField === 'affiliate_name') {
                $salesQuery->orderBy('affiliate_name', $sortOrder);
            } elseif (in_array($sortField, $sortableColumns)) {
                ReportTableSort::apply(
                    $salesQuery,
                    $sortField,
                    $sortOrder,
                    $sortableColumns,
                    ['quantity', 'subtotal', 'shipping_cost', 'total', 'revenue', 'order_no'],
                    'ecommerce_sales'
                );
            }
        }

        $sales = $salesQuery->paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $sales;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ecommerce/SalesIndex', compact('sales', 'campaigns', 'customers', 'affiliates', 'columnsData'));
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
            'order_no',
            'coupon_code',
            'dialed',
            'inbound',
            'shipping_zip',
            'total',
            'import_hash',
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

        $existSales      = $saleImport->getAlreadyExist();
        $rejectedReturns = $saleImport->getRejectedReturns();
        $importedCount   = $saleImport->getTotalSales() - count($existSales) - count($rejectedReturns);

        if ($importedCount < 1 && count($rejectedReturns) === 0) {
            return response()->json(['msg' => 'All Sales Data Already Exist.'], 422);
        }

        $data = false;
        $msg = $importedCount . ' Rows Imported.';
        if (count($existSales) > 0) {
            $msg .= "\n" . count($existSales) . ' Rows Already Exist.';
            $data = $existSales;
        }
        if (count($rejectedReturns) > 0) {
            $msg .= "\n" . count($rejectedReturns) . ' Return Rows Rejected (missing identifiers).';
        }
        return response()->json([
            'msg'             => $msg,
            'alreadyExists'   => $data,
            'rejectedReturns' => count($rejectedReturns) > 0 ? $rejectedReturns : false,
        ], 201);
    }

    public function export(Request $request)
    {
        $fileName = 'E-Commerce-Sales';

        if (!empty(request('filterByCampaigns'))) {
            $filterByCampaigns  = explode(',', request('filterByCampaigns'));
            $campaignNames      = EcommerceCampaign::whereIn('id', $filterByCampaigns)->select('campaign_name')->pluck('campaign_name');
            $fileName          .= '_' . implode(',', $campaignNames->toArray());
        }

        if (!empty(request('filterByCustomers'))) {
            $filterByCustomers  = explode(',', request('filterByCustomers'));
            $customerNames      = Customer::whereIn('id', $filterByCustomers)->select('customer_name')->pluck('customer_name');
            $fileName          .= '_' . implode(',', $customerNames->toArray());
        }

        if (!empty(request('filterByAffiliates'))) {
            $filterByAffiliates  = explode(',', request('filterByAffiliates'));
            $affiliateNames      = Affiliate::whereIn('id', $filterByAffiliates)->select('affiliate_name')->pluck('affiliate_name');
            $fileName           .= '_' . implode(',', $affiliateNames->toArray());
        }

        $filterByDate = json_decode(request('filterByDate'));

        if (!empty($filterByDate->startDate) && !empty($filterByDate->endDate)) {
            $startDate  = date_format(date_create($filterByDate->startDate), 'd-M-Y');
            $endDate    = date_format(date_create($filterByDate->endDate), 'd-M-Y');
            $fileName  .= '_' . $startDate . '_' . $endDate;
        }

        return Excel::download(new EcommerceSalesExport($request->filterByCampaigns, $request->filterByCustomers, $request->filterByAffiliates, $request->filterByDate), $fileName . '.xlsx');
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

    public function saveFieldsMap(Request $request)
    {
        $campaignId = $request->values['campaign_id'];
        $customerId = $request->values['customer_id'];
        $orderType  = $request->values['order_type'];
        $fieldsMap  = $request->fieldMap;

        if (empty($customerId) || empty($customerId) || empty($orderType) || empty($fieldsMap)) {
            return ['success' => false, 'responseType' => 'empty', 'msg' => 'Required fields are missing!'];
        }

        $result = SalesImportFieldMap::updateOrCreate(
            [
                'campaign_id' => $campaignId,
                'customer_id' => $customerId,
                'order_type'  => $orderType,
            ],
            ['field_map'   => json_encode($fieldsMap)]
        );

        if ($result) {
            $saveStatus = $result->wasRecentlyCreated ? 'saved' : 'updated';

            return ['success' => true, 'msg' => "Fields map {$saveStatus} successfully"];
        }
    }

    public function getFieldsMap(Request $request)
    {
        $data      = $request->all();
        $fieldsMap = SalesImportFieldMap::select('field_map')
            ->where('campaign_id', $data['campaign_id'])
            ->where('customer_id', $data['customer_id'])
            ->where('order_type', $data['order_type'])
            ->get()->value('field_map');

        if (!empty($fieldsMap)) {
            return ['success' => true, 'data' => json_decode($fieldsMap)];
        } else {
            return ['success' => false, 'data' => []];
        }
    }
}
