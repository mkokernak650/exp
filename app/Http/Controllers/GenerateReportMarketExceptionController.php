<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Target;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
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
        // $customers = Customer::all();
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $allTargets = Target::all();
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();

        return Inertia::render('GenerateReport/GenerateReportMarketException', [
            // 'customers' => $customers,
            'markets' => $markets,
            'targets'=>$allTargets,
            'affiliates' => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks' => $broadCastWeeks,
        ]);
    }
}
