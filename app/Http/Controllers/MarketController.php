<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Market;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

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
}
