<?php

namespace App\Http\Controllers;

use App\Models\ArchivedCallLog;
use App\Models\BilledCallLog;
use App\Models\BroadCastMonth;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            ->groupByRaw("extract(year from Call_Date), extract(month from Call_Date), Target_Number, Affiliate")
            ->selectRaw("DATE_FORMAT(Call_Date, '%M-%Y') as Month, Target_Number as 'Destination_Number', Affiliate, count(Target_Number) as 'Billable_Calls', payoutAmount as 'Per_Call_Rate', count(Target_Number)*payoutAmount as 'Total_Charge'")
            ->get();

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
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        foreach ($destinationReport as $destinationData) {
            $call_summary['Billable Calls'] += $destinationData->Billable_Calls;
            $call_summary['Total Charges'] += $destinationData->Total_Charge;
        }

        return [
            'data'         => $destinationReport,
            'call_summary' => $call_summary,
        ];
    }

    public function callLengthReport(Request $request)
    {
        $campaign = Campaign::find($request->input('campaign'));

        $newData = [];
        $report_type = $request->type; // billed or general
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $dNumber=$request->destination_number;
  
        // summary of calls
        $archived = [];
        $call_summary = [];
        $condition = [];
        $whereIn = [];
        $call_summary['Customer Name'] = $customer_name;
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date = date('Y-m-d', strtotime($request->start_date));
            $end_date = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range'] = $date_range;
            $condition[] = "Call_Date >='$start_date'";
            $condition[] = "Call_Date <= '$end_date'";
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
        $total_call_records=[];

        if ($report_type === 'billed') {
            $billed = $this->callLengthReportData('billed_call_logs', $condition, $whereIn);
            $total_call_records=$billed;
        } else {
            $callLogs = $this->callLengthReportData('ringba_call_logs', $condition, $whereIn);
            $billed = $this->callLengthReportData('billed_call_logs', $condition, $whereIn);
            $archived = $this->callLengthReportData('archived_call_logs', $condition, $whereIn);
            $exceptions = $this->callLengthReportData('exceptions', $condition, $whereIn);
            $total_call_records= array_merge($total_call_records, $callLogs, $billed, $archived, $exceptions);
        }
      
        $call_length_array=[
            [
                'minLength' =>30,
                'maxLength' =>60,
            ],
            [
                'minLength' =>61,
                'maxLength' =>90,
            ],
            [
                'minLength' =>91,
                'maxLength' =>120,
            ],
            [
                'minLength' =>121,
                'maxLength' =>180,
            ],
            [
                'minLength' =>181,
                'maxLength' =>240,
            ],
            [
                'minLength' =>241,
                'maxLength' =>300,
            ],
            [
                'minLength' =>301,
                'maxLength' =>360,
            ],
            [
                'minLength' =>361,
                'maxLength' =>420,
            ],
            [
                'minLength' =>421,
                'maxLength' =>480,
            ],
            [
                'minLength' =>481,
                'maxLength' =>540,
            ],
            [
                'minLength' =>541,
                'maxLength' =>600,
            ],
            [
                'minLength' =>601,
                'maxLength' =>660,
            ],
            [
                'minLength' =>661,
                'maxLength' =>720,
            ],
            [
                'minLength' =>721,
                'maxLength' =>780,
            ],
            [
                'minLength' =>781,
                'maxLength' =>840,
            ],
            [
                'minLength' =>841,
                'maxLength' =>900,
            ]
        ];
        $sum_of_total_calls=0;

        $finalArray=[];
        foreach ($call_length_array as $item) {
            $finalArray[$item['minLength'].'_'.$item['maxLength']] = (object)[
                'Range - Call Length in Seconds'=>$item['minLength'].'-'.$item['maxLength'],
                'Min Length'=>$item['minLength'],
                'Max Length'=>$item['maxLength'],
                'Total Calls'=>0,
                '% of all calls'=>0,
                'Total seconds'=>0,
                'Total Payout'=>0,
            ];
            $total_calls='Total Calls';
            $percent_of_calls='% of all calls';
            $total_seconds='Total seconds';
            $total_payouts='Total Payout';
            foreach ($total_call_records as $record) {
                if ($record->call_Length_In_Seconds >= $item['minLength'] && $record->call_Length_In_Seconds <= $item['maxLength']) {
                    $finalArray[$item['minLength'].'_'.$item['maxLength']]->$total_calls++;
                    $finalArray[$item['minLength'].'_'.$item['maxLength']]->$total_seconds+=$record->call_Length_In_Seconds;
                    $finalArray[$item['minLength'].'_'.$item['maxLength']]->$total_payouts+=$record->payoutAmount;
                    $sum_of_total_calls +=1;
                }
            }
        }
        foreach ($call_length_array as $item) {
            $finalArray[$item['minLength'].'_'.$item['maxLength']]->$percent_of_calls= round(($finalArray[$item['minLength'].'_'.$item['maxLength']]->$total_calls*100)/
            $sum_of_total_calls, 1).'%';
        }
        return ['data'=>$finalArray];
    }

    private function callLengthReportData($tablename, $condition, $whereIn = [])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . " AND ";
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . " AND ";
            }
        }

        
        $con = rtrim($con, " AND ");
        $sql = "SELECT annotations.annotation_name, Call_Date AS 'Call Date(EST)', Call_Date_Time AS 'Call Time', Campaign, Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID', Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup', payoutAmount AS 'Payout', call_Logs_status AS 'Call Status', Annotation_Tag AS 'Call Type', Has_Annotation AS 'Has Annotation',Target_Number,call_Length_In_Seconds,payoutAmount
        FROM {$tablename}
        LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id
        WHERE {$con}";
        return DB::select($sql);
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
        $year=[];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year=[];
        } else {
            $year= $request->year;
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
            for ($i=0; $i< count($year);$i++) {
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
        $target = '';
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
            unset($bill->annotation_name);
            unset($bill->$target_description);
            if ($annotation !== 'yes') {
                unset($bill->annotation_name);
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
                $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) +(int) $bill->$payout_amount;
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
                unset($callLog->annotation_name);
                unset($callLog->$target_description);
                if ($annotation !== 'yes') {
                    unset($callLog->annotation_name);
                    unset($callLog->$has_annotation);
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
            // $tag_count[''] = $archive_call;
        }

        // for archived
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                $annotationTag = $archive->annotation_name;
                $archive->$annotation_tag = $archive->annotation_name;
                unset($archive->annotation_name);
                unset($archive->$target_description);
                if ($annotation !== 'yes') {
                    unset($archive->annotation_name);
                    unset($archive->$has_annotation);
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
            // $tag_count[''] = $archive_call;
        }
        // for exceptions
        // return 0;
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->annotation_name;
                $exception->$annotation_tag = $exception->annotation_name;
                unset($exception->annotation_name);
                unset($exception->$target_description);
                if ($annotation !== 'yes') {
                    unset($exception->annotation_name);
                    unset($exception->$has_annotation);
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
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'         => $newData,
            'call_summary' => $call_summary,
            'tag_count'    => $tag_count
        ];
    }

    //TODO target report generate

    private function affiliateReportData($tablename, $condition, $whereIn = [], $whereInOr=[])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . " AND ";
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . " AND ";
            }
        }
        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . " OR ";
            }
        }
        
        $con = rtrim($con, " AND ");
        $con = rtrim($con, " OR ");
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
        $year=[];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year=[];
        } else {
            $year= $request->year;
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
            for ($i=0; $i< count($year);$i++) {
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
        $target = '';
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
            // $call_summary['Targets'] = $TargetDescription;
            $annotationTag = $bill->annotation_name;
            $bill->$annotation_tag = $bill->annotation_name;
            unset($bill->annotation_name);
            unset($bill->$target_description);
            if ($annotation !== 'yes') {
                // unset($bill->annotation_name);
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
                $tag_count[$annotationTag]['revenue'] = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) +  (int)$bill->Revenue;
            }
            $total_call++;
            $total_seconds += $bill->$conn_duration;
            $total_revenue +=(int) $bill->Revenue;
        }


        // for callLogs
        if (!empty($callLogs)) {
            foreach ($callLogs as $callLog) {
                $TargetDescription = $callLog->$target_description;
                $annotationTag = $callLog->annotation_name;
                $callLog->$annotation_tag = $callLog->annotation_name;
                unset($callLog->annotation_name);
                unset($callLog->$target_description);
                if ($annotation !== 'yes') {
                    // unset($callLog->annotation_name);
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
                unset($archive->annotation_name);
                unset($archive->$target_description);
                if ($annotation !== 'yes') {
                    // unset($archive->annotation_name);
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
                unset($exception->annotation_name);
                unset($exception->$target_description);
                if ($annotation !== 'yes') {
                    // unset($exception->annotation_name);
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
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'         => $newData,
            'call_summary' => $call_summary,
            'tag_count'    => $tag_count
        ];
    }

    private function targetReportData($tablename, $condition, $whereIn = [], $whereInOr=[])
    {
        $con = '';
        foreach ($condition as $v) {
            $con .= $v . " AND ";
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . " AND ";
            }
        }
        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . " OR ";
            }
        }
        $con = rtrim($con, " AND ");
        $con = rtrim($con, " OR ");

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
        $market_name = $request->market;
        $customer_name = $request->customer_name;
        $affiliate_ids = $request->affiliate_id; // array
        $target_name = $request->target_name; // array
        $annotation = $request->annotation;
        $campaign = $campaign->campaign_name ?? null;
        $year=[];
        if ($request->start_date !== null || $request->end_date !== null) {
            $year=[];
        } else {
            $year= $request->year;
        }
        $broad_cast_month = $request->input('broad_cast_month');

        // summary of calls
        $call_summary = [];
        $condition = [];
        $whereIn = [];
        $whereInOr = [];


        /*if ($market_name !== null) {
          $condition[] = "Market='{$market_name}'";
        }*/
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
            for ($i=0; $i< count($year);$i++) {
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

            $condition[] = "(" . rtrim($broadCastMonthCondition, ' OR') . ")";
        }

        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        /*if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }*/
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
                unset($exception->annotation_name);
                unset($exception->annotation_name);
                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += (int) $exception->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                // if (in_array($annotationTag, $annotation_tag)) {
                //     $tag_count[$annotationTag]['name'] = $annotationTag;
                //     $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                //     $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $exception->Revenue;
                // }

                $total_call++;
                $total_seconds += $exception->$conn_duration;
                $total_revenue += (int)$exception->Revenue;
            }
            // $tag_count['archive_call'] = $archive_call;
        }
        // if ($total_revenue == 0 || $total_call == 0) {
        //     return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        // }
        $avg_revenue_amount = $total_revenue > 0 ? $total_revenue / $total_call : 0;


        $call_summary['Total Number of Calls'] = $total_call;
        $call_summary['Total Minutes'] = secondToMinutes($total_seconds);
        $call_summary['Total Revenue'] = (float)number_format($total_revenue, 2, '.', '');
        $call_summary['Avg Revenue Per Call'] = (float)number_format($avg_revenue_amount, 2, '.', '');

        if (empty($newData)) {
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
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
            $con .= $v . " AND ";
        }
        if (count($whereIn) > 0) {
            foreach ($whereIn as $value) {
                $con .= $value . " AND ";
            }
        }

        if (count($whereInOr) > 0) {
            foreach ($whereInOr as $value) {
                $con .= $value . " OR ";
            }
        }

        
        $con = rtrim($con, " AND ");
        $con = rtrim($con, " OR ");

        $sql = "SELECT annotations.annotation_name, Call_Date AS 'Call Date(EST)' , Call_Date_Time AS 'Call Time', Campaign,Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID',Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup',Revenue, call_Logs_status AS 'Call Status',Annotation_Tag AS 'Annotation'
        FROM {$tablename}
        LEFT JOIN annotations ON {$tablename}.Annotation_Tag = annotations.id
        WHERE {$con}";

        return DB::select($sql);
    }
}
