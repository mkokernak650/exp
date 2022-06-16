<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Target;
use App\Models\Customer;
use App\Models\ZipcodeByTelevisionMarket;
use Inertia\Inertia;

class GenerateReportMarketTargetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportMarketTargetForm()
    {
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $states = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $allTargets = Target::where('status', '=', '1')->get();
        $affiliates = Affiliate::where('status', '=', '1')->get();
        $broadCastMonths = BroadCastMonth::where('status', '=', '1')->get();
        $broadCastWeeks = BroadCastWeeks::where('status', '=', '1')->get();
        $customers = Customer::where('status', '=', '1')->get();
        $campaigns = Campaign::active()->get();

        return Inertia::render('GenerateReport/GenerateReportMarketTarget', [
            'markets'         => $markets,
            'states'         => $states,
            'targets'         => $allTargets,
            'affiliates'      => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks'  => $broadCastWeeks,
            'campaigns'       => $campaigns,
            'customers'       => $customers,
        ]);
    }
}
