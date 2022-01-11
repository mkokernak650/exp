<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Target;
use App\Models\ZipcodeByTelevisionMarket;
use Inertia\Inertia;

class GenerateReportMarketExceptionController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportMarketExceptionForm()
    {
        $markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $allTargets = Target::all();
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();
        $campaigns = Campaign::active()->get();

        return Inertia::render('GenerateReport/GenerateReportMarketException', [
            'markets'         => $markets,
            'targets'         => $allTargets,
            'affiliates'      => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks'  => $broadCastWeeks,
            'campaigns'       => $campaigns,
        ]);
    }
}
