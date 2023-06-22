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
        // dd($request->reportOn);
        $tagsData    = [];
        $orderType   = $request->orderType;
        $reportOn    = $request->reportOn;
        $generateFor = $request->type;

        if ($orderType === 'general' && $reportOn === 'detail') {
            $billedTableData     = $this->reportQuery($request, 'billed_call_logs');
            $archivedTableData   = $this->reportQuery($request, 'archived_call_logs');
            $callLogsTableData   = $this->reportQuery($request, 'ringba_call_logs');
            $exceptionsTableData = $this->reportQuery($request, 'exceptions');
            $data                = $billedTableData->merge($archivedTableData)->merge($callLogsTableData)->merge($exceptionsTableData);
        } else {
            $data = $this->reportQuery($request, 'billed_call_logs');
        }

        $summary = $this->summary($reportOn, $data, $generateFor);

        if ($reportOn === 'detail') {
            $tagsData = $this->tagsData($data, $generateFor);
        }
        // dd($tagsData);

        if ($request->orderType === 'general' && $reportOn === 'detail') {
            $data = $data->sortBy(function ($item) {
                $callDateTime = $item->{'Call Date'} . ' ' . $item->{'Call Time'};
                return strtotime($callDateTime);
            });
            $data = [...$data];
        }
        // dd($data);

        return response()->json([
            'header'   => [],
            'data'     => $data,
            'summary'  => $summary,
            'tagsData' => $tagsData
        ], 200);
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

        // dd($generateFor);
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
                    ->select($this->detailReportColumns($table, $generateFor))
                    ->orderBy('Call_Date_Time')
            )
            ->get();

        return $data;
    }

    protected function detailReportColumns($table, $generateFor)
    {
        $columns = [
            DB::raw('DATE_FORMAT(Call_Date_Time, "%Y-%m-%d") AS `Call Date`'),
            DB::raw('DATE_FORMAT(Call_Date_Time, "%h:%i:%s") AS `Call Time`'),
            'Campaign', 'Affiliate', 'City', 'Market', 'State', 'Zipcode',
            'Inbound AS Caller ID',
            'Type',
            'Conn_Duration AS Connection Duration',
            'Duplicate_Call AS Duplicate Call',
            'Source_Hangup AS Hangup'
        ];

        if ($generateFor === 'customer') {
            $columns[] = 'Revenue';
            $columns[] = 'call_Logs_status AS Call Status';
            $columns[] = DB::raw('(SELECT annotation_name FROM annotations WHERE annotations.id = ' . $table . '.Annotation_Tag) AS Annotation');
            $columns[] = 'Recording_Url as Recording Url';
        } else {
            $columns[] = 'payoutAmount AS Payout';
            $columns[] = 'call_Logs_status AS Call Status';
            $columns[] = DB::raw('(SELECT annotation_name FROM annotations WHERE annotations.id = ' . $table . '.Annotation_Tag) AS Annotation');
        }

        // dd($columns);

        return $columns;
    }

    protected function summary($reportOn, $data, $generateFor)
    {
        $summary = [];

        if ($reportOn === 'detail') {
            $summary = $this->detailReportSummary($data, $generateFor);
        }

        return $summary;
    }

    protected function detailReportSummary($data, $generateFor)
    {
        $revenueOrPayout = $generateFor === 'customer' ? 'Revenue' : 'Payout';
        $totalCalls      = $data->count();
        $totalMinutes    = secondToMinutes($data->sum('Connection Duration'));

        $totalRevenueOrPayout = $data->sum(function ($item) use ($revenueOrPayout) {
            return (float) $item->$revenueOrPayout;
        });

        $average = ($totalCalls > 0 && $totalRevenueOrPayout > 0) ? round(($totalRevenueOrPayout / $totalCalls), 2) : 0;
        $summary = [
            'Total Calls'                 => (string) $totalCalls,
            'Total Minutes'               => (string) $totalMinutes,
            'Total ' . $revenueOrPayout   => (string) $totalRevenueOrPayout,
            'Average ' . $revenueOrPayout => (string) $average
        ];

        return $summary;
    }

    protected function tagsData($data, $generateFor)
    {
        $revenueOrPayout = $generateFor === 'customer' ? 'Revenue' : 'Payout';
        $result          = [];

        $tagsData = $data->countBy(function ($item) {
            return $item->Annotation;
        })->map(function ($calls, $annotation) use ($data, $revenueOrPayout) {
            $revenue = $data->where('Annotation', $annotation)->sum(function ($item) use ($revenueOrPayout) {
                return (float) $item->$revenueOrPayout;
            });
            return ['calls' => $calls, 'revenue' => $revenue];
        });

        if ($tagsData->isNotEmpty()) {
            $result[] = ['Category', 'Total Calls', 'Total ' . $revenueOrPayout];
        }

        foreach ($tagsData as $key => $value) {
            if ($key != '') {
                $result[] = [$key, $value['calls'], $value['revenue']];
            }
        }

        return $result;
    }
}
