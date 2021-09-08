<?php

namespace App\Http\Controllers;

use App\Models\{BilledCallLog, ReportGenerator};
use Illuminate\Http\Request;

class ReportGeneratorController extends Controller
{
    public function reports(Request $request)
    {
        $report_type    = true;
        $affiliate_id   = 'AFd3d075c572a14ed19698e10c07dc00dd';
        $broadCastMonth = null;
        $broadCastWeek  = null;
        $start_date     = '2021-07-13';
        $end_date       = '2021-07-26';

        if ($report_type === 'Billed') {
            $results = $this->fetchData(new BilledCallLog(), $affiliate_id, $start_date, $end_date);
            dd($results);
        } else {

        }
    }

    private function fetchData($instance, $affiliate_id, $start_date, $end_date)
    {
        return $instance
            ->where('Affiliate_Id', '=', $affiliate_id)
            ->where('Call_Date', '>=', $start_date)
            ->where('Call_Date', '<=', $end_date)->get();
    }
}
