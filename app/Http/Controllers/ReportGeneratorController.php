<?php

namespace App\Http\Controllers;

use App\Models\ArchivedCallLog;
use App\Models\BilledCallLog;
use App\Models\BroadCastMonth;
use App\Models\Campaign;
use App\Models\Affiliate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\SendMailController;
use App\Models\ZipcodeByTelevisionMarket;

class ReportGeneratorController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function destinationReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign_id'));
        $broadCastMonths = [];
        if ($request->input('broad_cast_month')) {
            $broadCastMonths = BroadCastMonth::whereIn('broad_cast_month', $request->input('broad_cast_month'))
                ->select(['end_date', 'start_date', 'broad_cast_month'])
                ->get();
        }

        $destinationReport = BilledCallLog::query()
            ->where([
                'Campaign' => $campaign->campaign_name,
                'Customer' => $request->input('customer_name'),
            ])->where(function ($query) use ($broadCastMonths) {
                if (count($broadCastMonths)) {
                    $query->where([
                        ['Call_Date', '>=', $broadCastMonths->first()->start_date],
                        ['Call_Date', '<=', $broadCastMonths->first()->end_date]
                    ]);
                }
                if (count($broadCastMonths) > 1) {
                    foreach ($broadCastMonths->skip(1) as $broadCastMonth) {
                        $query->orWhere([
                            ['Call_Date', '>=', $broadCastMonth->start_date],
                            ['Call_Date', '<=', $broadCastMonth->end_date]
                        ]);
                    }
                }
            })
            ->groupByRaw('extract(year from Call_Date), extract(month from Call_Date), Target_Number, Affiliate')
            ->selectRaw("DATE_FORMAT(Call_Date, '%M-%Y') as Month, Target_Number as 'Destination_Number', Affiliate, count(Target_Number) as 'Billable_Calls', payoutAmount as 'Per_Call_Rate', count(Target_Number)*payoutAmount as 'Total_Charge'")
            ->get();

        $call_summary = [];
        $call_summary['Billable Calls'] = 0;
        $call_summary['Total Charges'] = 0;
        $call_summary['Non-revenue Calls'] = ArchivedCallLog::query()
            ->where([
                'Campaign' => $campaign->campaign_name,
                'Customer' => $request->input('customer_name'),
            ])->where(function ($query) use ($broadCastMonths) {
                if (count($broadCastMonths)) {
                    $query->where([
                        ['Call_Date', '>=', $broadCastMonths->first()->start_date],
                        ['Call_Date', '<=', $broadCastMonths->first()->end_date]
                    ]);
                }
                if (count($broadCastMonths) > 1) {
                    foreach ($broadCastMonths->skip(1) as $broadCastMonth) {
                        $query->orWhere([
                            ['Call_Date', '>=', $broadCastMonth->start_date],
                            ['Call_Date', '<=', $broadCastMonth->end_date]
                        ]);
                    }
                }
            })
            ->get()->count();

        if ($destinationReport->count() < 1) {
            return response()->json(['status' => 500, 'msg' => 'No data found for the selected criteria']);
        }
        foreach ($destinationReport as $destinationData) {
            $call_summary['Billable Calls'] += $destinationData->Billable_Calls;
            $call_summary['Total Charges'] += $destinationData->Total_Charge;
        }
        $columns = ['Month', 'Destination_Number', 'Affiliate', 'Billable_Calls', 'Per_Call_Rate', 'Total_Charge'];
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Summary of Calls'] = '   ';
            $newSummary['Billable Calls'] = $call_summary['Billable Calls'];
            $newSummary['Total Charges'] = $call_summary['Total Charges'];
            $newSummary['Non-revenue Calls'] = $call_summary['Non-revenue Calls'];
            $sendMailCtrl = new sendMailController();
            $sendMailCtrl->SendMail(collect($destinationReport), $newSummary, [], $columns, $request->file_name, $request->emails);
            return;
        }
        return [
            'data'         => $destinationReport,
            'call_summary' => $call_summary,
        ];
    }

    public function callLengthReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign'));
        $report_type = $request->type; // billed or general
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $dNumber = $request->destination_number;
        $year = [];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year = [];
        } else {
            $year = $request->year;
        }
        // summary of calls
        $archived = [];
        $call_summary = [];
        $condition = [];
        $whereIn = [];
        $whereInOr = [];
        $call_summary['Customer Name'] = $customer_name;
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date = date('Y-m-d', strtotime($request->start_date));
            $end_date = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range'] = $date_range;
            $condition[] = "Call_Date >='$start_date'";
            $condition[] = "Call_Date <= '$end_date'";
        }
        if (!empty($year) && count($year) > 0 && $year[0] !== null) {
            for ($i = 0; $i < count($year); $i++) {
                $whereInOr[] = "Call_Date Like '%{$year[$i]}%'";
            }
        }

        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name !== null) {
            $condition[] = "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }
        if ($dNumber !== null) {
            $condition[] = "Target_Number='{$dNumber}'";
        }
        // category of calls
        $total_call_records = [];

        if ($report_type === 'billed') {
            $billed = $this->callLengthReportData('billed_call_logs', $condition, $whereIn, $whereInOr);
            $total_call_records = $billed;
        } else {
            $callLogs = $this->callLengthReportData('ringba_call_logs', $condition, $whereIn, $whereInOr);
            $billed = $this->callLengthReportData('billed_call_logs', $condition, $whereIn, $whereInOr);
            $archived = $this->callLengthReportData('archived_call_logs', $condition, $whereIn, $whereInOr);
            $exceptions = $this->callLengthReportData('exceptions', $condition, $whereIn, $whereInOr);
            $total_call_records = array_merge($total_call_records, $callLogs, $billed, $archived, $exceptions);
        }

        $call_length_array = [
            [
                'minLength' => 30,
                'maxLength' => 60,
            ],
            [
                'minLength' => 61,
                'maxLength' => 90,
            ],
            [
                'minLength' => 91,
                'maxLength' => 120,
            ],
            [
                'minLength' => 121,
                'maxLength' => 180,
            ],
            [
                'minLength' => 181,
                'maxLength' => 240,
            ],
            [
                'minLength' => 241,
                'maxLength' => 300,
            ],
            [
                'minLength' => 301,
                'maxLength' => 360,
            ],
            [
                'minLength' => 361,
                'maxLength' => 420,
            ],
            [
                'minLength' => 421,
                'maxLength' => 480,
            ],
            [
                'minLength' => 481,
                'maxLength' => 540,
            ],
            [
                'minLength' => 541,
                'maxLength' => 600,
            ],
            [
                'minLength' => 601,
                'maxLength' => 660,
            ],
            [
                'minLength' => 661,
                'maxLength' => 720,
            ],
            [
                'minLength' => 721,
                'maxLength' => 780,
            ],
            [
                'minLength' => 781,
                'maxLength' => 840,
            ],
            [
                'minLength' => 841,
                'maxLength' => 900,
            ]
        ];
        $sum_of_total_calls = 0;
        $summary_total_payouts = 0;

        $finalArray = [];
        foreach ($call_length_array as $item) {
            $finalArray[$item['minLength'] . '_' . $item['maxLength']] = (object)[
                'Range - Call Length in Seconds'=> $item['minLength'] . '-' . $item['maxLength'],
                'Min Length'                    => $item['minLength'],
                'Max Length'                    => $item['maxLength'],
                'Total Calls'                   => 0,
                '% of all calls'                => 0,
                'Total seconds'                 => 0,
                'Total Payout'                  => 0,
            ];
            $total_calls = 'Total Calls';
            $percent_of_calls = '% of all calls';
            $total_seconds = 'Total seconds';
            $total_payouts = 'Total Payout';
            foreach ($total_call_records as $record) {
                if ($record->call_Length_In_Seconds >= $item['minLength'] && $record->call_Length_In_Seconds <= $item['maxLength']) {
                    $finalArray[$item['minLength'] . '_' . $item['maxLength']]->$total_calls++;
                    $finalArray[$item['minLength'] . '_' . $item['maxLength']]->$total_seconds += $record->call_Length_In_Seconds;
                    $finalArray[$item['minLength'] . '_' . $item['maxLength']]->$total_payouts += $record->payoutAmount;
                    $summary_total_payouts += $record->payoutAmount;
                    $sum_of_total_calls += 1;
                }
            }
        }
        if (empty($sum_of_total_calls)) {
            return response()->json(['status' => 500, 'msg' => 'No data found for the selected criteria']);
        }
        foreach ($call_length_array as $item) {
            $finalArray[$item['minLength'] . '_' . $item['maxLength']]->$percent_of_calls = round(($finalArray[$item['minLength'] . '_' . $item['maxLength']]->$total_calls * 100) /
            $sum_of_total_calls, 1) . '%';
        }

        $call_summary_affiliates = [];
        $affiliates = Affiliate::all();
        if (!empty($affiliate_ids)) {
            foreach ($affiliate_ids as $id) {
                foreach ($affiliates as $affiliate) {
                    if ($affiliate->affiliate_id == $id) {
                        array_push($call_summary_affiliates, $affiliate->affiliate_name);
                    }
                }
            }
        }

        $call_summary['Campaign Name'] = $request->campaign_name;
        $call_summary['Date Range'] = $request->campaign_name;
        $call_summary['Total Calls'] = count($total_call_records);
        $call_summary['Total Payout'] = $summary_total_payouts;
        $call_summary['Destination Number'] = $request->destination_number;
        $call_summary['Affiliates'] = implode(',', $call_summary_affiliates);
        $columns = ['Range - Call Length in Seconds', 'Min Length', 'Max Length', 'Total Calls', '% of all calls', 'Total seconds', 'Total Payout'];
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Summary of Calls'] = '   ';
            $newSummary['Customer Name'] = $call_summary['Customer Name'];
            $newSummary['Campaign Name'] = $call_summary['Campaign Name'];
            $newSummary['Total Calls'] = $call_summary['Total Calls'];
            $newSummary['Total Payout'] = $call_summary['Total Payout'];
            $newSummary['Destination Number'] = $call_summary['Destination Number'];
            $newSummary['Affiliates'] = $call_summary['Affiliates'];
            $sendMailCtrl = new sendMailController();
            $sendMailCtrl->SendMail(collect($finalArray), $newSummary, [], $columns, $request->file_name, $request->emails);
            return;
        }
        return [
            'data'        => $finalArray,
            'call_summary'=> $call_summary,

        ];
    }

    private function callLengthReportData($tablename, $condition, $whereIn = [], $whereInOr = [])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . ' AND ';
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . ' AND ';
            }
        }
        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . ' OR ';
            }
        }

        $con = rtrim($con, ' AND ');
        $con = rtrim($con, ' OR ');

        $sql = "SELECT annotations.annotation_name, Call_Date AS 'Call Date(EST)', Call_Date_Time AS 'Call Time', Campaign, Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID', Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup', payoutAmount AS 'Payout', call_Logs_status AS 'Call Status', Annotation_Tag AS 'Call Type', Has_Annotation AS 'Has Annotation',Target_Number,call_Length_In_Seconds,payoutAmount
        FROM {$tablename}
        LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id
        WHERE {$con}";
        return DB::select($sql);
    }

    public function marketTargetReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign'));
        $market_name = $request->market;
        $state_name = $request->state;
        $newData = [];
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $target_name = $request->target_name; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $year = [];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year = [];
        } else {
            $year = $request->year;
        }
        $call_summary = [];
        $call_summary[' '] = ' ';
        $call_summary['  '] = '  ';
        $call_summary['   '] = '   ';
        $condition = [];
        $whereIn = [];
        $whereInOr = [];
        $whereInHouseholds = [];
        if ($campaign) {
            $call_summary['Campaign Name:'] = $campaign;
        }
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date = date('Y-m-d', strtotime($request->start_date));
            $end_date = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range'] = $date_range;
            $condition[] = "Call_Date >='$start_date'";
            $condition[] = "Call_Date <= '$end_date'";
        }

        if (!empty($year) && count($year) > 0 && $year[0] !== null) {
            for ($i = 0; $i < count($year); $i++) {
                $whereInOr[] = "Call_Date Like '%{$year[$i]}%'";
            }
        }

        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if (!empty($market_name) && count($market_name) > 0 && $market_name[0] !== null) {
            $market_name_inputs = implode("','", $market_name);
            $whereInHouseholds[] = "t_v_households.Market IN ('$market_name_inputs')";
        }
        if (!empty($state_name) && count($state_name) > 0 && $state_name[0] !== null) {
            $state_name_inputs = implode("','", $state_name);
            $whereInHouseholds[] = "t_v_households.State IN ('$state_name_inputs')";
        }

        if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name !== null) {
            $condition[] = "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }
        if (!empty($state_name) && count($state_name) > 0 && $state_name[0] !== null) {
            $billed = $this->marketTargetReportData('billed_call_logs', $condition, $whereIn, $whereInOr, $whereInHouseholds, 'state');
        } elseif (!empty($market_name) && count($market_name) > 0 && $market_name[0] !== null) {
            $billed = $this->marketTargetReportData('billed_call_logs', $condition, $whereIn, $whereInOr, $whereInHouseholds, 'market');
        }
        $totalNielsenTVHouseholds = 0;
        $totalBilledCalls = 0;
        $totalRevenue = 0;

        foreach ($billed as $bill) {
            if ($request->start_date !== null) {
                $newData[] = (object)[
                    'Date Range'                             => $request->start_date . ' - ' . $request->end_date,
                    !empty($market_name) ? 'Market' : 'State'=> !empty($market_name) ? $bill->Market : $bill->State,
                    'Nielsen TV Households'                  => number_format($bill->households, 0, '.', ','),
                    'Billed'                                 => $bill->Billed,
                    'Total Revenue'                          => $bill->Revenue,
                    'Average Homes Per Call'                 => number_format(ceil($bill->households / $bill->Billed), 0, '.', ','),
                ];
                $totalNielsenTVHouseholds += $bill->households;
                $totalBilledCalls += $bill->Billed;
                $totalRevenue += $bill->Revenue;
            } elseif ($request->year !== null) {
                $newData[] = (object)[
                    'Date Range'                             => 'years(' . implode(',', $request->year) . ')',
                    !empty($market_name) ? 'Market' : 'State'=> !empty($market_name) ? $bill->Market : $bill->State,
                    'Nielsen TV Households'                  => number_format($bill->households, 0, '.', ','),
                    'Billed'                                 => $bill->Billed,
                    'Total Revenue'                          => $bill->Revenue,
                    'Average Homes Per Call'                 => number_format(ceil($bill->households / $bill->Billed), 0, '.', ','),
                ];
                $totalNielsenTVHouseholds += $bill->households;
                $totalBilledCalls += $bill->Billed;
                $totalRevenue += $bill->Revenue;
            } else {
                $newData[] = (object)[
                    'Date Range'                             => 'all',
                    !empty($market_name) ? 'Market' : 'State'=> !empty($market_name) ? $bill->Market : $bill->State,
                    'Nielsen TV Households'                  => number_format($bill->households, 0, '.', ','),
                    'Billed'                                 => $bill->Billed,
                    'Total Revenue'                          => $bill->Revenue,
                    'Average Homes Per Call'                 => number_format(ceil($bill->households / $bill->Billed), 0, '.', ','),
                ];
                $totalNielsenTVHouseholds += $bill->households;
                $totalBilledCalls += $bill->Billed;
                $totalRevenue += $bill->Revenue;
            }
        }

        if (empty($billed)) {
            return response()->json(['status' => 500, 'msg' => 'No data found for the selected criteria']);
        }

        $call_summary['Total Nielsen TV Homes:'] = number_format($totalNielsenTVHouseholds, 0, '.', ',');
        $call_summary['Total Billed Calls:'] = $totalBilledCalls;
        $call_summary['Average Homes Per call:'] = number_format(ceil($totalNielsenTVHouseholds / $totalBilledCalls), 0, '.', ',');
        $call_summary['Total Revenue:'] = $totalRevenue;
        $collection = collect($newData)->sortBy('Average Homes Per Call');
        $columns = ['Date Range', $market_name ? 'Market' : 'State', 'Nielsen TV Households', 'Billed', 'Total Revenue', 'Average Homes Per Call'];
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Total Nielsen TV Homes:'] = $call_summary['Total Nielsen TV Homes:'];
            $newSummary['Total Billed Calls:'] = $call_summary['Total Billed Calls:'];
            $newSummary['Average Homes Per call:'] = $call_summary['Average Homes Per call:'];
            $newSummary['Total Revenue:'] = $call_summary['Total Revenue:'];
            $sendMailCtrl = new sendMailController();
            $sendMailCtrl->SendMail($collection, $newSummary, [], $columns, $request->file_name, $request->emails);
            return;
        }
        return [
            'data'         => $collection->values()->all(),
            'call_summary' => $call_summary
        ];
    }

    private function marketTargetReportData($tablename, $condition, $whereIn = [], $whereInOr = [], $whereInHouseholds = [], $type)
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . ' AND ';
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . ' AND ';
            }
        }
        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . ' OR ';
            }
        }
        $householdsCon = '';
        if (count($whereInHouseholds) > 0) {
            foreach ($whereInHouseholds as $value) {
                $householdsCon .= $value . ' AND ';
            }
        }

        $con = rtrim($con, ' AND ');
        $con = rtrim($con, ' OR ');
        $householdsCon = rtrim($householdsCon, ' AND ');
        if ($type === 'state') {
            $query1 = "SELECT State, COUNT(State) AS Billed,SUM(Revenue) AS Revenue FROM billed_call_logs LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id Where {$con}
            GROUP BY State";
            $query2 = "SELECT state AS State, SUM(tv_households) as tv_households FROM `t_v_households` WHERE {$householdsCon}  GROUP BY State ";
            $query1Result = DB::select($query1);
            $query2Result = DB::select($query2);
            $a = [];
            $finalArray = [];
            foreach ($query2Result as $households) {
                $a[$households->State] = $households->tv_households;
            }
            foreach ($query1Result as $bill) {
                if (array_key_exists($bill->State, $a)) {
                    $bill->households = $a[$bill->State];
                    array_push($finalArray, $bill);
                }
            }
            return $finalArray;
        } else {
            $sql = "SELECT t_v_households.tv_households as households, Call_Date AS 'Call Date(EST)',{$tablename}.Market, {$tablename}.State, Revenue,SUM(Revenue) AS Revenue, Count({$tablename}.Market) AS 'Billed'
            FROM {$tablename}
            LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id 
            LEFT JOIN t_v_households ON {$tablename}.Market = t_v_households.market
            WHERE {$con} GROUP BY {$tablename}.Market";
            return DB::select($sql);
        }
    }

    public function affiliateReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign'));
        $newData = [];
        $report_type = $request->type; // billed or general
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $target_name = $request->target_name; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $year = [];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year = [];
        } else {
            $year = $request->year;
        }
        // summary of calls
        $archived = [];
        $call_summary = [];
        $condition = [];
        $whereIn = [];
        $whereInOr = [];
        $call_summary['Customer Name'] = $customer_name;
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date = date('Y-m-d', strtotime($request->start_date));
            $end_date = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range'] = $date_range;
            $condition[] = "Call_Date >='$start_date'";
            $condition[] = "Call_Date <= '$end_date'";
        }

        if (!empty($year) && count($year) > 0 && $year[0] !== null) {
            for ($i = 0; $i < count($year); $i++) {
                $whereInOr[] = "Call_Date Like '%{$year[$i]}%'";
            }
        }

        if ($campaign) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if ($annotation) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name) {
            $condition[] = "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }

        $total_call = 0;
        $total_seconds = 0;
        $total_revenue = 0;
        $archive_call = ['name' => '', 'qty' => 0, 'revenue' => (float)0.00];

        // category of calls
        $annotation_tags_array = [];
        $tag_count = [];

        if ($report_type === 'billed') {
            $billed = $this->affiliateReportData('billed_call_logs', $condition, $whereIn, $whereInOr);
        } else {
            $callLogs = $this->affiliateReportData('ringba_call_logs', $condition, $whereIn, $whereInOr);
            $billed = $this->affiliateReportData('billed_call_logs', $condition, $whereIn, $whereInOr);
            $archived = $this->affiliateReportData('archived_call_logs', $condition, $whereIn, $whereInOr);
            $exceptions = $this->affiliateReportData('exceptions', $condition, $whereIn, $whereInOr);
        }

        $target_description = 'Target Description';
        $annotation_tag = 'Call Type';
        $payout_amount = 'Payout';
        $conn_duration = 'Connection Duration';
        $has_annotation = 'Has Annotation';

        // for billed
        foreach ($billed as $bill) {
            $TargetDescription = $bill->$target_description;
            $call_summary['Targets'] = $TargetDescription;
            $annotationTag = $bill->annotation_name;
            $bill->$annotation_tag = $bill->annotation_name;
            unset($bill->annotation_name, $bill->$target_description);

            if ($annotation !== 'yes') {
                unset($bill->annotation_name, $bill->$has_annotation);
            } else {
                unset($bill->$has_annotation);
            }
            unset($bill->Target);
            array_push($newData, $bill);

            if (!empty($annotationTag)) {
                array_push($annotation_tags_array, $annotationTag);
            }
            if (in_array($annotationTag, $annotation_tags_array)) {
                $tag_count[$annotationTag]['name'] = $annotationTag;
                $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $bill->$payout_amount;
            }
            $total_call++;
            $total_seconds += $bill->$conn_duration;
            $total_revenue += (int)$bill->$payout_amount;
        }

        // for archived
        if (!empty($callLogs)) {
            foreach ($callLogs as $callLog) {
                $TargetDescription = $callLog->$target_description;
                $annotationTag = $callLog->annotation_name;
                $callLog->$annotation_tag = $callLog->annotation_name;
                unset($callLog->annotation_name, $callLog->$target_description);

                if ($annotation !== 'yes') {
                    unset($callLog->annotation_name, $callLog->$has_annotation);
                } else {
                    unset($callLog->$has_annotation);
                }
                unset($callLog->Target);
                array_push($newData, $callLog);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $callLog->$payout_amount;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$callLog->$payout_amount;
                }

                $total_call++;
                $total_seconds += $callLog->$conn_duration;
                $total_revenue += (int)$callLog->$payout_amount;
            }
        }

        // for archived
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                $annotationTag = $archive->annotation_name;
                $archive->$annotation_tag = $archive->annotation_name;
                unset($archive->annotation_name, $archive->$target_description);

                if ($annotation !== 'yes') {
                    unset($archive->annotation_name, $archive->$has_annotation);
                } else {
                    unset($archive->$has_annotation);
                }
                unset($archive->Target);
                array_push($newData, $archive);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $archive->$payout_amount;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$archive->$payout_amount;
                }

                $total_call++;
                $total_seconds += $archive->$conn_duration;
                $total_revenue += (int)$archive->$payout_amount;
            }
        }
        // for exceptions
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->annotation_name;
                $exception->$annotation_tag = $exception->annotation_name;
                unset($exception->annotation_name, $exception->$target_description);

                if ($annotation !== 'yes') {
                    unset($exception->annotation_name, $exception->$has_annotation);
                } else {
                    unset($exception->$has_annotation);
                }
                unset($exception->Target);
                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $exception->$payout_amount;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$exception->$payout_amount;
                }

                $total_call++;
                $total_seconds += $exception->$conn_duration;
                $total_revenue += (int)$exception->$payout_amount;
            }
        }

        $avg_revenue_amount = $total_revenue > 0 ? $total_revenue / $total_call : 0;
        $call_summary['Total number of calls'] = $total_call;
        $call_summary['Total Minutes'] = secondToMinutes($total_seconds);
        $call_summary['Total payout amount'] = (float)number_format($total_revenue, 2, '.', '');
        $call_summary['Average payout per call'] = (float)number_format($avg_revenue_amount, 2, '.', '');
        if (empty($newData)) {
            return response()->json(['status' => 500, 'msg' => 'No data found for the selected criteria']);
        }
        $columns = ['Call Date(EST)', 'Call Time', 'Campaign', 'Affiliate', 'Target', 'Target Description', 'City', 'Market', 'State', 'Zipcode', 'Caller ID', 'Type', 'Connection Duration', 'Duplicate Call', 'Hangup', 'Payout', 'Call Status', 'Call Type'];
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Summary of Calls'] = '';
            $newSummary['Customer Name'] = $call_summary['Customer Name'];
            $newSummary['Targets'] = $call_summary['Targets'];
            $newSummary['Total number of calls'] = $call_summary['Total number of calls'];
            $newSummary['Total Minutes'] = $call_summary['Total Minutes'];
            $newSummary['Total payout amount'] = $call_summary['Total payout amount'];
            $newSummary['Average payout per call'] = $call_summary['Average payout per call'];
            $sendMailCtrl = new sendMailController();
            $sendMailCtrl->SendMail(collect($newData), $newSummary, $tag_count, $columns, $request->file_name, $request->emails);
            return;
        }
        return [
            'data'         => $newData,
            'call_summary' => $call_summary,
            'tag_count'    => $tag_count
        ];
    }

    //TODO target report generate

    private function affiliateReportData($tablename, $condition, $whereIn = [], $whereInOr = [])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . ' AND ';
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . ' AND ';
            }
        }
        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . ' OR ';
            }
        }
        $con = rtrim($con, ' AND ');
        $con = rtrim($con, ' OR ');
        $sql = "SELECT annotations.annotation_name, Call_Date AS 'Call Date(EST)', Call_Date_Time AS 'Call Time', Campaign, Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID', Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup', payoutAmount AS 'Payout', call_Logs_status AS 'Call Status', Annotation_Tag AS 'Call Type', Has_Annotation AS 'Has Annotation'
        FROM {$tablename}
        LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id
        WHERE {$con}";
        return DB::select($sql);
    }

    public function targetReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign'));

        $newData = [];
        $report_type = $request->type; // billed or general
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $target_name = $request->target_name; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $year = [];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year = [];
        } else {
            $year = $request->year;
        }

        // summary of calls
        $archived = [];
        $call_summary = [];
        $condition = [];
        $whereIn = [];
        $whereInOr = [];

        $call_summary['Customer Name'] = $customer_name;
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date = date('Y-m-d', strtotime($request->start_date));
            $end_date = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range'] = $date_range;
            $condition[] = "Call_Date >='$start_date'";
            $condition[] = "Call_Date <= '$end_date'";
        }
        if (!empty($year) && count($year) > 0 && $year[0] !== null) {
            for ($i = 0; $i < count($year); $i++) {
                $whereInOr[] = "Call_Date Like '%{$year[$i]}%'";
            }
        }
        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name !== null) {
            $condition[] = "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }

        $total_call = 0;
        $total_seconds = 0;
        $total_revenue = 0;
        $archive_call = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float)0.00];

        // category of calls
        $annotation_tags_array = [];
        $tag_count = [];

        if ($report_type === 'billed') {
            $billed = $this->targetReportData('billed_call_logs', $condition, $whereIn, $whereInOr);
        } else {
            $callLogs = $this->targetReportData('ringba_call_logs', $condition, $whereIn, $whereInOr);
            $billed = $this->targetReportData('billed_call_logs', $condition, $whereIn, $whereInOr);
            $archived = $this->targetReportData('archived_call_logs', $condition, $whereIn, $whereInOr);
            $exceptions = $this->targetReportData('exceptions', $condition, $whereIn, $whereInOr);
        }
        $target_description = 'Target Description';
        $annotation_tag = 'Annotation';
        $conn_duration = 'Connection Duration';
        $has_annotation = 'Has Annotation';

        // for billed
        foreach ($billed as $bill) {
            $TargetDescription = $bill->$target_description;
            $annotationTag = $bill->annotation_name;
            $bill->$annotation_tag = $bill->annotation_name;
            unset($bill->annotation_name, $bill->$target_description);

            if ($annotation !== 'yes') {
                unset($bill->$has_annotation);
            } else {
                unset($bill->$has_annotation);
            }
            unset($bill->Target);
            array_push($newData, $bill);

            if (!empty($annotationTag)) {
                array_push($annotation_tags_array, $annotationTag);
            }
            if (in_array($annotationTag, $annotation_tags_array)) {
                $tag_count[$annotationTag]['name'] = $annotationTag;
                $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$bill->Revenue;
            }
            $total_call++;
            $total_seconds += $bill->$conn_duration;
            $total_revenue += (int) $bill->Revenue;
        }

        // for callLogs
        if (!empty($callLogs)) {
            foreach ($callLogs as $callLog) {
                $TargetDescription = $callLog->$target_description;
                $annotationTag = $callLog->annotation_name;
                $callLog->$annotation_tag = $callLog->annotation_name;
                unset($callLog->annotation_name, $callLog->$target_description);

                if ($annotation !== 'yes') {
                    unset($callLog->$has_annotation);
                } else {
                    unset($callLog->$has_annotation);
                }
                unset($callLog->Target);
                array_push($newData, $callLog);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += (int)$callLog->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$callLog->Revenue;
                }

                $total_call++;
                $total_seconds += $callLog->$conn_duration;
                $total_revenue += (int)$callLog->Revenue;
            }
        }

        // for archived
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                $annotationTag = $archive->annotation_name;
                $archive->$annotation_tag = $archive->annotation_name;
                unset($archive->annotation_name, $archive->$target_description);

                if ($annotation !== 'yes') {
                    unset($archive->$has_annotation);
                } else {
                    unset($archive->$has_annotation);
                }
                unset($archive->Target);
                array_push($newData, $archive);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += (int) $archive->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$archive->Revenue;
                }

                $total_call++;
                $total_seconds += $archive->$conn_duration;
                $total_revenue += (int)$archive->Revenue;
            }
        }
        // for exceptions
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->annotation_name;
                $exception->$annotation_tag = $exception->annotation_name;
                unset($exception->annotation_name, $exception->$target_description);

                if ($annotation !== 'yes') {
                    unset($exception->$has_annotation);
                } else {
                    unset($exception->$has_annotation);
                }
                unset($exception->Target);
                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += (int) $exception->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int)$exception->Revenue;
                }
                $total_call++;
                $total_seconds += $exception->$conn_duration;
                $total_revenue += (int)$exception->Revenue;
            }
        }

        $avg_revenue_amount = $total_revenue > 0 ? $total_revenue / $total_call : 0;
        $call_summary['Total number of calls'] = $total_call;
        $call_summary['Total Minutes'] = secondToMinutes($total_seconds);

        $call_summary['Total Revenue'] = (float)number_format($total_revenue, 2, '.', '');
        $call_summary['Avg Revenue Amount'] = (float)number_format($avg_revenue_amount, 2, '.', '');

        if (empty($newData)) {
            return response()->json(['status' => 500, 'msg' => 'No data found for the selected criteria']);
        }
        $columns = ['Call Date(EST)', 'Call Time', 'Campaign', 'Affiliate', 'City', 'Market', 'State', 'Zipcode', 'Caller ID', 'Type', 'Connection Duration', 'Duplicate Call', 'Hangup', 'Revenue', 'Call Status', 'Annotation', 'Recording Url'];
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Summary of Calls'] = '';
            $newSummary['Customer Name'] = $call_summary['Customer Name'];
            $newSummary['Total number of calls'] = $call_summary['Total number of calls'];
            $newSummary['Total Minutes'] = $call_summary['Total Minutes'];
            $newSummary['Total Revenue'] = $call_summary['Total Revenue'];
            $newSummary['Avg Revenue Amount'] = $call_summary['Avg Revenue Amount'];
            $sendMailCtrl = new sendMailController();
            $sendMailCtrl->SendMail(collect($newData), $newSummary, $tag_count, $columns, $request->file_name, $request->emails);
            return;
        }

        return [
            'data'         => $newData,
            'call_summary' => $call_summary,
            'tag_count'    => $tag_count
        ];
    }

    private function targetReportData($tablename, $condition, $whereIn = [], $whereInOr = [])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . ' AND ';
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . ' AND ';
            }
        }
        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . ' OR ';
            }
        }
        $con = rtrim($con, ' AND ');
        $con = rtrim($con, ' OR ');

        $sql = "SELECT annotations.annotation_name, Call_Date AS 'Call Date(EST)' , Call_Date_Time AS 'Call Time', Campaign,Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID',Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup',Revenue, call_Logs_status AS 'Call Status',Annotation_Tag AS 'Annotation',Has_Annotation AS 'Has Annotation',Recording_Url as 'Recording Url'
        FROM {$tablename}
        LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id
        WHERE {$con}";

        return DB::select($sql);
    }

    public function marketExceptionReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign'));
        $newData = [];
        if (in_array('allMarkets', $request->market)) {
            $all_markets = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
            $market_name=$all_markets->pluck('market')->toArray();
        } else {
            $market_name = $request->market;
        }
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $target_name = $request->target_name; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $year = [];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year = [];
        } else {
            $year = $request->year;
        }
        $broad_cast_month = $request->input('broad_cast_month');

        // summary of calls
        $call_summary = [];
        $condition = [];
        $whereIn = [];
        $whereInOr = [];

        if (!empty($market_name) && count($market_name) > 0 && $market_name[0] !== null) {
            $market_name_inputs = implode("','", $market_name);
            $whereIn[] = "Market IN ('$market_name_inputs')";
        }
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date = date('Y-m-d', strtotime($request->start_date));
            $end_date = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range'] = $date_range;
        }
        if (!empty($year) && count($year) > 0 && $year[0] !== null) {
            for ($i = 0; $i < count($year); $i++) {
                $whereInOr[] = "Call_Date Like '%{$year[$i]}%'";
            }
        }

        if (!empty($broad_cast_month) && count($broad_cast_month) > 0 && $broad_cast_month[0] !== null) {
            $broadCastMonths = BroadCastMonth::whereIn('broad_cast_month', $request->input('broad_cast_month'))
                ->select(['end_date', 'start_date', 'broad_cast_month'])->get();

            $broadCastMonthCondition = '';
            foreach ($broadCastMonths as $broadCastMonth) {
                $broadCastMonthCondition .= "(Call_Date >='$broadCastMonth->start_date'" . ' AND ' . "Call_Date <= '$broadCastMonth->end_date')" . ' OR ';
            }

            $condition[] = '(' . rtrim($broadCastMonthCondition, ' OR') . ')';
        }

        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }

        if (!empty($annotation) && count($annotation) > 0 && $annotation[0] !== null) {
            $annotation_inputs = implode("','", $annotation);
            $whereIn[] = "Has_Annotation IN ('$annotation_inputs')";
        }
        if ($customer_name !== null) {
            $condition[] = "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }

        $total_call = 0;
        $total_seconds = 0;
        $total_revenue = 0;
        $target = '';
        $archive_call = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float)0.00];

        // category of calls
        $annotation_tags_array = [];
        $tag_count = [];

        $exceptions = $this->marketExceptionReportData('exceptions', $condition, $whereIn, $whereInOr);
        $annotation_tag = 'Annotation';
        $conn_duration = 'Connection Duration';
        // for exceptions
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->annotation_name;
                $exception->$annotation_tag = $exception->annotation_name;
                unset($exception->annotation_name, $exception->annotation_name);

                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += (int) $exception->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }

                $total_call++;
                $total_seconds += $exception->$conn_duration;
                $total_revenue += (int)$exception->Revenue;
            }
        }

        $avg_revenue_amount = $total_revenue > 0 ? $total_revenue / $total_call : 0;
        $call_summary['Total Number of Calls'] = $total_call;
        $call_summary['Total Minutes'] = secondToMinutes($total_seconds);
        $call_summary['Total Revenue'] = (float)number_format($total_revenue, 2, '.', '');
        $call_summary['Avg Revenue Per Call'] = (float)number_format($avg_revenue_amount, 2, '.', '');

        if (empty($newData)) {
            return response()->json(['status' => 500, 'msg' => 'No data found for the selected criteria']);
        }
        $columns = ['Call Date(EST)', 'Call Time', 'Campaign', 'Affiliate', 'Target', 'Target Description', 'City', 'Market', 'State', 'Zipcode', 'Caller ID', 'Type', 'Connection Duration', 'Duplicate Call', 'Hangup', 'Revenue', 'Call Status', 'Annotation'];
        if ($request->report_type === 'email-report' && $request->emails && count($request->emails)) {
            $newSummary = [];
            $newSummary[' '] = ' ';
            $newSummary['  '] = '  ';
            $newSummary['   '] = '   ';
            $newSummary['Total Number of Calls'] = $call_summary['Total Number of Calls'];
            $newSummary['Total Minutes'] = $call_summary['Total Minutes'];
            $newSummary['Total Revenue'] = $call_summary['Total Revenue'];
            $newSummary['Avg Revenue Per Call'] = $call_summary['Avg Revenue Per Call'];
            $sendMailCtrl = new sendMailController();
            $sendMailCtrl->SendMail(collect($newData), $newSummary, $tag_count, $columns, $request->file_name, $request->emails);
            return;
        }
        return [
            'data'         => $newData,
            'call_summary' => $call_summary,
            'tag_count'    => $tag_count
        ];
    }

    private function marketExceptionReportData($tablename, $condition, $whereIn = [], $whereInOr = [])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . ' AND ';
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . ' AND ';
            }
        }

        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . ' OR ';
            }
        }

        $con = rtrim($con, ' AND ');
        $con = rtrim($con, ' OR ');

        $sql = "SELECT annotations.annotation_name, Call_Date AS 'Call Date(EST)' , Call_Date_Time AS 'Call Time', Campaign,Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID',Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup',Revenue, call_Logs_status AS 'Call Status',Annotation_Tag AS 'Annotation'
        FROM {$tablename}
        LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id
        WHERE {$con}";
        return DB::select($sql);
    }
}
