<?php

namespace App\Http\Controllers;

use App\Models\ArchivedCallLog;
use App\Models\RingbaCallLog;
use App\Models\Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArchivedCallLogController extends Controller
{
    public function __construct()
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
        $results = ArchivedCallLog::orderBy('id', 'DESC')->get();
        return Inertia::render('Ringba/ArchivedCallLogReports', [
            'archivedCallLogs' => $results
        ]);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return true or false 
     */
    public function store(Request $request)
    {
        // static data
        $Inbound_Ids = $request->inboundIds;

        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $archivedCallLog = new ArchivedCallLog();

            // find existing record
            $existData = findDataByInboundId($archivedCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }
            $ringbaCallLog = new RingbaCallLog();
            // get for store data
            $data = findDataByInboundId($ringbaCallLog, $Inbound_Id);

            $archivedCallLog->SN                        = $data->SN;
            $archivedCallLog->Campaign                  = $data->Campaign;
            $archivedCallLog->Call_Date                 = $data->Call_Date;
            $archivedCallLog->Call_Date_Time            = $data->Call_Date_Time;
            $archivedCallLog->Conn_Duration             = $data->Conn_Duration;
            $archivedCallLog->call_Length_In_Seconds    = $data->call_Length_In_Seconds;
            $archivedCallLog->Customer                  = $data->Customer;
            $archivedCallLog->Target                    = $data->Target;
            $archivedCallLog->Target_Description        = $data->Target_Description;
            $archivedCallLog->Affiliate                 = $data->Affiliate;
            $archivedCallLog->Market                    = $data->Market;
            $archivedCallLog->Revenue                   = $data->Revenue;
            $archivedCallLog->payout                    = $data->payoutAmount;
            $archivedCallLog->Total_Cost                = $data->Total_Cost;
            $archivedCallLog->Profit                    = $data->Profit;
            $archivedCallLog->Inbound_Id                = $data->Inbound_Id;
            $archivedCallLog->Inbound                   = $data->Inbound;
            $archivedCallLog->Dialed                    = $data->Dialed;
            $archivedCallLog->Type                      = $data->Type;
            $archivedCallLog->City                      = $data->City;
            $archivedCallLog->State                     = $data->State;
            $archivedCallLog->Zipcode                   = $data->Zipcode;
            $result = $archivedCallLog->save();

            // delete Record from Ringa Call log after transfer archived call log table;
            $data->delete();
        }

        if ($result) {
            return response()->json(["msg" => "Data moved to Arichive successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }

    public function getcolumn()
    {
        $arch = new ArchivedCallLog();
        dd($arch->getTableColumn());
    }
}
