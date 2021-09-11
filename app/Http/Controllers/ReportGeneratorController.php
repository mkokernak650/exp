<?php

namespace App\Http\Controllers;

use App\Models\{ArchivedCallLog, BilledCallLog, ReportGenerator};
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportGeneratorController extends Controller
{
    function __construct()
    {
        // $this->middleware('auth');
    }

    public function affiliateReport(Request $request)
    {
        $newData        = [];
        $report_type    = true; // billed or genenal report
        $affiliate_id   = 'AFd3d075c572a14ed19698e10c07dc00dd';
        $start_date     = date('Y-m-d', strtotime('2021-07-01'));
        $end_date       = date('Y-m-d', strtotime('2021-07-26')); //'2021-07-26';
        $archived       = [];
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
        $total_call     = 0;
        $total_minutes  = 0;
        $total_payment  = 1;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'payout' => (float) 0.00];

        // category of calls
        $annotation_tag = [];
        $tag_count = [];

        if ($report_type === 'Billed') {
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
            $total_minutes += $bill->Conn_Duration;
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
                $total_minutes  += $ar->Conn_Duration;
                $total_payment  += $ar->payoutAmount;
            }
            $tag_count['archive_call'] = $archive_call;
        }

        $avg_payout_amount =  $total_payment / $total_call;

        $call_summary['data_range']             = $data_range;
        $call_summary['targets']                = $target;
        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = (float) $total_minutes;
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
        $report_type    = 'Billed'; // billed or general
        $customer_name  = 'Legacy Healing Centers';
        $target_name    = 'Legacy Health-Charter';
        $start_date     = date('Y-m-d', strtotime('2021-07-01'));
        $end_date       = date('Y-m-d', strtotime('2021-07-26')); //'2021-07-26';
        $archived       = [];
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
        $total_call     = 0;
        $total_minutes  = 0;
        $total_revenue  = 1;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'revenue' => (float) 0.00];

        // category of calls
        $annotation_tag = [];
        $tag_count = [];

        if ($report_type === 'Billed') {
            $billed = $this->fetchTargetData(new BilledCallLog(), $customer_name, $target_name, $start_date, $end_date);
        } else {
            $billed = $this->fetchTargetData(new BilledCallLog(), $customer_name, $target_name, $start_date, $end_date);
            $archived = $this->fetchTargetData(new ArchivedCallLog(), $customer_name, $target_name, $start_date, $end_date);
        }

        foreach ($billed as $bill) {

            array_push($newData, $bill);
            $call_summary['targets']= $bill->Target_Description;

            if (!empty($bill->Annotation_Tag)) {
                array_push($annotation_tag, $bill->Annotation_Tag);
            }
            if (in_array($bill->Annotation_Tag, $annotation_tag)) {
                $tag_count[$bill->Annotation_Tag]['name'] = $bill->Annotation_Tag;
                $tag_count[$bill->Annotation_Tag]['qty'] = (isset($tag_count[$bill->Annotation_Tag]['qty']) ? $tag_count[$bill->Annotation_Tag]['qty'] : 0) + 1;
                $tag_count[$bill->Annotation_Tag]['revenue']  = (isset($tag_count[$bill->Annotation_Tag]['revenue']) ? $tag_count[$bill->Annotation_Tag]['revenue'] : 0) + $bill->Revenue;
            }
            $total_call++;
            $total_minutes  += $bill->Conn_Duration;
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
                $total_minutes  += $archive->Conn_Duration;
                $total_revenue  += $archive->Revenue;
            }
            $tag_count['archive_call'] = $archive_call;
        }
        $avg_revenue_amount =  $total_revenue / $total_call;

        $call_summary['data_range']             = $data_range;
        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = (float) $total_minutes;

        $call_summary['total_revenue']          = (float) number_format($total_revenue, 2, '.', '');
        $call_summary['avg_revenue_amount']    = (float) number_format($avg_revenue_amount, 2, '.');


        return [
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    private function fetchAffiliatData($instance, $affiliate_id, $start_date, $end_date)
    {
        return $instance
            ->where('Affiliate_Id', '=', $affiliate_id)
            ->where('Call_Date', '>=', $start_date)
            ->where('Call_Date', '<=', $end_date)->get();
    }

    private function fetchTargetData($instance, $customer_name, $target_name, $start_date, $end_date)
    {
        return $instance
            ->where('Customer', '=', $customer_name)
            ->where('Target', '=', $target_name)
            ->where('Call_Date', '>=', $start_date)
            ->where('Call_Date', '<=', $end_date)->get();
    }
}
