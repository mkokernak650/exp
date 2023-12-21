<?php

namespace App\Http\Controllers;

use App\Exports\TvHouseholdsExport;
use App\Imports\TVHouseholdsImport;
use App\Models\TableDetails;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\TVHouseholds;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class TVHouseholdsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function AddTvHouseholds()
    {
        return Inertia::render('Settings/AddTvHouseholds');
    }

    public function TVHouseholdsReport()
    {
        $allTVHouseholds = TVHouseholds::orderBy('tv_households', 'DESC')->get();

        $allTVHouseholds->transform(function ($item) {
            if (isset($item->tv_households)) {
                $item->tv_households = number_format($item->tv_households);
            }

            return $item;
        });

        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/TVHouseholdsReport', [
            'allTVHouseholds' => $allTVHouseholds,
            'columnsData'    => $columnsData,
        ]);
    }

    public function storeTVHouseholds(Request $request)
    {
        $existData = TVHouseholds::where('market', $request->market)->where('state', $request->state)->count();
        if ($existData > 0) {
            return response()->json(['msg' => 'Market already exists']);
        }
        TVHouseholds::create([
            'market'        => $request->market,
            'state'         => $request->state,
            'tv_households' => $request->tv_households,
        ]);
        return response()->json(['msg' => 'Successfully Added']);
    }

    public function import(Request $request)
    {
        Excel::import(new TVHouseholdsImport, $request->importfile);
        return back()->with('Successfully import!');
    }

    public function export(Request $request)
    {
        return Excel::download(new TvHouseholdsExport($request->filterValue), 'TVHouseholds.' . 'xlsx');
    }



    public function edit(Request $request)
    {
        $data = TVHouseholds::find($request->id);
        $data->market = $request->market;
        $data->state = $request->state;
        $data->tv_households = $request->tv_households;
        $data->updated_at = now();
        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Successfully Edited', 'status_code' => 200,]);
        } else {
            return response()->json(['msg' => 'Editing Failed', 'status_code' => 500]);
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
            $result = TVHouseholds::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('TV Households Report')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
