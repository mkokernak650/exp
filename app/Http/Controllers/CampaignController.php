<?php
namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\ArchivedCallLog;
use App\Models\Campaign;
use App\Models\MarketExcptions;
use App\Models\RingbaCallLog;
use App\Models\Annotation;
use App\Models\TableDetails;
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
        $campaign = Campaign::findOrFail($request->input('campaign_id'));
        $campaign->update([
            'connection_duration' => $request->input('connection_duration')
        ]);

        $ringbaCallLogs = RingbaCallLog::where('Campaign', $campaign->campaign_name)
            ->where('call_Length_In_Seconds', '<', (int)$request->input('connection_duration'))
            ->get();
        foreach ($ringbaCallLogs as $ringbaCallLog) {
            $instance = new ArchivedCallLog();
            $instance->call_Logs_status = 'Archived';
            dataMoveHelper($instance, $ringbaCallLog);
        }

        return response()->json(['msg' => 'Duration Updated.']);
    }

    public function campaignSettingReport(): Response
    {
        $allCampaigns = Campaign::get();
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/Campaign/CampaignSettingReport', [
            'allCampaigns'                     => $allCampaigns,
            'columnsData'                      => $columnsData
        ]);
    }

    public function campaignAnnotations(Campaign $campaign): Response
    {
        $campaign = $campaign->load('annotations');
        $annotation = [...$campaign->annotations->sortBy('order')];
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/Campaign/CampaignAnnotations', [
            'annotation'                       => $annotation,
            'columnsData'                      => $columnsData

        ]);
    }

    public function storeAnnotationsRowOrder(Request $request)
    {
        $reqData = $request->all();
        if (!empty($reqData)) {
            foreach ($reqData as $row) {
                $Annotation = Annotation::find($row['id']);
                $Annotation->order = $row['order'];
                $Annotation->save();
            }
        }
    }

    public function campaignExceptions($campaignId): Response
    {
        $marketExceptions = MarketExcptions::with('campaign:id,campaign_name')
            ->where('campaign_id', $campaignId)
            ->get();
        $columnsData = TableDetails::all()->pluck('column_details');

        $allCampaigns = [];
        $allStates = [];
        $allMarkets = [];
        return Inertia::render(
            'Settings/MarketExceptionReport',
            [
                'marketExceptions' => $marketExceptions,
                'campaignId'       => $campaignId,
                'allCampaigns'     => $allCampaigns,
                'allStates'        => $allStates,
                'allMarkets'       => $allMarkets,
                'columnsData'      => $columnsData
            ]
        );
    }

    public function edit(Request $request)
    {
        $data = Campaign::find($request->id);
        $data->Customer = $request->customer;
        $data->Description = $request->Description;
        $data->Ringba_Targets_Name = $request->Ringba_Targets_Name;
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200, 'campaignData' => Campaign::all()]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function statusUpdate(Request $request, Campaign $campaign)
    {
        $campaign->update(['status' => $request->status]);
        return response()->json(['msg' => 'Updated Successfully.'], 201);
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = Campaign::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
