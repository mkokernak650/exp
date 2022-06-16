<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Target;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Customer;

class GenerateReportDestinationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportDestination(): Response
    {
        $allTargets = Target::where('status', '=', '1')->get();
        $affiliates = Affiliate::where('status', '=', '1')->get();
        $broadCastMonths = BroadCastMonth::where('status', '=', '1')->get();
        $broadCastWeeks = BroadCastWeeks::where('status', '=', '1')->get();
        $campaigns = Campaign::active()->get();
        $customers = Customer::where('status', '=', '1')->get();

        return Inertia::render('GenerateReport/GenerateReportDestination', [
            'targets'         => $allTargets,
            'affiliates'      => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks'  => $broadCastWeeks,
            'campaigns'       => $campaigns,
            'customers'       => $customers,
        ]);
    }
}
