<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Inertia\Inertia;
use App\Models\Target;
use App\Models\Affiliate;

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

        return Inertia::render('GenerateReport/GenerateReportCallLength', [
            'targets'=>$allTargets,
            'affiliates' => $affiliates,
            'campaigns' => $campaigns,
        ]);
    }
}
