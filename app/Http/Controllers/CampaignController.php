<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Annotation;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public static function getNewCampaigns()
    {
        $ringbaCampaigns = (new RingbaApiHelpers())->getCampaigns();
        $pluckedCampaignsName = Campaign::get(['campaign_name', 'status'])->pluck('campaign_name')->toArray();

        $newCampaign = [];
        foreach ($ringbaCampaigns as $key => $ringbaCampaign) {
            if (!in_array($ringbaCampaign->name, $pluckedCampaignsName)) {
                $newCampaign[$key] = [
                    'campaign_name' => $ringbaCampaign->name,
                    'status'        => $ringbaCampaign->enabled,
                    'created_at'    => now(),
                ];
            } else {
                Campaign::where('campaign_name', $ringbaCampaign->name)->first()->update([
                    'status' => $ringbaCampaign->enabled
                ]);
            }
        }

        Campaign::insert($newCampaign);
    }

    public function campaignSettingForm(): Response
    {
        $allCampaigns = Campaign::all();
        return Inertia::render('Settings/Campaign/CampaignSettingForm', compact('allCampaigns'));
    }

    public function campaignSettingUpdate(Request $request): JsonResponse
    {
        Campaign::findOrFail($request->input('campaign_id'))->update([
            'connection_duration' => $request->input('connection_duration')
        ]);
        return response()->json(['msg' => 'Campaign Settings Updated.']);
    }

    public function campaignSettingReport(): Response
    {
        $allCampaigns = Campaign::get();
        return Inertia::render('Settings/Campaign/CampaignSettingReport', compact('allCampaigns'));
    }

    public function campaignAnnotations(Campaign $campaign): Response
    {
        $campaign->load('annotations');
        return Inertia::render('Settings/Campaign/CampaignAnnotations', compact('campaign'));
    }

    public function edit(Request $request)
    {
        $data = Campaign::find($request->id);
        $data->Customer  = $request->customer;
        $data->Description = $request->Description;
        $data->Ringba_Targets_Name  = $request->Ringba_Targets_Name;
        $result = $data->save();

        if ($result) {
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200, "campaignData" => Campaign::all()]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  Campaign::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
