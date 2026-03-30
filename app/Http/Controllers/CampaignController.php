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

        foreach ($ringbaCampaigns as $ringbaCampaign) {
            Campaign::updateOrCreate(
                ['campaign_id' => $ringbaCampaign->id],
                [
                    'campaign_name' => $ringbaCampaign->name,
                    'status'        => $ringbaCampaign->enabled,
                ]
            );
        }
    }

    public function campaignSettingForm(): Response
    {
        $allCampaigns = Campaign::orderBy('campaign_name')->get();
        return Inertia::render('Settings/Campaign/CampaignSettingForm', compact('allCampaigns'));
    }

    public function campaignSettingUpdate(Request $request): JsonResponse
    {
        $id           = $request->campaign_id;
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;

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

        activity('Campaign')->event('updated')
            ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
            ->log("Campaign duration updated");

        return response()->json(['msg' => 'Duration Updated.']);
    }

    public function campaignSettingReport()
    {
        $itemPerPage = request('itemPerPage', 10);
        $fieldMap = [
            'campaign' => 'campaign_name',
            'duration' => 'connection_duration',
            'status'   => 'status',
        ];
        $allowed = array_values($fieldMap);

        $allCampaigns = Campaign::query()
            ->tap(function ($query) use ($fieldMap, $allowed) {
                $this->applyEloquentTableFilters($query, request('filteredValue'), $fieldMap, $allowed);
            })
            ->paginate($itemPerPage);

        if (request('page')) {
            return $allCampaigns;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/Campaign/CampaignSettingReport', [
            'allCampaigns'                     => $allCampaigns,
            'columnsData'                      => $columnsData
        ]);
    }

    public function campaignAnnotations(Campaign $campaign)
    {
        $itemPerPage = request('itemPerPage', 10);
        $campaign    = $campaign->load('annotations');
        $annotation  = $campaign->annotations->sortBy('order')->values();

        if (request('page')) {
            $page   = request('page', 1);
            $sliced = $annotation->slice(($page - 1) * $itemPerPage, $itemPerPage)->values();
            return response()->json([
                'data'         => $sliced,
                'total'        => $annotation->count(),
                'current_page' => (int) $page,
                'per_page'     => (int) $itemPerPage,
            ]);
        }

        $columnsData = TableDetails::all()->pluck('column_details');
        $paginatedAnnotation = new \Illuminate\Pagination\LengthAwarePaginator(
            $annotation->forPage(1, $itemPerPage)->values(),
            $annotation->count(),
            $itemPerPage,
            1
        );

        return Inertia::render('Settings/Campaign/CampaignAnnotations', [
            'annotation'                       => $paginatedAnnotation,
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
        $id           = $campaign->id;
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;

        $result = $campaign->update(['status' => $request->status]);
        if ($result) {
            activity('Campaign')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("Campaign status updated");
            return response()->json(['msg' => 'Updated Successfully.'], 201);
        }
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;
        $i            = 0;

        while ($i < $idsCount) {
            $result = Campaign::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Campaign')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function getDescription($id)
    {
        $campaign = Campaign::select(['id', 'campaign_name', 'description', 'length_url'])->where('id', $id)->first();

        if ($campaign) {
            return ['success' => true, 'data' => $campaign];
        }

        return ['success' => false];
    }

    public function updateDescription(Request $request)
    {
        $data   = $request->data;
        $result = Campaign::where('id', $data['id'])->update([
            'description' => $data['description'],
            'length_url'  => $data['length_url']
        ]);

        if ($result) {
            return ['success' => true, 'msg' => 'Description updated successfully'];
        }

        return ['success' => false, 'msg' => 'Description updating failed!'];
    }
}
