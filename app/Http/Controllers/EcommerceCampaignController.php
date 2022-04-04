<?php

namespace App\Http\Controllers;

use App\Models\EcommerceCampaign;
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
        return Inertia::render('Ecommerce/CampaignIndex', compact('campaigns'));
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
            return response()->json(['msg' => 'Updated Successfully.'], 201);
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
        EcommerceCampaign::whereIn('id', $request->selectedRowIds)->delete();
        return response()->json(["msg" => "Successfully Deleted"]);
    }

    public function statusUpdate(Request $request, EcommerceCampaign $ecommerceCampaign)
    {
        $ecommerceCampaign->update(['status' => $request->status]);
        return response()->json(['msg' => 'Updated Successfully.'], 201);
    }
}
