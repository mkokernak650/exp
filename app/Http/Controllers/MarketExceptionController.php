<?php

namespace App\Http\Controllers;

use App\Exports\MarketExceptionExport;
use App\Imports\MarketExceptionImport;
use App\Models\Campaign;
use App\Models\MarketExcptions;
use App\Models\TableDetails;
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
            return response()->json(['msg' => 'Data already Exist']);
        }

        MarketExcptions::create([
            'campaign_id' => $request->campaign_id,
            'state'       => $request->state,
            'market_id'   => $request->market,
            'call_type'   => $request->call_type,
            'start_date'  => $request->start_date,
        ]);

        return response()->json(['msg' => 'Successfully added']);
    }

    public function marketExceptionForm()
    {
        $allStates    = DB::table('zipcode_by_television_markets')->select('state')->distinct()->get();
        $allMarkets   = DB::table('zipcode_by_television_markets')->select('market')->distinct()->get();
        $allCampaigns = Campaign::orderBy('campaign_name')->active()->get();

        return Inertia::render('Settings/MarketExceptionForm', [
            'allStates'    => $allStates,
            'allMarkets'   => $allMarkets,
            'allCampaigns' => $allCampaigns
        ]);
    }

    public function marketExceptionReport()
    {
        $itemPerPage = request('itemPerPage', 10);

        $fieldMap = [
            'campaign'   => 'cme_filter.campaign_name',
            'market_id'  => 'zme_filter.market',
            'state'      => 'market_excptions.state',
            'call_type'  => 'market_excptions.call_type',
            'start_date' => 'market_excptions.start_date',
        ];
        $allowedFields = array_values($fieldMap);

        $filterPayload = $this->decodeFilterPayload(request('filteredValue'));
        $sanitizedItems = [];
        foreach ($filterPayload['items'] as $condition) {
            $sanitized = $this->sanitizeFilterCondition($condition, $allowedFields, $fieldMap);
            if ($sanitized !== null) {
                $sanitizedItems[] = $sanitized;
            }
        }

        $query = MarketExcptions::query()
            ->select('market_excptions.*')
            ->with('campaign:id,campaign_name');

        if ($sanitizedItems !== []) {
            $needsCampaignJoin = false;
            $needsMarketJoin = false;
            foreach ($sanitizedItems as $s) {
                if ($s['field'] === 'cme_filter.campaign_name') {
                    $needsCampaignJoin = true;
                }
                if ($s['field'] === 'zme_filter.market') {
                    $needsMarketJoin = true;
                }
            }
            if ($needsCampaignJoin) {
                $query->leftJoin('campaigns as cme_filter', 'market_excptions.campaign_id', '=', 'cme_filter.id');
            }
            if ($needsMarketJoin) {
                $query->leftJoin(
                    'zipcode_by_television_markets as zme_filter',
                    'market_excptions.market_id',
                    '=',
                    'zme_filter.id'
                );
            }
            if ($needsCampaignJoin || $needsMarketJoin) {
                $query->groupBy('market_excptions.id');
            }

            $groupName = $filterPayload['groupName'] ?? 'and';
            $first = $sanitizedItems[0];
            $this->makeConditionQuery($query, 'where', $first['field'], $first['operator'], $first['value']);
            for ($i = 1, $n = count($sanitizedItems); $i < $n; $i++) {
                $cond = $sanitizedItems[$i];
                $this->makeConditionQuery($query, $groupName, $cond['field'], $cond['operator'], $cond['value']);
            }
        }

        $marketExceptions = $query->paginate($itemPerPage);

        $marketIds = $marketExceptions->getCollection()->pluck('market_id')->unique()->filter();
        $marketLookup = DB::table('zipcode_by_television_markets')
            ->whereIn('id', $marketIds)
            ->pluck('market', 'id');

        $marketExceptions->getCollection()->transform(function ($item) use ($marketLookup) {
            $item->market_name = $marketLookup[$item->market_id] ?? $item->market_id;
            return $item;
        });

        if (request('page')) {
            return $marketExceptions;
        }

        $allStates = DB::table('zipcode_by_television_markets')->select('state')->distinct()->get();
        $allMarkets = DB::table('zipcode_by_television_markets')->select('market')->distinct()->get();
        $allCampaigns = Campaign::active()->get();
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/MarketExceptionReport', [
            'marketExceptions'                 => $marketExceptions,
            'campaignId'                       => null,
            'allStates'                        => $allStates,
            'allMarkets'                       => $allMarkets,
            'allCampaigns'                     => $allCampaigns,
            'columnsData'                      => $columnsData

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
            return response()->json(['msg' => 'Successfully Updated', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Updating Failed', 'status_code' => 500]);
        }
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;
        $i            = 0;

        while ($i < $idsCount) {
            $result = MarketExcptions::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Market Exceptions')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
