<?php

namespace App\Http\Controllers;

use App\Models\MarketExcptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use App\Models\Market;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MarketExceptionController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function addMarketException(Request $request)
    {
        MarketExcptions::create([
            'customer_id' => $request->customer,
            'market_id' => $request->market,
            'start_date' => $request->start_date,
        ]);
        return redirect::back()->with("success", "Successfully Submitted");
    }

    public function marketExceptionForm()
    {
        $allMarkets = Market::all();
        $allCustomers = Customer::all();
        return Inertia::render('Settings/MarketExceptionForm', [
            'allCustomers' => $allCustomers,
            'allMarkets' => $allMarkets
        ]);
    }

    public function marketExceptionReport()
    {
        $marketExceptions = DB::table('market_excptions')
            ->select(['market_excptions.id', 'market_excptions.start_date as start_date', 'customers.customer_name as customer', 'markets.market_name as market',])
            ->join('customers', 'customers.customer_ID', '=', 'market_excptions.customer_id')
            ->join('markets', 'markets.id', '=', 'market_excptions.market_id')
            ->get();

        return Inertia::render('Settings/MarketExceptionReport', [
            'marketExceptions' => $marketExceptions,
        ]);
    }

}
