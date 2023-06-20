<?php

namespace App\Http\Controllers;

use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('GenerateReport/RingbaReports', compact('campaigns', 'customers', 'broadCastMonths', 'broadCastWeeks', 'states', 'markets'));
    }

    public function getAffiliatesAndDialedByCampaigns(Request $request)
    {
        $affiliatesOptions = $dialedOptions = [];
        $selectedCampaigns = explode(',', $request->selectedCampaigns);

        $fromBilled     = DB::table('billed_call_logs')->whereIn('Campaign', $selectedCampaigns)->select('Affiliate_Id', 'Dialed')->distinct()->get();
        $fromArchived   = DB::table('archived_call_logs')->whereIn('Campaign', $selectedCampaigns)->select('Affiliate_Id', 'Dialed')->distinct()->get();
        $fromCallLogs   = DB::table('ringba_call_logs')->whereIn('Campaign', $selectedCampaigns)->select('Affiliate_Id', 'Dialed')->distinct()->get();
        $fromExceptions = DB::table('exceptions')->whereIn('Campaign', $selectedCampaigns)->select('Affiliate_Id', 'Dialed')->distinct()->get();

        $data = $fromBilled->merge($fromArchived)->merge($fromCallLogs)->merge($fromExceptions);

        $affiliateIds = $data->pluck('Affiliate_Id')->unique()->toArray();
        $dialed       = $data->pluck('Dialed')->unique()->toArray();
        $affiliates   = DB::table('affiliates')->whereIn('affiliate_id', $affiliateIds)->where('status', 1)->orderBy('affiliate_name')->select('affiliate_id', 'affiliate_name', 'email', 'market')->get()->toArray();

        foreach ($affiliates as $affiliate) {
            $affiliatesOptions[] = (object) [
                'label' => $affiliate->affiliate_name . (!empty($affiliate->market) ? ' (' . $affiliate?->market . ')' : ''),
                'value' => (string) $affiliate->affiliate_id,
                'email' => $affiliate->email
            ];
        }

        foreach ($dialed as $value) {
            $dialedOptions[] = (object) [
                'label' => $value,
                'value' => (string) $value
            ];
        }

        return ['affiliatesOptions' => $affiliatesOptions, 'dialedOptions' => $dialedOptions];
    }

    public function generateReport(Request $request)
    {
        // dd($request->all());
        $data = $this->reportQuery($request);
    }

    protected function reportQuery($request)
    {
        dd($request->all());
        $reportFor         = $request->reportFor;
        $orderType         = $request->orderType;
        $reportOn          = $request->reportOn;
        $selectedStates    = $request->states;
        $selectedMarkets   = $request->markets;
        $selectedCampaigns = $request->campaign_id;
        $selectedCustomers = $request->customer_id;
        $selectedAffiliate = $request->selectedAffiliate;
        $selectedDialed    = $request->selectedDialed;
        $selectedYears     = $request->year;
        $startDate         = $request->start_date;
        $endDate           = $request->end_date;
        $generateFor       = $request->type;
        $reportType        = $request->report_type;

        dd($selectedDialed);
    }
}
