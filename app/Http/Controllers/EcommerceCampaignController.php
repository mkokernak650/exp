<?php

namespace App\Http\Controllers;

use App\Exports\EcommerceCampaignAffiliateListExport;
use App\Models\Customer;
use App\Models\EcommerceCampaign;
use App\Models\TableDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class EcommerceCampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $campaigns   = EcommerceCampaign::with('customer:id,customer_name')->get();
        $columnsData = TableDetails::all()->pluck('column_details');
        $customers   = Customer::Active()->get();

        return Inertia::render(
            'Ecommerce/CampaignIndex',
            [
                'campaigns'   => $campaigns,
                'columnsData' => $columnsData,
                'customers'   => $customers
            ]
        );
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $customers = Customer::Active()->get();

        return Inertia::render('Ecommerce/CampaignCreate', compact('customers'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_name' => ['required', 'string', 'max:255', Rule::unique('ecommerce_campaigns', 'campaign_name')],
            'customer_id'   => ['nullable']
        ]);

        if (EcommerceCampaign::create($validated)) {
            return response()->json(['msg' => 'Created Successfully.'], 201);
        }

        return response()->json(['msg' => 'Try Again!'], 422);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\EcommerceCampaign  $ecommerceCampaign
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, EcommerceCampaign $ecommerceCampaign)
    {
        $validated = $request->validate([
            'campaign_name' => ['required', 'string', 'max:255', Rule::unique('ecommerce_campaigns', 'campaign_name')->ignore($ecommerceCampaign->id)],
            'customer_id'   => ['nullable']
        ]);

        if ($ecommerceCampaign->update($validated)) {
            $customer_name = $ecommerceCampaign->fresh()->customer;
            $customer_name = $customer_name ? $customer_name->customer_name : null;

            return response()->json(['msg' => 'Updated Successfully.', 'updated_at' => $ecommerceCampaign->updated_at, 'customer_name' => $customer_name], 201);
        }
        return response()->json(['msg' => 'Try Again!'], 422);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\EcommerceCampaign  $ecommerceCampaign
     * @return \Illuminate\Http\Response
     */
    public function destroy(EcommerceCampaign $ecommerceCampaign)
    {
        $ecommerceCampaign->delete();
        return response()->json(['msg' => 'Deleted Successfully.']);
    }

    public function deleteSelected(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';

        $result = EcommerceCampaign::whereIn('id', $ids)->delete();

        if ($result) {
            activity('Ecommerce Campaign')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted']);
        }
    }

    public function statusUpdate(Request $request, EcommerceCampaign $ecommerceCampaign)
    {
        $ecommerceCampaign->update(['status' => $request->status]);
        return response()->json(['msg' => 'Updated Successfully.'], 201);
    }

    public function affiliateList($campaignId)
    {
        $affiliateList = DB::table('ecommerce_affiliates')
            ->join('affiliates', 'ecommerce_affiliates.affiliate_id', '=', 'affiliates.id')
            ->where('campaign_id', $campaignId)
            ->select(['affiliates.affiliate_name', 'ecommerce_affiliates.affiliate_fee_type', 'affiliates.market', 'affiliates.created_at'])
            ->orderBy('affiliates.affiliate_name')
            ->groupBy('ecommerce_affiliates.affiliate_id')
            ->paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $affiliateList;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ecommerce/CampaignAffiliateList', compact('affiliateList', 'campaignId', 'columnsData'));
    }

    public function affiliateListExport($campaignId)
    {
        $campaignName = EcommerceCampaign::where('id', $campaignId)->select('campaign_name')->value('campaign_name');
        $fileName     = "{$campaignName} Affiliates";

        return Excel::download(new EcommerceCampaignAffiliateListExport($campaignId), $fileName . '.xlsx');
    }
}
