<?php

namespace App\Http\Controllers;

use App\Models\{ArchivedCallLog, BilledCallLog, ReportGenerator};
use Illuminate\Http\Request;

class ReportGeneratorController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function affiliateReport(Request $request)
    {
        $newData        = [];
        $report_type    = true;
        $affiliate_id   = 'AFd3d075c572a14ed19698e10c07dc00dd';
        $start_date     = '2021-07-01';
        $end_date       = '2021-07-26';
        $archived       = [];
        $call_summary   = [];

        // summary of calls
        $data_range     = date('d-M-y', strtotime($start_date)) . ' - ' . date('d-M-y', strtotime($end_date));
        $total_call     = 0;
        $total_minutes  = 0;
        $total_payment  = 0;
        $target         = '';
        $archive_call   = ['name' => 'Archive Call', 'qty' => 0, 'payout' => (float) 0.00];

        // category of calls
        $annotation_tag = [];
        $tag_count = [];

        if ($report_type === 'Billed') {
            $billed = $this->fetchData(new BilledCallLog(), $affiliate_id, $start_date, $end_date);
        } else {
            $billed = $this->fetchData(new BilledCallLog(), $affiliate_id, $start_date, $end_date);
            $archived = $this->fetchData(new ArchivedCallLog(), $affiliate_id, $start_date, $end_date);
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
        $total_payout_amount =  $total_payment / $total_call;

        $call_summary['data_range']             = $data_range;
        $call_summary['targets']                = $target;
        $call_summary['total_call']             = $total_call;
        $call_summary['total_minutes']          = (float) $total_minutes;
        $call_summary['total_payment']          = (float) $total_payment;
        $call_summary['total_payout_amount']    = (float) $total_payout_amount;

        return [
            'data'          => $newData,
            'call_summary'  => $call_summary,
            'tag_count'     => $tag_count
        ];
    }

    private function fetchData($instance, $affiliate_id, $start_date, $end_date)
    {
        return $instance
            ->where('Affiliate_Id', '=', $affiliate_id)
            ->where('Call_Date', '>=', $start_date)
            ->where('Call_Date', '<=', $end_date)->get();
    }
}
