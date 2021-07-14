<?php

namespace App\Http\Controllers;

use App\Models\PendingBillCallLog;
use App\Models\RingbaCallLog;
use Illuminate\Http\Request;

class PendingBillCallLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

     /**
     *  @param instance
     *  @param Inbound_id
     *  @return success true of false
     */
    private function getDataByID($instance, $id)
    {
        return $instance->where('Inbound_Id', $id)->first();
    }

    /**
     * for display all data 
     * @param null
     * @method GET
     * @return Object data
     */
    public function index()
    {
        $results = PendingBillCallLog::orderBy('id', 'DESC')->get();
        dd($results);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return true or false 
     */
    public function store(Request $request)
    {
        // static data
        $Inbound_Ids = [
            'v2aFk5HE8nfM3x4Y-O2_OBccSfbF2WSoYyMijk9pfzs76anTfVL7mfPg',
            'v2cSKHRYELZD2n9SFxQcjJOfaMTP9pcy4dc8CebROdc6jfNV2AYaxoeA',
        ];

        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) 
        {
            $pendingBillCallLog = new PendingBillCallLog();

            // find existing record
            $existData = $this->getDataByID($pendingBillCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }
            $ringbaCallLog = new RingbaCallLog();

            // get data for store db
            $data = $this->getDataByID($ringbaCallLog, $Inbound_Id);

            $pendingBillCallLog->SN                        = $data->SN;
            $pendingBillCallLog->Call_Date                 = $data->Call_Date;
            $pendingBillCallLog->Call_Date_Time            = $data->Call_Date_Time;
            $pendingBillCallLog->Duplicate_Call            = $data->Duplicate_Call;
            $pendingBillCallLog->Affiliate                 = $data->Affiliate;
            $pendingBillCallLog->Campaign                  = $data->Campaign;
            $pendingBillCallLog->Inbound_Id                = $data->Inbound_Id;
            $pendingBillCallLog->Inbound                   = $data->Inbound;
            $pendingBillCallLog->Dialed                    = $data->Dialed;
            $pendingBillCallLog->Type                      = $data->Type;
            $pendingBillCallLog->Target                    = $data->Target;
            $pendingBillCallLog->Source_Hangup             = $data->Source_Hangup;
            $pendingBillCallLog->Conn_Duration             = $data->Conn_Duration;
            $pendingBillCallLog->Time_To_Call              = $data->Time_To_Call;
            $pendingBillCallLog->call_Length_In_Seconds    = $data->call_Length_In_Seconds;
            $pendingBillCallLog->Revenue                   = $data->Revenue;
            $pendingBillCallLog->payout                    = $data->payoutAmount;
            $pendingBillCallLog->Profit                    = $data->Profit;
            $pendingBillCallLog->Total_Cost                = $data->Total_Cost;
            $pendingBillCallLog->call_Logs_status          = 'Pedding';
            $result = $pendingBillCallLog->save();

            // delete Record from Ringa Call log after transfer archived call log table;
            $data->delete();

        }

        if($result) {
            echo 'Insert successfully';
        }else {
            echo 'Somthing Wrong';
        }
    }
}
