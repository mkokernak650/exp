<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Inertia\Inertia;
use App\Models\Target;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;

class GenerateReportAffiliateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function GenerateReportAffiliateForm()
    {
        $allTargets = Target::active()->get();
        $affiliates = Affiliate::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();
        $broadCastWeeks = BroadCastWeeks::active()->get();
        $campaigns      = Campaign::active()->get();

        return Inertia::render('GenerateReport/GenerateReportAffiliate', [
            'targets'=>$allTargets,
            'affiliates' => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks' => $broadCastWeeks,
            'campaigns' => $campaigns,
        ]);
    }
}
