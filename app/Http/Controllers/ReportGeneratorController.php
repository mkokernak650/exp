<?php

namespace App\Http\Controllers;

use App\Models\{
    ArchivedCallLog,
    BilledCallLog,
    MarketExcptions,
    ReportGenerator,
    RingbaCallLog
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use function PHPUnit\Framework\isEmpty;

class ReportGeneratorController extends Controller
{
    function __construct()
    {
        // $this->middleware('auth');
    }

    public function affiliateReport(Request $request)
    {
        $newData        = [];
        $report_type    = $request->type;
        $affiliate_id   = $request->affiliate_id;
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

        if ($report_type === 'billed') {
            $billed = $this->fetchAffiliatData(new BilledCallLog(), $affiliate_id, $start_date, $end_date);
        } else {
            $billed = $this->fetchAffiliatData(new BilledCallLog(), $affiliate_id, $start_date, $end_date);
            $archived = $this->fetchAffiliatData(new ArchivedCallLog(), $affiliate_id, $start_date, $end_date);
        }
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

    public function targetReport(Request $request)
    {
        $newData        = [];
        $report_type    = $request->type; // billed or general
        $customer_name  = $request->customer_name;
        $target_name    = "Legacy Health-Charter";
        $start_date     = date('Y-m-d', strtotime($request->start_date));
        $end_date       = date('Y-m-d', strtotime($request->end_date)); //'2021-07-26';
        $archived       = [];
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
        $total_call     = 0;
        $total_seconds  = 0;
        $total_revenue  = 1;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float) 0.00];

        // category of calls
        $annotation_tag = [];
        $tag_count = [];

        $condition = [
            ['Customer', '=', $customer_name],
            ['Call_Date', '>=', $start_date],
            ['Call_Date', '<=', $end_date]
        ];
        if ($target_name !== '') {
            $condition[] = ['Target', '=', $target_name];
        }

        if ($report_type === 'billed') {
            $billed = $this->fetchTargetData(new BilledCallLog(), $condition);
        } else {
            $billed = $this->fetchTargetData(new BilledCallLog(), $condition);
            $archived = $this->fetchTargetData(new ArchivedCallLog(), $condition);
        }

        foreach ($billed as $bill) {

            array_push($newData, $bill);
            $call_summary['targets'] = $bill->Target_Description;

            if (!empty($bill->Annotation_Tag)) {
                array_push($annotation_tag, $bill->Annotation_Tag);
            }
            if (in_array($bill->Annotation_Tag, $annotation_tag)) {
                $tag_count[$bill->Annotation_Tag]['name'] = $bill->Annotation_Tag;
                $tag_count[$bill->Annotation_Tag]['qty'] = (isset($tag_count[$bill->Annotation_Tag]['qty']) ? $tag_count[$bill->Annotation_Tag]['qty'] : 0) + 1;
                $tag_count[$bill->Annotation_Tag]['revenue']  = (isset($tag_count[$bill->Annotation_Tag]['revenue']) ? $tag_count[$bill->Annotation_Tag]['revenue'] : 0) + $bill->Revenue;
            }
            $total_call++;
            $total_seconds  += $bill->Conn_Duration;
            $total_revenue  += $bill->Revenue;
        }
        if (!empty($archived)) {
            foreach ($archived as $archive) {
                array_push($newData, $archive);

                if (empty($archive->Annotation_Tag)) {
                    $archive_call['qty'] += 1;
                    $archive_call['revenue'] += $archive->Revenue;
                }
                if (!empty($archive->Annotation_Tag)) {
                    array_push($annotation_tag, $archive->Annotation_Tag);
                }
                if (in_array($archive->Annotation_Tag, $annotation_tag)) {
                    $tag_count[$archive->Annotation_Tag]['name'] = $archive->Annotation_Tag;
                    $tag_count[$archive->Annotation_Tag]['qty'] = (isset($tag_count[$archive->Annotation_Tag]['qty']) ? $tag_count[$archive->Annotation_Tag]['qty'] : 0) + 1;
                    $tag_count[$archive->Annotation_Tag]['revenue']  = (isset($tag_count[$archive->Annotation_Tag]['revenue']) ? $tag_count[$archive->Annotation_Tag]['revenue'] : 0) + $archive->Revenue;
                }

                $total_call++;
                $total_seconds  += $archive->Conn_Duration;
                $total_revenue  += $archive->Revenue;
            }
            $tag_count['archive_call'] = $archive_call;
        }

        $avg_revenue_amount = $total_revenue > 0 ?  $total_revenue / $total_call : 0;

        $call_summary['data_range']             = $data_range;
        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = secondToMinutes($total_seconds);

        $call_summary['total_revenue']          = (float) number_format($total_revenue, 2, '.');
        $call_summary['avg_revenue_amount']     = (float) number_format($avg_revenue_amount, 2, '.');

        dd([
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ]);

        // return [
        //     'data'          => $newData,
        //     'call_summary'  => $call_summary,
        //     'tag_count'     => $tag_count
        // ];
    }

    public function marketExceptionReport()
    {
        $customer_name  = 'Legacy Healing Centers';
        $market_name    = 'Roanoke-Lynchburg, VA';
        $start_date     = date('Y-m-d', strtotime('2021-07-01'));
        $end_date       = date('Y-m-d', strtotime('2021-07-30')); //'2021-07-26';
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));

        // category of calls
        $annotation_tag = [];
        $tag_count = [];


        if (!empty($market_name)) {
            $all_markets = MarketExcptions::where('customer_id', '=', $customer_name)
                ->get(['customer_id', 'market_id', 'start_date']);
        } else {
            $all_markets = MarketExcptions::where([['customer_id', '=', $customer_name], ['market_id', '=', $market_name]])
                ->get(['customer_id', 'market_id', 'start_date']);
        }
        foreach ($all_markets as $market) {

            // summary of calls
            $get_start_date = $market->start_date;
            $total_call     = 0;
            $total_seconds  = 0;
            $total_revenue  = 1;

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
        $call_summary['total_revenue']          = (float) number_format($total_revenue, 2, '.');
        $call_summary['avg_revenue_amount']     = (float) number_format($avg_revenue_amount, 2, '.');

        return [
            'data'          => $get_call_logs,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    private function fetchAffiliatData($instance, $affiliate_id, $start_date, $end_date)
    {
        return $instance
            ->where('Affiliate_Id', '=', $affiliate_id)
            ->where('Call_Date', '>=', $start_date)
            ->where('Call_Date', '<=', $end_date)->get([
                'Call_Date', 'Call_Date_Time', 'Campaign', 'Target', 'Affiliate', 'City', 'Market', 'State', 'Dialed', 'Annotation_Tag', 'Type', 'Conn_Duration', 'Duplicate_Call', 'Source_Hangup', 'payoutAmount', 'call_Logs_status', 'Zipcode', 'Target_Description'
            ]);
    }

    private function fetchTargetData($instance, $condition)
    {
        return $instance
            ->where($condition)->get([
                'Call_Date', 'Call_Date_Time', 'Campaign', 'Target', 'Affiliate', 'City', 'Market', 'State', 'Dialed', 'Annotation_Tag', 'Type', 'Conn_Duration', 'Duplicate_Call', 'Source_Hangup', 'Revenue', 'call_Logs_status'
            ]);
    }
}
