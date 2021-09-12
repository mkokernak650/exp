<?php

namespace App\Http\Controllers;


use Inertia\Inertia;
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
        $affiliates = Affiliate::all();
        $broadCastMonths = BroadCastMonth::all();
        $broadCastWeeks = BroadCastWeeks::all();


        return Inertia::render('GenerateReport/GenerateReportAffiliate', [
            'affiliates' => $affiliates,
            'broadCastMonths' => $broadCastMonths,
            'broadCastWeeks' => $broadCastWeeks,
        ]);
    }
}
