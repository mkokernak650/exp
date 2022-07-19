<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Customer;
use App\Models\Affiliate;
use Illuminate\Http\Request;
use App\Models\EcommerceSale;
use Illuminate\Validation\Rule;
use App\Models\EcommerceCampaign;
use Illuminate\Http\jsonResponse;
use App\Models\EcommerceAffiliate;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EcommerceAffiliatesImport;
use App\Http\Requests\EcommerceAffiliateRequest;

class EcommerceAffiliateController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        $affiliates = Affiliate::active()->get();
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();

        $ecommerceAffiliates = EcommerceAffiliate::query()
            ->with('affiliate:id,affiliate_name')
            ->with('campaign:id,campaign_name')
            ->with('customer:id,customer_name')
            ->get();
        return Inertia::render('Ecommerce/AffiliateIndex', compact('ecommerceAffiliates', 'affiliates', 'campaigns', 'customers'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        $affiliates = Affiliate::active()->get();
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();
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
        $validated = $request->validated();
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

        try {
            EcommerceAffiliate::create($request->validated());
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
        $validated = $request->validated();
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

        try {
            $ecommerceAffiliate->update($validated);
            return response()->json(['msg' => 'Updated Successfully.', 'data' => $validated], 201);
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
        EcommerceAffiliate::whereIn('id', $request->selectedRowIds)->delete();
        return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
    }

    public function import(Request $request)
    {
        $affiliates = Affiliate::pluck('affiliate_name', 'id')->toArray();
        Excel::import(new EcommerceAffiliatesImport($affiliates), $request->importFile);
        return response()->json(['msg' => 'Successfully import!'], 201);
    }
}
