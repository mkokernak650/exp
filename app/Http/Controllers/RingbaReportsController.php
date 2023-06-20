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
        // dd($request->orderType);
        if ($request->orderType === 'billed') {
            $data = $this->reportQuery($request, 'billed_call_logs');
        } else if ($request->orderType === 'general') {
            $billedTableData     = $this->reportQuery($request, 'billed_call_logs');
            $archivedTableData   = $this->reportQuery($request, 'archived_call_logs');
            $callLogsTableData   = $this->reportQuery($request, 'ringba_call_logs');
            $exceptionsTableData = $this->reportQuery($request, 'exceptions');

            // dd($billedTableData, $archivedTableData, $callLogsTableData, $exceptionsTableData);

            $data = $billedTableData->merge($archivedTableData)->merge($callLogsTableData)->merge($exceptionsTableData);

            // dd($data);
        } else {
            return;
        }
        dd($data);
        // return response()->json([
        //     'header'  => [],
        //     'data'    => $data,
        //     'summary' => [],
        // ], 200);
    }

    protected function reportQuery($request, $table)
    {
        // dd($request->all());
        // dd($table);
        $reportFor         = $request->reportFor;
        $orderType         = $request->orderType;
        $reportOn          = $request->reportOn;
        $selectedStates    = $request->states;
        $selectedMarkets   = $request->markets;
        $selectedCampaigns = $request->campaign_id;
        $selectedCustomers = $request->customer_id;
        $selectedAffiliate = $request->selectedAffiliate;
        $selectedDialed    = !empty($request->selectedDialed) ? explode(',', $request->selectedDialed) : null;
        $selectedYears     = $request->year;
        $startDate         = $request->start_date;
        $endDate           = $request->end_date;
        $generateFor       = $request->type;
        $reportType        = $request->report_type;

        // dd($startDate, $endDate);
        // dd((empty($selectedYears) && !empty($startDate) && !empty($endDate)));

        $data = DB::table($table)
            ->when((!empty($selectedStates) && !in_array('allStates', $selectedStates)),
                fn ($query) => $query->whereIn('State', $selectedStates)
            )
            ->when((!empty($selectedMarkets) && !in_array('allMarkets', $selectedMarkets)),
                fn ($query) => $query->whereIn('Market', $selectedMarkets)
            )
            ->when(!empty($selectedCampaigns), fn ($query) => $query->whereIn('Campaign', $selectedCampaigns))
            ->when(!empty($selectedCustomers), fn ($query) => $query->whereIn('Customer', $selectedCustomers))
            ->when((!empty($selectedAffiliate) && $selectedAffiliate != 'allAffiliates'),
                fn ($query) => $query->where('Affiliate_Id', $selectedAffiliate)
            )
            ->when(!empty($selectedDialed), fn ($query) => $query->whereIn('Dialed', $selectedDialed))
            ->when(!empty($selectedYears), fn ($query) => $query->whereIn(DB::raw('YEAR(Call_Date_Time)'), $selectedYears))
            ->when((empty($selectedYears) && !empty($startDate) && !empty($endDate)),
                fn ($query) => $query
                    ->whereDate('Call_Date_Time', '>=', $startDate)
                    ->whereDate('Call_Date_Time', '<=', $endDate)
            )
            ->when(($reportOn === 'detail'),
                fn ($query) => $query
                    ->select($this->detailReportColumns($table))
                    ->orderBy('Call_Date_Time')
            )
            ->get();

        return $data;
    }

    protected function detailReportColumns($table)
    {
        $columns = [
            DB::raw('DATE_FORMAT(Call_Date_Time, "%Y-%m-%d") AS `Call Date`'),
            DB::raw('DATE_FORMAT(Call_Date_Time, "%h:%i:%s") AS `Call Time`'),
            'Campaign', 'Affiliate', 'City', 'Market', 'State', 'Zipcode',
            'Inbound AS Caller ID',
            'Type',
            'Conn_Duration AS Connection Duration',
            'Duplicate_Call AS Duplicate Call',
            'Source_Hangup AS Hangup',
            'Revenue',
            'call_Logs_status AS Call Status',
            DB::raw('(SELECT annotation_name FROM annotations WHERE annotations.id = ' . $table . '.Annotation_Tag) AS Annotation'),
            'Recording_Url as Recording Url'
        ];

        return $columns;
    }
}
