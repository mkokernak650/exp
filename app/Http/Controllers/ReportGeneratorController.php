<?php

namespace App\Http\Controllers;

use App\Models\ArchivedCallLog;
use App\Models\BilledCallLog;
use App\Models\MarketExcptions;
use App\Models\RingbaCallLog;
use App\Models\Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportGeneratorController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function affiliateReport(Request $request)
    {
        $newData        = [];
        $report_type    = $request->type; // billed or general
        $customer_name  = $request->customer_name;
        $affiliate_ids  = $request->affiliate_id; // array
        $target_name    = $request->target_name; // array
        $annotation     = $request->annotation;
        $campaign       = $request->campaign;

        // summary of calls
        $archived       = [];
        $call_summary   = [];
        $condition      = [];
        $whereIn        = [];
        $call_summary['Customer Name']             = $customer_name;
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date     = date('Y-m-d', strtotime($request->start_date));
            $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range']  = $date_range;
            $condition[]    = "Call_Date >='$start_date'";
            $condition[]    = "Call_Date <= '$end_date'";
        }
        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name !== null) {
            $condition[] =  "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }
       

        $total_call     = 0;
        $total_seconds  = 0;
        $total_revenue  = 0;
        $target         = '';
        $archive_call   = ['name' => '', 'qty' => 0, 'revenue' => (float) 0.00];

        // category of calls
        $annotation_tags_array = [];
        $tag_count = [];


        if ($report_type === 'billed') {
            $billed = $this->affiliateReportData('billed_call_logs', $condition, $whereIn);
        } else {
            $callLogs = $this->affiliateReportData('ringba_call_logs', $condition, $whereIn);
            $billed     = $this->affiliateReportData('billed_call_logs', $condition, $whereIn);
            $archived   = $this->affiliateReportData('archived_call_logs', $condition, $whereIn);
            $exceptions = $this->affiliateReportData('exceptions', $condition, $whereIn);
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
            $annotationTag = $bill->$annotation_tag;
            unset($bill->$target_description);
            if ($annotation !== 'yes') {
                unset($bill->$annotation_tag);
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
                $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + $bill->$payout_amount;
            }
            $total_call++;
            $total_seconds  += $bill->$conn_duration;
            $total_revenue  += $bill->$payout_amount;
        }


        // for archived
        if (!empty($callLogs)) {
            foreach ($callLogs as $callLog) {
                $TargetDescription = $callLog->$target_description;
                $annotationTag = $callLog->$annotation_tag;
                unset($callLog->$target_description);
                if ($annotation !== 'yes') {
                    unset($callLog->$annotation_tag);
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
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $callLog->$payout_amount;
                }

                $total_call++;
                $total_seconds  += $callLog->$conn_duration;
                $total_revenue  += (int) $callLog->$payout_amount;
            }
            // $tag_count[''] = $archive_call;
        }

        // for archived
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                $annotationTag = $archive->$annotation_tag;
                unset($archive->$target_description);
                if ($annotation !== 'yes') {
                    unset($archive->$annotation_tag);
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
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $archive->$payout_amount;
                }

                $total_call++;
                $total_seconds  += $archive->$conn_duration;
                $total_revenue  += (int) $archive->$payout_amount;
            }
            // $tag_count[''] = $archive_call;
        }
        // for exceptions
        // return 0;
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->$annotation_tag;
                unset($exception->$target_description);
                if ($annotation !== 'yes') {
                    unset($exception->$annotation_tag);
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
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $exception->$payout_amount;
                }

                $total_call++;
                $total_seconds  += $exception->$conn_duration;
                $total_revenue  += (int) $exception->$payout_amount;
            }
        }
  
        $avg_revenue_amount = $total_revenue > 0 ?  $total_revenue / $total_call : 0;


        $call_summary['Total number of calls']             = $total_call;
        $call_summary['Total Minutes']          = secondToMinutes($total_seconds);

        $call_summary['Total payout amount']          = (float) number_format($total_revenue, 2, '.', '');
        $call_summary['Average payout per call']     = (float) number_format($avg_revenue_amount, 2, '.', '');
        if (empty($newData)) {
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    //TODO target report generate
    public function targetReport(Request $request)
    {
        $newData        = [];
        $report_type    = $request->type; // billed or general
        $customer_name  = $request->customer_name;
        $affiliate_ids  = $request->affiliate_id; // array
        $target_name    = $request->target_name; // array
        $annotation     = $request->annotation;
        $campaign       = $request->campaign;

        // summary of calls
        $archived       = [];
        $call_summary   = [];
        $condition      = [];
        $whereIn        = [];
        $call_summary['Customer Name']             = $customer_name;
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date     = date('Y-m-d', strtotime($request->start_date));
            $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range']  = $date_range;
            $condition[]    = "Call_Date >='$start_date'";
            $condition[]    = "Call_Date <= '$end_date'";
        }
        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name !== null) {
            $condition[] =  "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }

        $total_call     = 0;
        $total_seconds  = 0;
        $total_revenue  = 0;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float) 0.00];

        // category of calls
        $annotation_tags_array = [];
        $tag_count = [];



        if ($report_type === 'billed') {
            $billed = $this->targetReportData('billed_call_logs', $condition, $whereIn);
        } else {
            $callLogs = $this->targetReportData('ringba_call_logs', $condition, $whereIn);
            $billed     = $this->targetReportData('billed_call_logs', $condition, $whereIn);
            $archived   = $this->targetReportData('archived_call_logs', $condition, $whereIn);
            $exceptions = $this->targetReportData('exceptions', $condition, $whereIn);
        }
        $target_description = 'Target Description';
        $annotation_tag = 'Annotation';
        $conn_duration = 'Connection Duration';
        $has_annotation = 'Has Annotation';

        // for billed
        foreach ($billed as $bill) {
            $TargetDescription = $bill->$target_description;
            // $call_summary['Targets'] = $TargetDescription;
            $annotationTag = $bill->$annotation_tag;
            unset($bill->$target_description);
            if ($annotation !== 'yes') {
                // unset($bill->$annotation_tag);
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
                $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + $bill->Revenue;
            }
            $total_call++;
            $total_seconds  += $bill->$conn_duration;
            $total_revenue  += $bill->Revenue;
        }


        // for callLogs
        if (!empty($callLogs)) {
            foreach ($callLogs as $callLog) {
                $TargetDescription = $callLog->$target_description;
                $annotationTag = $callLog->$annotation_tag;
                unset($callLog->$target_description);
                if ($annotation !== 'yes') {
                    // unset($callLog->$annotation_tag);
                    unset($callLog->$has_annotation);
                } else {
                    unset($callLog->$has_annotation);
                }
                unset($callLog->Target);
                array_push($newData, $callLog);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $callLog->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $callLog->Revenue;
                }

                $total_call++;
                $total_seconds  += $callLog->$conn_duration;
                $total_revenue  += (int) $callLog->Revenue;
            }
        }

        // for archived
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                $annotationTag = $archive->$annotation_tag;
                unset($archive->$target_description);
                if ($annotation !== 'yes') {
                    // unset($archive->$annotation_tag);
                    unset($archive->$has_annotation);
                } else {
                    unset($archive->$has_annotation);
                }
                unset($archive->Target);
                array_push($newData, $archive);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $archive->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $archive->Revenue;
                }

                $total_call++;
                $total_seconds  += $archive->$conn_duration;
                $total_revenue  += (int) $archive->Revenue;
            }
        }
        // for exceptions
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->$annotation_tag;
                unset($exception->$target_description);
                if ($annotation !== 'yes') {
                    // unset($exception->$annotation_tag);
                    unset($exception->$has_annotation);
                } else {
                    unset($exception->$has_annotation);
                }
                unset($exception->Target);
                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $exception->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tags_array, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tags_array)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + (int) $exception->Revenue;
                }
                $total_call++;
                $total_seconds  += $exception->$conn_duration;
                $total_revenue  += (int) $exception->Revenue;
            }
        }
   
        $avg_revenue_amount = $total_revenue > 0 ?  $total_revenue / $total_call : 0;
        $call_summary['Total number of calls']             = $total_call;
        $call_summary['Total Minutes']          = secondToMinutes($total_seconds);

        $call_summary['Total Revenue']          = (float) number_format($total_revenue, 2, '.', '');
        $call_summary['Avg Revenue Amount']     = (float) number_format($avg_revenue_amount, 2, '.', '');

        if (empty($newData)) {
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    public function marketExceptionReport(Request $request)
    {
        $newData        = [];
        $market_name    = $request->market;
        $customer_name  = $request->customer_name;
        $affiliate_ids  = $request->affiliate_id; // array
        $target_name    = $request->target_name; // array
        $annotation     = $request->annotation;
        $campaign       = $request->campaign;

        // summary of calls
        $call_summary   = [];
        $condition      = [];
        $whereIn        = [];
        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date     = date('Y-m-d', strtotime($request->start_date));
            $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $date_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['Date Range']  = $date_range;
            $condition[]    = "Call_Date >='$start_date'";
            $condition[]    = "Call_Date <= '$end_date'";
        }
        if ($market_name !== null) {
            $condition[] = "Market='{$market_name}'";
        }
        if ($campaign !== null) {
            $condition[] = "Campaign='{$campaign}'";
        }
        if ($annotation !== null) {
            $condition[] = "Has_Annotation='$annotation'";
        }
        if ($customer_name !== null) {
            $condition[] =  "Customer='{$customer_name}'";
        }
        if (!empty($affiliate_ids) && count($affiliate_ids) > 0 && $affiliate_ids[0] !== null) {
            $ids = implode("','", $affiliate_ids);
            $whereIn[] = "Affiliate_Id IN ('$ids')";
        }
        if (!empty($target_name) && count($target_name) > 0 && $target_name[0] !== null) {
            $ids = implode("','", $target_name);
            $whereIn[] = "Target IN ('$ids')";
        }

        $total_call     = 0;
        $total_seconds  = 0;
        $total_revenue  = 0;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float) 0.00];

        // category of calls
        $annotation_tags_array = [];
        $tag_count = [];
        $exceptions = $this->marketExceptionReportData('exceptions', $condition, $whereIn);
        $annotation_tag = 'Call Type';
        $conn_duration = 'Connection Duration';
        // for exceptions
        if (!empty($exceptions)) {
            foreach ($exceptions as $exception) {
                $annotationTag = $exception->$annotation_tag;
                unset($exception->$annotation_tag);
                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $exception->Revenue;
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
                $total_seconds  += $exception->$conn_duration;
                $total_revenue  += (int) $exception->Revenue;
            }
            // $tag_count['archive_call'] = $archive_call;
        }
        // if ($total_revenue == 0 || $total_call == 0) {
        //     return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        // }
        $avg_revenue_amount = $total_revenue > 0 ?  $total_revenue / $total_call : 0;


        $call_summary['Total Number of Calls']             = $total_call;
        $call_summary['Total Minutes']          = secondToMinutes($total_seconds);
        $call_summary['Total Revenue']          = (float) number_format($total_revenue, 2, '.', '');
        $call_summary['Avg Revenue Per Call']     = (float) number_format($avg_revenue_amount, 2, '.', '');

        if (empty($newData)) {
            return response()->json(["status" => 500, "msg" => "No data found for the selected criteria"]);
        }
        return [
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    

    private function targetReportData($tablename, $condition, $whereIn = [])
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

        $sql = "SELECT Call_Date AS 'Call Date(EST)' , Call_Date_Time AS 'Call Time', Campaign,Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID',Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup',Revenue, call_Logs_status AS 'Call Status',Annotation_Tag AS 'Annotation',Has_Annotation AS 'Has Annotation'  FROM {$tablename}  WHERE {$con}";

        return DB::select($sql);
    }
    private function marketExceptionReportData($tablename, $condition, $whereIn = [])
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
        $sql = "SELECT Call_Date AS 'Call Date(EST)' , Call_Date_Time AS 'Call Time', Campaign,Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID',Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup',Revenue, call_Logs_status AS 'Call Status',Annotation_Tag AS 'Annotation'  FROM {$tablename}  WHERE {$con}";

        return DB::select($sql);
    }

    private function affiliateReportData($tablename, $condition, $whereIn = [])
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
        $sql = "SELECT Call_Date AS 'Call Date(EST)' , Call_Date_Time AS 'Call Time', Campaign,Affiliate, Target, Target_Description AS 'Target Description', City, Market, State,Zipcode, Inbound AS 'Caller ID',Type, Conn_Duration AS 'Connection Duration', Duplicate_Call AS 'Duplicate Call', Source_Hangup AS 'Hangup', payoutAmount AS 'Payout', call_Logs_status AS 'Call Status',Annotation_Tag AS 'Call Type',Has_Annotation AS 'Has Annotation' FROM {$tablename}  WHERE {$con}";
        return DB::select($sql);
    }
}
