<?php

namespace App\Http\Controllers;

use App\Imports\EcommerceAffiliatesImport;
use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use Illuminate\Http\jsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

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
            'customer_id' => ['nullable', Rule::exists('customers', 'id')],
            'affiliate_id' => ['required', Rule::exists('affiliates', 'id')],
            'coupon_code' => ['required', Rule::unique('ecommerce_affiliates', 'coupon_code')],
            'revenue' => ['required', 'numeric'],
            'affiliate_fee' => ['required', 'numeric'],
        ]);
        if (EcommerceAffiliate::create($validated)) {
            return response()->json(['msg' => 'Created Successfully.'], 201);
        }
        return response()->json(['msg' => 'Try Again!'], 422);
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
            'customer_id' => ['nullable', Rule::exists('customers', 'id')],
            'affiliate_id' => ['required', Rule::exists('affiliates', 'id')],
            'coupon_code' => ['required', 'string'],
            'revenue' => ['required', 'numeric'],
            'affiliate_fee' => ['required', 'numeric'],
        ]);
        if ($ecommerceAffiliate->update($validated)) {
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
        return response()->json(['msg' => 'Try Again!'], 422);
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

    public function import(Request $request)
    {
        $affiliates = Affiliate::pluck('affiliate_name', 'id')->toArray();
        Excel::import(new EcommerceAffiliatesImport($affiliates), $request->importFile);
        return response()->json(['msg' => 'Successfully import!'], 201);
    }
}
