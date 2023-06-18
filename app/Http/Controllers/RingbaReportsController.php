<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RingbaReportsController extends Controller
{
    public function index()
    {
        $campaigns         = Campaign::active()->get();
        $customers         = Customer::active()->get();
        $markets           = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $states            = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $broadCastWeeks    = BroadCastWeeks::active()->get();
        $broadCastMonths   = BroadCastMonth::active()->get();
        $affiliates        = Affiliate::Active()->orderBy('affiliate_name')->get();
        $affiliatesOptions = [];

        foreach ($affiliates as $affiliate) {
            $affiliatesOptions[] = (object) [
                'label' => $affiliate->affiliate_name . (!empty($affiliate->market) ? ' (' . $affiliate?->market . ')' : ''),
                'value' => (string) $affiliate->id,
                'email' => $affiliate->email
            ];
        }

        return Inertia::render('GenerateReport/RingbaReports', compact('campaigns', 'customers', 'broadCastMonths', 'broadCastWeeks', 'states', 'markets', 'affiliatesOptions'));
    }

    public function generateReport(Request $request)
    {
        // dd($request->all());
        $data = $this->reportQuery($request);
    }

    protected function reportQuery($request)
    {
        // dd($request->all());
        $reportFor         = $request->reportFor;
        $orderType         = $request->orderType;
        $reportOn          = $request->reportOn;
        $selectedStates    = $request->states;
        $selectedMarkets   = $request->markets;
        $selectedCampaigns = $request->campaign_id;
        $selectedCustomers = $request->customer_id;
        $selectedAffiliate = $request->affiliate_id;
        $selectedYears     = $request->year;
        $startDate         = $request->start_date;
        $endDate           = $request->end_date;
        $generateFor       = $request->type;
        $reportType        = $request->report_type;

        dd($reportType);
    }
}
