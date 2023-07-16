<?php

namespace App\Http\Controllers;

use App\Exports\EcommerceAffiliateExport;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Customer;
use App\Models\Affiliate;
use Illuminate\Http\Request;
use App\Models\EcommerceSale;
use App\Models\EcommerceCampaign;
use Illuminate\Http\jsonResponse;
use App\Models\EcommerceAffiliate;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EcommerceAffiliatesImport;
use App\Http\Requests\EcommerceAffiliateRequest;
use App\Models\TableDetails;

class EcommerceAffiliateController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        $affiliates  = Affiliate::active()->orderBy('affiliate_name')->get();
        $campaigns   = EcommerceCampaign::active()->get();
        $customers   = Customer::active()->get();
        $columnsData = TableDetails::all()->pluck('column_details');
        $conditions  = json_decode(request('filteredValue'));

        if (request('filteredValue') && count($conditions->items)) {
            $eAffiliatesQuery = EcommerceAffiliate::query()
                ->with('affiliate:id,affiliate_name')
                ->with('campaign:id,campaign_name')
                ->with('customer:id,customer_name');

            if (!empty(request('filterByCampaigns'))) {
                $filterByCampaigns = explode(',', request('filterByCampaigns'));
                $eAffiliatesQuery->whereIn('campaign_id', $filterByCampaigns);
            }

            if (!empty(request('filterByCustomers'))) {
                $filterByCustomers = explode(',', request('filterByCustomers'));
                $eAffiliatesQuery->whereIn('customer_id', $filterByCustomers);
            }

            if (!empty(request('filterByAffiliates'))) {
                $filterByAffiliates = explode(',', request('filterByAffiliates'));
                $eAffiliatesQuery->whereIn('affiliate_id', $filterByAffiliates);
            }

            if (!empty(request('orderBy'))) {
                $eAffiliatesQuery->orderBy('created_at', request('orderBy'));
            }

            return $eAffiliatesQuery->paginate(request('itemPerPage') ?? 10);
        }

        $ecommerceAffiliates = EcommerceAffiliate::paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $ecommerceAffiliates;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ecommerce/AffiliateIndex', compact('ecommerceAffiliates', 'affiliates', 'campaigns', 'customers', 'columnsData'));
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
            case 'affiliate':
                $result = Affiliate::where('affiliate_name', $val)->pluck('id');
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
            case 'affiliate':
                return 'affiliate_id';

            case 'customer':
                return 'customer_id';
            default:
                return $key;
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        $affiliates = Affiliate::active()->orderBy('affiliate_name')->get();
        $campaigns  = EcommerceCampaign::active()->get();
        $customers  = Customer::active()->get();
        return Inertia::render('Ecommerce/AffiliateCreate', compact('affiliates', 'campaigns', 'customers'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(EcommerceAffiliateRequest $request)
    {
        $validated          = $request->validated();
        $eCommerceAffiliate = EcommerceAffiliate::query()
            ->where('affiliate_id', $request->affiliate_id)
            ->where('customer_id', $request->customer_id)
            ->where('campaign_id', $request->campaign_id)
            ->where('order_type', $request->order_type)
            ->when(
                $request->order_type == EcommerceSale::ORDER_TYPE['e-commerce'],
                fn ($q) => $q->where('coupon_code', $request->coupon_code)
            )
            ->when(
                $request->order_type == EcommerceSale::ORDER_TYPE['phone'],
                fn ($q) => $q->where('dialed', $request->dialed)
            )
            ->first();

        if ($eCommerceAffiliate) {
            return response()->json(['msg' => 'Already Exists!'], 422);
        }

        if ($request->order_type == EcommerceSale::ORDER_TYPE['e-commerce']) {
            unset($validated['dialed']);
        } else {
            unset($validated['coupon_code']);
        }

        if ($request->affiliate_fee_type === "1") {
            unset($validated['consumerEXP_cash_buy_fee'], $validated['cash_buy'], $validated['consumerEXP_cash_buy_fee_type']);
            $validated['percentage'] = $validated['revenue'] - $validated['affiliate_fee'];
        }

        if ($request->affiliate_fee_type === "2") {
            unset($validated['revenue'], $validated['affiliate_fee']);
            if ($request->consumerEXP_cash_buy_fee_type === "1") {
                $validated['consumerEXP_cash_buy_fee'] = (($request->consumerEXP_cash_buy_fee / 100) * $request->cash_buy);
            }
            $validated['percentage'] = $validated['consumerEXP_cash_buy_fee'];
        }

        try {
            EcommerceAffiliate::create($validated);
            return response()->json(['msg' => 'Created Successfully.'], 201);
        } catch (\Throwable $th) {
            return response()->json(['msg' => 'Try Again!'], 422);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param EcommerceAffiliate $ecommerceAffiliate
     * @return jsonResponse
     */
    public function update(EcommerceAffiliateRequest $request, EcommerceAffiliate $ecommerceAffiliate)
    {
        $validated          = $request->validated();
        $eCommerceAffiliate = EcommerceAffiliate::query()
            ->where('id', '!=', $ecommerceAffiliate->id)
            ->where('affiliate_id', $request->affiliate_id)
            ->where('customer_id', $request->customer_id)
            ->where('campaign_id', $request->campaign_id)
            ->where('order_type', $request->order_type)
            ->when(
                $request->order_type == EcommerceSale::ORDER_TYPE['e-commerce'],
                fn ($q) => $q->where('coupon_code', $request->coupon_code)
            )
            ->when(
                $request->order_type == EcommerceSale::ORDER_TYPE['phone'],
                fn ($q) => $q->where('dialed', $request->dialed)
            )
            ->first();

        if ($eCommerceAffiliate) {
            return response()->json(['msg' => 'Already Exists!'], 422);
        }

        if ($request->order_type == EcommerceSale::ORDER_TYPE['e-commerce']) {
            $validated['dialed'] = null;
        } else {
            $validated['coupon_code'] = null;
        }

        if ($request->affiliate_fee_type == 1) {
            $validated['consumerEXP_cash_buy_fee']      = null;
            $validated['cash_buy']                      = null;
            $validated['consumerEXP_cash_buy_fee_type'] = null;
            $validated['percentage']                    = $validated['revenue'] - $validated['affiliate_fee'];
        }

        if ($request->affiliate_fee_type == 2) {
            $validated['revenue'] = null;
            $validated['affiliate_fee'] = null;
            if ($request->consumerEXP_cash_buy_fee_type == 1) {
                $validated['consumerEXP_cash_buy_fee'] = (($request->consumerEXP_cash_buy_fee / 100) * $request->cash_buy);
            }
            $validated['percentage'] = $validated['consumerEXP_cash_buy_fee'];
        }

        try {
            $ecommerceAffiliate->update($validated);
            return response()->json(['msg' => 'Updated Successfully.', 'data' => $validated, 'updated_at' => $ecommerceAffiliate->updated_at], 201);
        } catch (\Throwable $th) {
            return response()->json(['msg' => 'Try Again!'], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param EcommerceAffiliate $ecommerceAffiliate
     * @return jsonResponse
     */
    public function destroy(EcommerceAffiliate $ecommerceAffiliate)
    {
        $ecommerceAffiliate->delete();
        return response()->json(['msg' => 'Deleted Successfully.']);
    }

    public function deleteSelected(Request $request)
    {
        $ids = $request->selectedRowIds;
        $idsCount = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail = auth()->user()->email;
        $itemsCount = $idsCount > 1 ? 'items' : 'item';

        $result = EcommerceAffiliate::whereIn('id', $ids)->delete();

        if ($result) {
            activity('Ecommerce Affiliate')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        }
    }

    public function import(Request $request)
    {
        $affiliates = Affiliate::pluck('affiliate_name', 'id')->toArray();
        Excel::import(new EcommerceAffiliatesImport($affiliates), $request->importFile);
        return response()->json(['msg' => 'Successfully import!'], 201);
    }

    public function export(Request $request)
    {
        $fileName = 'Phone & codes';

        if (!empty($request->filterByCampaigns)) {
            $filterByCampaigns  = explode(',', $request->filterByCampaigns);
            $campaignNames      = EcommerceCampaign::whereIn('id', $filterByCampaigns)->select('campaign_name')->pluck('campaign_name');
            $fileName          .= '_' . implode(',', $campaignNames->toArray());
        }

        if (!empty($request->filterByCustomers)) {
            $filterByCustomers  = explode(',', $request->filterByCustomers);
            $customerNames      = Customer::whereIn('id', $filterByCustomers)->select('customer_name')->pluck('customer_name');
            $fileName          .= '_' . implode(',', $customerNames->toArray());
        }

        if (!empty($request->filterByAffiliates)) {
            $filterByAffiliates  = explode(',', $request->filterByAffiliates);
            $affiliateNames      = Affiliate::whereIn('id', $filterByAffiliates)->select('affiliate_name')->pluck('affiliate_name');
            $fileName           .= '_' . implode(',', $affiliateNames->toArray());
        }
        dd(Excel::download(new EcommerceAffiliateExport($request->filterByCampaigns, $request->filterByCustomers, $request->filterByAffiliates), $fileName . '.xlsx'));

        return Excel::download(new EcommerceAffiliateExport($request->filterByCampaigns, $request->filterByCustomers, $request->filterByAffiliates), $fileName . '.xlsx');
    }
}
