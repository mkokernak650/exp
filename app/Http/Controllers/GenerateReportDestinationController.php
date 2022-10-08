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
        $allTargets = Target::active()->get();
        $affiliates = Affiliate::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $campaigns = Campaign::active()->get();
        $customers = Customer::active()->get();

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
