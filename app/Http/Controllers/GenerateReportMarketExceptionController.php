<?php

namespace App\Http\Controllers;


use Inertia\Inertia;
use App\Models\Customer;
use App\Models\ZipcodeByTelevisionMarket;

class GenerateReportMarketExceptionController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }



    public function GenerateReportMarketExceptionForm()
    {
        $customers = Customer::all();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();


        return Inertia::render('GenerateReport/GenerateReportMarketException', [
            'customers' => $customers,
            'markets' => $markets,
        ]);
    }
}
