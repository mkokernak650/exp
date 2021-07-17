<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Market;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Redirect;
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
        Market::create([
            'market_name' => $request->market,
        ]);
        return redirect::back()->with("success", "Successfully Submitted");
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
        Excel::import(new MarketImport, $request->file);
        return back();

    }

    public function export($type)
    {
        return Excel::download(new MarketExport,  'markets.' . $type);
    }

    public function getColumn()
    {
        $market = new Market();
        dd($market->getTableColumn());
    }
}
