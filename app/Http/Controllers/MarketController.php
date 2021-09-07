<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Market;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MarketExport;
use App\Imports\MarketImport;

class MarketController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function addMarket(Request $request)
    {
        $allMarkets = Market::all();
        $existing_market = $allMarkets->where('market', $request->market)->first();
        if ($existing_market) {
            return response()->json(["msg" => "Market already exists"]);
        }

        Market::create([
            'market_name' => $request->market,
        ]);
        return response()->json(["msg" => "Successfully added"]);
    }

    public function marketReport()
    {
        $allMarkets = Market::all();
        return Inertia::render('Settings/MarketReport', [
            'allMarkets' => $allMarkets,
        ]);
    }

    public function import(Request $request)
    {
        // post request
        // dd($request->importfile);
        Excel::import(new MarketImport, $request->importfile);
        return back()->with('Successfully import!');
    }

    public function export($type)
    {
        // get request
        Excel::download(new MarketExport,  'markets.' . $type);
        return back()->with('Export successfully');
    }

    public function delete(Request $request)
    {
        // $test= Market::all();
        // return $test;
        // $i = 0;
        // while ($i <= count($request->selectedRowIds)) {
         

        //     Market::where('id', $request->selectedRowIds[$i])->delete();
        //     $i++;
        // }
    }
}
