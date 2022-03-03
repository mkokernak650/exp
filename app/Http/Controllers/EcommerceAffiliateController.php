<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
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
        $ecommerceAffiliates = EcommerceAffiliate::with('affiliate:id,affiliate_name')->get();
        return Inertia::render('Ecommerce/AffiliateIndex', compact('ecommerceAffiliates'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        $affiliates = Affiliate::all();
        return Inertia::render('Ecommerce/AffiliateCreate', compact('affiliates'));
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
            'affiliate_id' => ['required', Rule::exists('affiliates', 'id')],
            'coupon_code' => ['required', Rule::unique('ecommerce_affiliates', 'coupon_code')],
            'percentage' => ['required', 'numeric']
        ]);
        EcommerceAffiliate::create($validated);
        return response()->json(['msg' => 'Created Successfully.']);
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
            'coupon_code' => ['required', Rule::unique('ecommerce_affiliates', 'coupon_code')->ignore($ecommerceAffiliate->id)],
            'percentage' => ['required', 'numeric']
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
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  EcommerceAffiliate::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
