<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Target;
use App\Models\ZipcodeByTelevisionMarket;
use Inertia\Inertia;
use App\Models\Customer;

class GenerateReportMarketExceptionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportMarketExceptionForm()
    {
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $allTargets = Target::all();
        $affiliates = Affiliate::where('status', '=', '1')->get();
        $broadCastMonths = BroadCastMonth::where('status', '=', '1')->get();
        $broadCastWeeks = BroadCastWeeks::where('status', '=', '1')->get();
        $campaigns = Campaign::active()->get();
        $customers = Customer::where('status', '=', '1')->get();


        return Inertia::render('GenerateReport/GenerateReportMarketException', [
            'markets'         => $markets,
            'targets'         => $allTargets,
            'affiliates'      => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks'  => $broadCastWeeks,
            'campaigns'       => $campaigns,
            'customers'       => $customers,

        ]);
    }
}
