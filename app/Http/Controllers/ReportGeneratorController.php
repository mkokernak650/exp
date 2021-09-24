<?php

namespace App\Http\Controllers;

use App\Models\{
    ArchivedCallLog,
    BilledCallLog,
    MarketExcptions,
    RingbaCallLog,
    Exception
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportGeneratorController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function affiliateReport(Request $request)
    {
        // SELECT * FROM `ringba_call_logs` WHERE Affiliate_Id='AFe13f165279994a0781aa2da2cc26db98' AND Call_Date>='2021-06-28' AND Call_Date <= '2021-07-25'
        $newData        = [];
        $report_type    = $request->type;
        $affiliate_ids  = $request->affiliate_id; // array
        $start_date     = date('Y-m-d', strtotime($request->start_date));
        $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
        $archived       = [];
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
        $total_call     = 0;
        $total_seconds  = 0;
        $total_payment  = 1;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'payout' => (float) 0.00];

        // category of calls
        $annotation_tag = [];
        $tag_count = [];
        $condition = [
            ['Call_Date', '>=', $start_date],
            ['Call_Date', '<=', $end_date]
        ];

        if ($report_type === 'billed') {
            $billed = $this->fetchAffiliatData(new BilledCallLog(), $condition, $affiliate_ids);
        } else {
            $billed = $this->fetchAffiliatData(new BilledCallLog(), $condition, $affiliate_ids);
            $archived = $this->fetchAffiliatData(new ArchivedCallLog(), $condition, $affiliate_ids);
        }
        // for billed
        foreach ($billed as $bill) {
            array_push($newData, $bill);
            if (!empty($bill->Annotation_Tag)) {
                array_push($annotation_tag, $bill->Annotation_Tag);
            }
            if (in_array($bill->Annotation_Tag, $annotation_tag)) {
                $tag_count[$bill->Annotation_Tag]['name'] = $bill->Annotation_Tag;
                $tag_count[$bill->Annotation_Tag]['qty'] = (isset($tag_count[$bill->Annotation_Tag]['qty']) ? $tag_count[$bill->Annotation_Tag]['qty'] : 0) + 1;
                $tag_count[$bill->Annotation_Tag]['payout']  = (isset($tag_count[$bill->Annotation_Tag]['payout']) ? $tag_count[$bill->Annotation_Tag]['payout'] : 0) + $bill->payoutAmount;
            }
            $total_call++;
            $total_seconds += $bill->Conn_Duration;
            $total_payment += $bill->payoutAmount;
            $target = $bill->Target_Description;
        }
        // for archived
        if (!empty($archived)) {
            foreach ($archived as $ar) {
                array_push($newData, $ar);
                if (empty($ar->Annotation_Tag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['payout'] += $ar->payoutAmount;
                }
                if (!empty($ar->Annotation_Tag)) {
                    array_push($annotation_tag, $ar->Annotation_Tag);
                }
                if (in_array($ar->Annotation_Tag, $annotation_tag)) {
                    $tag_count[$ar->Annotation_Tag]['name'] = $ar->Annotation_Tag;
                    $tag_count[$ar->Annotation_Tag]['qty'] = (isset($tag_count[$ar->Annotation_Tag]['qty']) ? $tag_count[$ar->Annotation_Tag]['qty'] : 0) + 1;
                    $tag_count[$ar->Annotation_Tag]['payout']  = (isset($tag_count[$ar->Annotation_Tag]['payout']) ? $tag_count[$ar->Annotation_Tag]['payout'] : 0) + $ar->payoutAmount;
                }
                $total_call++;
                $total_seconds  += $ar->Conn_Duration;
                $total_payment  += $ar->payoutAmount;
            }
            $tag_count['archive_call'] = $archive_call;
        }


        $avg_payout_amount = $total_payment > 0 ? $total_payment / $total_call : 0;

        $call_summary['data_range']             = $data_range;
        $call_summary['targets']                = $target;
        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = secondToMinutes($total_seconds);
        $call_summary['total_payment']          = (float) $total_payment;
        $call_summary['avg_payout_amount']      = (float) $avg_payout_amount;

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

        if ($request->start_date !== null && $request->end_date !== null) {
            $start_date     = date('Y-m-d', strtotime($request->start_date));
            $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
            $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
            $call_summary['data_range']  = $data_range;
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
        $total_revenue  = 1;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float) 0.00];

        // category of calls
        $annotation_tag = [];   
        $tag_count = [];

        // dd($this->targetReportData('billed_call_logs', $condition, $whereIn));

        if ($report_type === 'billed') {
            $billed = $this->targetReportData('billed_call_logs', $condition, $whereIn);
        } else {
            $billed     = $this->targetReportData('billed_call_logs', $condition, $whereIn);
            $archived   = $this->targetReportData('archived_call_logs', $condition, $whereIn);
            $exceptions = $this->targetReportData('exceptions', $condition, $whereIn);
        }

        // for billed
        foreach ($billed as $bill) {
            $call_summary['targets'] = $bill->Target_Description;
            $annotationTag = $bill->Annotation_Tag;
            unset($bill->Target_Description);
            unset($bill->Annotation_Tag);
            array_push($newData, $bill);

            if (!empty($annotationTag)) {
                array_push($annotation_tag, $annotationTag);
            }
            if (in_array($annotationTag, $annotation_tag)) {
                $tag_count[$annotationTag]['name'] = $annotationTag;
                $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + $bill->Revenue;
            }
            $total_call++;
            $total_seconds  += $bill->Conn_Duration;
            $total_revenue  += $bill->Revenue;
        }

        // for archived
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                $annotationTag = $archive->Annotation_Tag;
                unset($archive->Target_Description);
                unset($archive->Annotation_Tag);
                array_push($newData, $archive);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $archive->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tag, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tag)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + $archive->Revenue;
                }

                $total_call++;
                $total_seconds  += $archive->Conn_Duration;
                $total_revenue  += $archive->Revenue;
            }
            $tag_count['archive_call'] = $archive_call;
        }
        // for exceptions
        if (!empty($exceptions)) {
            foreach ($$exceptions as $$exception) {
                array_push($newData, $exception);
                $annotationTag = $exception->Annotation_Tag;
                unset($exception->Target_Description);
                unset($exception->Annotation_Tag);
                array_push($newData, $exception);

                if (empty($annotationTag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $exception->Revenue;
                }
                if (!empty($annotationTag)) {
                    array_push($annotation_tag, $annotationTag);
                }
                if (in_array($annotationTag, $annotation_tag)) {
                    $tag_count[$annotationTag]['name'] = $annotationTag;
                    $tag_count[$annotationTag]['qty'] = (isset($tag_count[$annotationTag]['qty']) ? $tag_count[$annotationTag]['qty'] : 0) + 1;
                    $tag_count[$annotationTag]['revenue']  = (isset($tag_count[$annotationTag]['revenue']) ? $tag_count[$annotationTag]['revenue'] : 0) + $exception->Revenue;
                }

                $total_call++;
                $total_seconds  += $exception->Conn_Duration;
                $total_revenue  += $exception->Revenue;
            }
            $tag_count['archive_call'] = $archive_call;
        }
        // dd($newData);
        $avg_revenue_amount = $total_revenue > 0 ?  $total_revenue / $total_call : 0;


        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = secondToMinutes($total_seconds);

        $call_summary['total_revenue']          = (float) number_format($total_revenue, 2, '.', '');
        $call_summary['avg_revenue_amount']     = (float) number_format($avg_revenue_amount, 2, '.', '');

        return [
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    // TODO MarketExcptions report Gene
    public function marketExceptionReport(Request $request)
    {
        $customer_name  = $request->customer_name;
        $market_name    = $request->market;
        $start_date     = date('Y-m-d', strtotime($request->start_date));
        $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
        $total_revenue  = 1;



        if (!empty($market_name)) {
            $all_markets = MarketExcptions::where('customer_id', '=', $customer_name)
                ->get(['customer_id', 'market_id', 'start_date']);
        } else {
            $all_markets = MarketExcptions::where([['customer_id', '=', $customer_name], ['market_id', '=', $market_name]])
                ->get(['customer_id', 'market_id', 'start_date']);
        }
        if (empty($all_markets)) {
            return false;
        }
        foreach ($all_markets as $market) {

            // summary of calls
            $get_start_date = $market->start_date;
            $total_call     = 0;
            $total_seconds  = 0;
            $total_revenue  = 1;

            // category of calls
            $annotation_tag = [];
            $tag_count = [];

            $get_call_logs = RingbaCallLog::where([
                ['Customer', '=', $customer_name],
                ['Call_Date', '>=', $start_date],
                ['Call_Date', '>=', date('Y-m-d', strtotime($get_start_date))],
                ['Call_Date', '<=', $end_date],
                ['Market', '=', $market_name]
            ])->get();

            foreach ($get_call_logs as $call_log) {
                if (!empty($call_log->Annotation_Tag)) {
                    array_push($annotation_tag, $call_log->Annotation_Tag);
                }
                if (in_array($call_log->Annotation_Tag, $annotation_tag)) {
                    $tag_count[$call_log->Annotation_Tag]['name'] = $call_log->Annotation_Tag;
                    $tag_count[$call_log->Annotation_Tag]['qty'] = (isset($tag_count[$call_log->Annotation_Tag]['qty']) ? $tag_count[$call_log->Annotation_Tag]['qty'] : 0) + 1;
                    $tag_count[$call_log->Annotation_Tag]['revenue']  = (isset($tag_count[$call_log->Annotation_Tag]['revenue']) ? $tag_count[$call_log->Annotation_Tag]['revenue'] : 0) + $call_log->Revenue;
                }
                $total_call++;
                $total_seconds  += $call_log->Conn_Duration;
                $total_revenue  += $call_log->Revenue;
            }
        }

        $avg_revenue_amount = $total_revenue > 0 ?  $total_revenue / $total_call : 0;

        $call_summary['data_range']             = $data_range;
        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = secondToMinutes($total_seconds);
        $call_summary['total_revenue']          = (float) number_format($total_revenue, 2, '.', '');
        $call_summary['avg_revenue_amount']     = (float) number_format($avg_revenue_amount, 2, '.', '');

        return [
            'data'          => $get_call_logs,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    private function fetchAffiliatData($instance, $condition, $affiliate_ids)
    {
        return $instance
            ->whereIn('Affiliate_Id', $affiliate_ids)
            ->where($condition)
            ->get([
                'Call_Date', 'Call_Date_Time', 'Campaign', 'Affiliate', 'City', 'Market', 'State', 'Zipcode', 'Dialed',  'Annotation_Tag',  'Target',  'Source_Hangup',  'Type', 'Duplicate_Call', 'Conn_Duration', 'payoutAmount', 'call_Logs_status'
            ]);
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

        $sql = "SELECT Call_Date, Call_Date_Time, Campaign, Target, Affiliate, City, Market, State, Dialed,Type, Conn_Duration, Duplicate_Call, Source_Hangup, Revenue, call_Logs_status, Target_Description, Annotation_Tag FROM {$tablename}  WHERE {$con}";
        return DB::select($sql);
    }
}
