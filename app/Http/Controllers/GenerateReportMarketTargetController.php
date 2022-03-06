<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Target;
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
        $allTargets = Target::all();
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();
        $campaigns = Campaign::active()->get();

        return Inertia::render('GenerateReport/GenerateReportMarketTarget', [
            'markets'         => $markets,
            'states'         => $states,
            'targets'         => $allTargets,
            'affiliates'      => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks'  => $broadCastWeeks,
            'campaigns'       => $campaigns,
        ]);
    }
}
