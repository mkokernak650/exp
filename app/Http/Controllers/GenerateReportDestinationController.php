<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Target;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GenerateReportDestinationController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportDestination(): \Inertia\Response
    {
        $allTargets = Target::all();
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();

        return Inertia::render('GenerateReport/GenerateReportDestination', [
            'targets' => $allTargets,
            'affiliates' => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks' => $broadCastWeeks,
        ]);
    }
}
