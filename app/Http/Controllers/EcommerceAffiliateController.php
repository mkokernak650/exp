<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use Illuminate\Http\jsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EcommerceAffiliateController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        $affiliates = Affiliate::all();
        $campaigns = Campaign::all();
        $customers = Customer::all();

        $ecommerceAffiliates = EcommerceAffiliate::
        with('affiliate:id,affiliate_name')
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
        $affiliates = Affiliate::all();
        $campaigns = Campaign::all();
        $customers = Customer::all();
        return Inertia::render('Ecommerce/AffiliateCreate', compact('affiliates', 'campaigns', 'customers'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => ['nullable', Rule::exists('campaigns', 'id')],
            'customer_id' => ['required', Rule::exists('customers', 'id')],
            'affiliate_id' => ['required', Rule::exists('affiliates', 'id')],
            'coupon_code' => ['required', Rule::unique('ecommerce_affiliates', 'coupon_code')],
            'affiliate_fee' => ['required', 'numeric'],
            'percentage' => ['required', 'numeric'],
        ]);
        EcommerceAffiliate::create($validated);
        return response()->json(['msg' => 'Created Successfully.'], 201);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param EcommerceAffiliate $ecommerceAffiliate
     * @return jsonResponse
     */
    public function update(Request $request, EcommerceAffiliate $ecommerceAffiliate)
    {
        $validated = $request->validate([
            'campaign_id' => ['nullable', Rule::exists('campaigns', 'id')],
            'customer_id' => ['required', Rule::exists('customers', 'id')],
            'affiliate_id' => ['required', Rule::exists('affiliates', 'id')],
            'coupon_code' => ['required', Rule::unique('ecommerce_affiliates', 'coupon_code')->ignore($ecommerceAffiliate->id)],
            'affiliate_fee' => ['required', 'numeric'],
            'percentage' => ['required', 'numeric'],
        ]);
        $ecommerceAffiliate->update($validated);
        return response()->json(['msg' => 'Updated Successfully.']);
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
        return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
    }
}
