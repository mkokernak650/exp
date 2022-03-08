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
    function __construct()
    {
        $this->middleware('auth');
    }



    public function GenerateReportAffiliateForm()
    {
        $allTargets = Target::where('status','=','1')->get();
        $affiliates = Affiliate::where('status','=','1')->get();
        $broadCastMonths = BroadCastMonth::where('status','=','1')->get();
        $broadCastWeeks = BroadCastWeeks::where('status','=','1')->get();
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
