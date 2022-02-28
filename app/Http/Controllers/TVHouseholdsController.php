<?php

namespace App\Http\Controllers;

use App\Exports\CustomerExport;
use App\Imports\TVHouseholdsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\TVHouseholds;
use Inertia\Inertia;

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
        $allTVHouseholds = TVHouseholds::all();
        return Inertia::render('Settings/TVHouseholdsReport', [
            'allTVHouseholds' =>  $allTVHouseholds,
        ]);
    }




    public function storeTVHouseholds(Request $request)
    {
        $existData = TVHouseholds::where('market', $request->market)->where('state', $request->state)->count();
        if ($existData > 0) {
            return response()->json(["msg" => "Market already exists"]);
        }
        TVHouseholds::create([
            'market' => $request->market,
            'state' => $request->state,
            'tv_households' => $request->tv_households,
        ]);
        return response()->json(["msg" => "Successfully Added"]);
    }

    public function import(Request $request)
    {
        Excel::import(new TVHouseholdsImport, $request->importfile);
        return back()->with('Successfully import!');
    }

    public function export($type)
    {
        // get request
        Excel::download(new CustomerExport, 'Customers.' . $type);
        return back()->with('Export successfully');
    }


    public function edit(Request $request)
    {
        $data = TVHouseholds::find($request->id);
        $data->market  = $request->market;
        $data->state  = $request->state;
        $data->tv_households  = $request->tv_households;
        $result = $data->save();

        if ($result) {
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200,]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  TVHouseholds::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
