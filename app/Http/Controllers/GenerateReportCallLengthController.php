<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Inertia\Inertia;
use App\Models\Target;
use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;

class GenerateReportCallLengthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }



    public function GenerateReportCallLengthForm()
    {
        $allTargets = Target::all();
        $affiliates = Affiliate::all();
        $campaigns      = Campaign::active()->get();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();

        return Inertia::render('GenerateReport/GenerateReportCallLength', [
            'targets'=>$allTargets,
            'affiliates' => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks' => $broadCastWeeks,
            'campaigns' => $campaigns,
        ]);
    }
}
