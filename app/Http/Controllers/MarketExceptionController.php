<?php

namespace App\Http\Controllers;

use App\Exports\MarketExceptionExport;
use App\Imports\MarketExceptionImport;
use App\Models\Campaign;
use App\Models\MarketExcptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MarketExceptionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function addMarketException(Request $request)
    {
        $existData = MarketExcptions::query()
            ->where('campaign_id', $request->campaign_id)
            ->where('market_id', $request->market)
            ->where('call_type', $request->call_type)
            ->where('state', $request->state)
            ->count();
        if ($existData > 0) {
            return response()->json(["msg" => "Data already Exist"]);
        }

        MarketExcptions::create([
            'campaign_id' => $request->campaign_id,
            'state'=>$request->state,
            'market_id'   => $request->market,
            'call_type'   => $request->call_type,
            'start_date'  => $request->start_date,
        ]);

        return response()->json(["msg" => "Successfully added"]);
    }

    public function marketExceptionForm()
    {
        $allStates = DB::table('zipcode_by_television_markets')->select('state')->distinct()->get();
        $allMarkets = DB::table('zipcode_by_television_markets')->select('market')->distinct()->get();
        $allCampaigns = Campaign::active()->get();
        return Inertia::render('Settings/MarketExceptionForm', [
            'allStates'   => $allStates,
            'allMarkets'   => $allMarkets,
            'allCampaigns' => $allCampaigns
        ]);
    }


    public function marketExceptionReport()
    {
        $marketExceptions = MarketExcptions::with('campaign:id,campaign_name')->get();
        $allStates = DB::table('zipcode_by_television_markets')->select('state')->distinct()->get();
        $allMarkets = DB::table('zipcode_by_television_markets')->select('market')->distinct()->get();
        $allCampaigns = Campaign::active()->get();
        return Inertia::render('Settings/MarketExceptionReport', [
            'marketExceptions' => $marketExceptions,
            'campaignId'       => null,
            'allStates'   => $allStates,
            'allMarkets'   => $allMarkets,
            'allCampaigns' => $allCampaigns
        ]);
    }


    public function import(Request $request)
    {
        // post request
        Excel::import(new MarketExceptionImport, $request->file);
        return back()->with('Successfully import!');
    }

    public function export($type, $campaignId = null): BinaryFileResponse
    {
        return Excel::download(new MarketExceptionExport($campaignId), 'MarketExceptionExport.' . $type);
    }

    public function edit(Request $request)
    {
        $data = MarketExcptions::find($request->id);
        $data->campaign_id = $request->campaign_id;
        $data->state = $request->state;
        $data->market_id = $request->market_id;
        $data->call_type = $request->call_type;
        $data->start_date = $request->start_date;
        $data->ranks = $request->ranks;
        $data->nielsen_households = $request->nielsen_households;
        $result = $data->save();
        // deleteSuccessOrFailed($result);
        if ($result) {
            return response()->json(["msg" => "Successfully Updated", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Updating Failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            // $result =  DB::table('market_excptions')->where('id', $request->selectedRowIds[$i])->delete();
            $result = MarketExcptions::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
