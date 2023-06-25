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
        $tagsData             = [];
        $orderType            = $request->orderType;
        $reportOn             = $request->reportOn;
        $generateFor          = $request->type;
        $nonRevenueCallsCount = 0;

        if ($orderType === 'general' && ($reportOn === 'detail' || $reportOn === 'callLength')) {
            $billedTableData     = $this->reportQuery($request, 'billed_call_logs');
            $archivedTableData   = $this->reportQuery($request, 'archived_call_logs');
            $callLogsTableData   = $this->reportQuery($request, 'ringba_call_logs');
            $exceptionsTableData = $this->reportQuery($request, 'exceptions');
            $data                = $billedTableData->merge($archivedTableData)->merge($callLogsTableData)->merge($exceptionsTableData);
        } else if ($reportOn === 'summary') {
            $data                 = $this->reportQuery($request, 'billed_call_logs');
            $nonRevenueCallsCount = $this->reportQuery($request, 'archived_call_logs')->value('count');
        } else if ($reportOn === 'exceptions') {
            $data = $this->reportQuery($request, 'exceptions');
        } else {
            $data = $this->reportQuery($request, 'billed_call_logs');
        }

        if ($reportOn != 'callLength') {
            $summary = $this->summary($reportOn, $data, $generateFor, $nonRevenueCallsCount);
        }

        if ($reportOn === 'detail') {
            $tagsData = $this->tagsData($data, $generateFor);
        }
        // dd($tagsData);

        if ($orderType === 'general' && $reportOn === 'detail') {
            $data = $data->sortBy(function ($item) {
                $callDateTime = $item->{'Call Date'} . ' ' . $item->{'Call Time'};
                return strtotime($callDateTime);
            });

            $data = [...$data];
        }

        if ($reportOn === 'callLength') {
            $dataCount = $data->count();

            if ($dataCount > 0) {
                $result      = $this->groupByCallLengthRanges($data);
                $data        = $result['data'];
                $totalPayout = $result['totalPayout'];
                $summary     = ['Total Calls'   => $dataCount, 'Total Payout' => $totalPayout];
            } else {
                $summary = ['Total Calls'   => 0, 'Total Payout' => 0];
            }
        }

        if ($reportOn === 'homesPerCall') {
            $data = $data->sortBy(function ($item) {
                return (int) (str_replace(',', '', $item->{'Average Homes Per Call'}));
            })->values();
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

        // dd($reportOn);
        // dd((empty($selectedYears) && !empty($startDate) && !empty($endDate)));

        $data = DB::table($table)
            ->when(($reportOn === 'homesPerCall'),
                fn ($query) => $query->leftJoin('t_v_households', $table . '.Market', '=', 't_v_households.market')
            )
            ->when((!empty($selectedStates) && !in_array('allStates', $selectedStates)),
                fn ($query) => $query->whereIn($table . '.State', $selectedStates)
            )
            ->when((!empty($selectedMarkets) && !in_array('allMarkets', $selectedMarkets)),
                fn ($query) => $query->whereIn($table . '.Market', $selectedMarkets)
            )
            ->when(!empty($selectedCampaigns), fn ($query) => $query->whereIn('Campaign', $selectedCampaigns))
            ->when(!empty($selectedCustomers), fn ($query) => $query->whereIn('Customer', $selectedCustomers))
            ->when((!empty($selectedAffiliate) && $selectedAffiliate != 'allAffiliates'),
                fn ($query) => $query->where('Affiliate_Id', $selectedAffiliate)
            )
            ->when(!empty($selectedDialed), fn ($query) => $query->whereIn('Dialed', $selectedDialed))
            ->when(!empty($selectedYears), fn ($query) => $query->whereIn(DB::raw('YEAR(Call_Date)'), $selectedYears))
            ->when((empty($selectedYears) && !empty($startDate) && !empty($endDate)),
                fn ($query) => $query
                    ->whereDate('Call_Date', '>=', $startDate)
                    ->whereDate('Call_Date', '<=', $endDate)
            )
            ->when(($reportOn === 'detail'),
                fn ($query) => $query
                    ->select($this->detailReportColumns($table, $generateFor))
                    ->orderBy('Call_Date_Time')
            )
            ->when(($reportOn === 'summary' && $table != 'archived_call_logs'),
                fn ($query) => $query
                    ->select($this->summaryReportColumns())
                    ->groupByRaw('EXTRACT(YEAR FROM Call_Date), EXTRACT(MONTH FROM Call_Date), Target_Number, Affiliate')
            )
            ->when(($reportOn === 'summary' && $table === 'archived_call_logs'),
                fn ($query) => $query
                    ->select(DB::raw('COUNT(*) as count'))
            )
            ->when(($reportOn === 'callLength'),
                fn ($query) => $query
                    ->select('call_Length_In_Seconds', 'payoutAmount')
            )
            ->when(($reportOn === 'homesPerCall'),
                fn ($query) => $query
                    ->select($this->homesPerCallReportColumns($table, $selectedStates))
                    ->when(!empty($selectedStates), fn ($query) => $query->groupBy('State'))
                    ->when(!empty($selectedMarkets), fn ($query) => $query->groupBy('Market'))
            )
            ->when(($reportOn === 'exceptions'),
                fn ($query) => $query->select($this->exceptionsReportColumns($table))
            )
            ->get();

        return $data;
    }

    protected function detailReportColumns($table, $generateFor)
    {
        $columns = [
            DB::raw('DATE_FORMAT(Call_Date, "%Y-%m-%d") AS `Call Date`'),
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

        return $columns;
    }

    protected function summaryReportColumns()
    {
        $columns = [
            DB::raw('DATE_FORMAT(Call_Date, "%M-%Y") AS Month'),
            'Target_Number AS Destination Number',
            'Affiliate',
            DB::raw('count(Target_Number) AS `Billable Calls`'),
            'payoutAmount AS Per Call Rate',
            DB::raw('count(Target_Number)*payoutAmount AS `Total Charge`')
        ];

        return $columns;
    }

    protected function homesPerCallReportColumns($table, $selectedStates)
    {
        $columns = [
            !empty($selectedStates) ? $table . '.State' : $table . '.Market',
            DB::raw('FORMAT(t_v_households.tv_households, 0) AS `TV Households`'),
            DB::raw('COUNT(' . $table . '.Market) AS Billed'),
            DB::raw('SUM(Revenue) AS Revenue'),
            DB::raw('CASE WHEN t_v_households.tv_households/COUNT(' . $table . '.Market) IS NOT NULL
                THEN FORMAT(t_v_households.tv_households/COUNT(' . $table . '.Market), 0) ELSE 0 END
                AS `Average Homes Per Call`'),
        ];

        return $columns;
    }

    protected function exceptionsReportColumns($table)
    {
        $columns = [
            DB::raw('DATE_FORMAT(Call_Date, "%Y-%m-%d") AS `Call Date`'),
            DB::raw('DATE_FORMAT(Call_Date_Time, "%h:%i:%s") AS `Call Time`'),
            'Campaign', 'Affiliate', 'Target',
            'Target_Description AS Target Description',
            'City', 'Market', 'State', 'Zipcode',
            'Inbound AS Caller ID',
            'Type',
            'Conn_Duration AS Connection Duration',
            'Duplicate_Call AS Duplicate Call',
            'Source_Hangup AS Hangup',
            'Revenue',
            'call_Logs_status AS Call Status',
            DB::raw('(SELECT annotation_name FROM annotations WHERE annotations.id = ' . $table . '.Annotation_Tag) AS Annotation')
        ];

        return $columns;
    }

    protected function groupByCallLengthRanges($data)
    {
        $totalCalls       = 0;
        $callLengthRanges = [[30, 60], [61, 90], [91, 120], [121, 180], [181, 240], [241, 300], [301, 360], [361, 420], [421, 480], [481, 540], [541, 600], [601, 660], [661, 720], [721, 780], [781, 840], [841, 900]];

        foreach ($callLengthRanges as $callLengthRange) {
            $groupByCallLengthRanges[$callLengthRange[0] . '-' . $callLengthRange[1]] = [
                'Range - Call Length in Seconds' => $callLengthRange[0] . '-' . $callLengthRange[1],
                'Min Length'                     => $callLengthRange[0],
                'Max Length'                     => $callLengthRange[1],
                'Total Calls'                    => 0,
                '% of all calls'                 => '0 %',
                'Total seconds'                  => 0,
                'Total Payout'                   => 0
            ];
        }

        foreach ($data as $item) {
            foreach ($callLengthRanges as $callLengthRange) {
                if ($item->call_Length_In_Seconds >= $callLengthRange[0] && $item->call_Length_In_Seconds <= $callLengthRange[1]) {
                    ++$totalCalls;
                    ++$groupByCallLengthRanges[$callLengthRange[0] . '-' . $callLengthRange[1]]['Total Calls'];
                    $groupByCallLengthRanges[$callLengthRange[0] . '-' . $callLengthRange[1]]['% of all calls'] =
                        round(($groupByCallLengthRanges[$callLengthRange[0] . '-' . $callLengthRange[1]]['Total Calls'] / $totalCalls) * 100, 2) . ' %';
                    $groupByCallLengthRanges[$callLengthRange[0] . '-' . $callLengthRange[1]]['Total seconds'] += $item->call_Length_In_Seconds;
                    $groupByCallLengthRanges[$callLengthRange[0] . '-' . $callLengthRange[1]]['Total Payout'] += (float) $item->payoutAmount;
                }
            }
        }

        $data        = collect($groupByCallLengthRanges)->values();
        $totalPayout = $data->sum('Total Payout');

        return ['data' => $data, 'totalPayout' => $totalPayout];
    }

    protected function summary($reportOn, $data, $generateFor, $nonRevenueCallsCount)
    {
        $summary = [];

        if ($reportOn === 'detail') {
            $summary = $this->detailReportSummary($data, $generateFor);
        } elseif ($reportOn === 'summary') {
            $summary = $this->summaryReportSummary($data, $nonRevenueCallsCount);
        } elseif ($reportOn === 'homesPerCall') {
            $summary = $this->homesPerCallReportSummary($data);
        } elseif ($reportOn === 'exceptions') {
            $summary = $this->exceptionsReportSummary($data);
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

    protected function summaryReportSummary($data, $nonRevenueCallsCount)
    {
        $billableCalls = $totalCharge = 0;

        foreach ($data as $item) {
            $billableCalls += (int) $item->{'Billable Calls'};
            $totalCharge   += (float) $item->{'Total Charge'};
        }

        $summary = [
            'Billable Calls'    => $billableCalls,
            'Total Charge'      => $totalCharge,
            'Non Revenue Calls' => $nonRevenueCallsCount
        ];

        return $summary;
    }

    protected function homesPerCallReportSummary($data)
    {
        $totalTVHouseholds = $totalBilled = $averageHomesPerCall = $totalRevenue = 0;

        foreach ($data as $item) {
            $totalTVHouseholds += (int) (str_replace(',', '', $item->{'TV Households'}));
            $totalBilled       += (int) $item->Billed;
            $totalRevenue      += (float) $item->Revenue;
        }

        if ($totalTVHouseholds > 0 && $totalBilled > 0) {
            $averageHomesPerCall = round(($totalTVHouseholds / $totalBilled));
        }

        $summary = [
            'Total TV Households'    => (string) number_format($totalTVHouseholds),
            'Total Billed'           => (string) $totalBilled,
            'Average Homes Per Call' => (string) number_format($averageHomesPerCall),
            'Total Revenue'          => (string) $totalRevenue
        ];

        return $summary;
    }

    protected function exceptionsReportSummary($data)
    {
        $totalCalls = $totalSeconds = $totalRevenue = $averageRevenue = 0;

        foreach ($data as $item) {
            $totalCalls++;
            $totalSeconds += $item->{'Connection Duration'};
            $totalRevenue += $item->Revenue;
        }

        if ($totalCalls > 0 && $totalRevenue > 0) {
            $averageRevenue = $totalRevenue / $totalCalls;
        }

        $summary = [
            'Total Calls'     => (string) $totalCalls,
            'Total Minutes'   => (string) secondToMinutes($totalSeconds),
            'Total Revenue'   => (string) $totalRevenue,
            'Average Revenue' => (string) $averageRevenue
        ];

        return $summary;
    }
}
