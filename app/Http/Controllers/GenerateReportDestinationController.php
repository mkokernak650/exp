<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Target;
use Inertia\Inertia;
use Inertia\Response;

class GenerateReportDestinationController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportDestination(): Response
    {
        $allTargets = Target::all();
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();
        $campaigns = Campaign::active()->get();

        return Inertia::render('GenerateReport/GenerateReportDestination', [
            'targets'         => $allTargets,
            'affiliates'      => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks'  => $broadCastWeeks,
            'campaigns'       => $campaigns,
        ]);
    }
}
