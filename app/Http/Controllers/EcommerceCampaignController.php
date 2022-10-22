<?php

namespace App\Http\Controllers;

use App\Models\EcommerceCampaign;
use App\Models\TableDetails;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EcommerceCampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $campaigns = EcommerceCampaign::all();
        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render(
            'Ecommerce/CampaignIndex',
            [
                'campaigns'  => $campaigns,
                'columnsData' => $columnsData
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
        return Inertia::render('Ecommerce/CampaignCreate');
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
        ]);
        if ($ecommerceCampaign->update($validated)) {
            return response()->json(['msg' => 'Updated Successfully.', 'updated_at' => $ecommerceCampaign->updated_at], 201);
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
}
