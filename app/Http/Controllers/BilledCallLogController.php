<?php

namespace App\Http\Controllers;

use App\Models\BilledCallLog;
use Illuminate\Http\Request;
use App\Models\RingbaCallLog;

class BilledCallLogController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * @param null
     * @method GET
     * @return Object data
     */
    public function index()
    {
        $results = BilledCallLog::orderBy('id', 'DESC')->get();
        dd($results);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return true or false 
     */
    public function store(Request $request)
    {
        $Inbound_Ids = [
            'v2S1VpImE32RX04SZwExEpJsc_jxcVjY50CP4n24h752fXai9b-38V2w',
            'v2ELXNxHOaRPDzZWjLsu6VkpVWLhVhoGEWFkIgElVaxQTZwb6hrsgj9g',
            'v2Z8sU4f19s805f5xM2AmLZxh5UUtep9LNSxK8HV6jfFJZ9PQ7WeqGxQ'
        ];

        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $billedCallLog = new BilledCallLog();

            // find existing record
            $existData = findDataByInboundId($billedCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }
            $ringbaCallLog = new RingbaCallLog();

            // get for store data
            $data = findDataByInboundId($ringbaCallLog, $Inbound_Id);

            $billedCallLog->SN                  = $data->SN;
            $billedCallLog->Recording_Url       = $data->Recording_Url;
            $billedCallLog->Call_Date_Time      = $data->Call_Date_Time;
            $billedCallLog->Call_Date           = $data->Call_Date;
            $billedCallLog->Duplicate_Call      = $data->Duplicate_Call;
            $billedCallLog->Affiliate           = $data->Affiliate;
            $billedCallLog->Affiliate_Id        = $data->Affiliate_Id;
            $billedCallLog->Market              = $data->Market;
            $billedCallLog->Campaign            = $data->Campaign;
            $billedCallLog->Campaign_Id         = $data->Campaign_Id;
            $billedCallLog->Inbound             = $data->Inbound;
            $billedCallLog->Inbound_Id          = $data->Inbound_Id;
            $billedCallLog->Dialed              = $data->Dialed;
            $billedCallLog->Type                = $data->Type;
            $billedCallLog->Target              = $data->Target;
            $billedCallLog->Target_Description  = $data->Target_Description;
            $billedCallLog->Source_Hangup       = $data->Source_Hangup;
            $billedCallLog->Conn_Duration       = $data->Conn_Duration;
            $billedCallLog->Time_To_Call        = $data->Time_To_Call;
            $billedCallLog->call_Length_In_Seconds = $data->call_Length_In_Seconds;
            $billedCallLog->Revenue             = $data->Revenue;
            $billedCallLog->payoutAmount        = $data->payoutAmount;
            $billedCallLog->Total_Cost          = $data->Total_Cost;
            $billedCallLog->Profit              = $data->Profit;
            $billedCallLog->call_Logs_status    = 'Billed';
            $billedCallLog->City                = $data->City;
            $billedCallLog->State               = $data->State;
            $billedCallLog->Zipcode             = $data->Zipcode;
            $billedCallLog->Has_Annotation      = $data->Has_Annotation;
            $billedCallLog->Annotation_Tag      = $data->Annotation_Tag;
            $result = $billedCallLog->save();

            // delete Record from Ringa Call log after transfer Billed call log table;
            $data->delete();
        }
        if ($result) {
            echo 'Insert successfully';
        } else {
            echo 'Somthing Wrong';
        }
    }
}
