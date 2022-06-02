<?php
namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\BilledCallLog;
use App\Models\Campaign;
use App\Models\PendingBillCallLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BilledCallLogController extends Controller
{
    private static $billedCallLog;
    private static $RingbaApiHelpers;

    public function __construct()
    {
        $this->middleware('auth');
        self::$billedCallLog = new BilledCallLog();
        self::$RingbaApiHelpers = new RingbaApiHelpers();
    }

    /**
     * @param null
     * @method GET
     * @return Object data
     */
    public function index()
    {
        $campaignsWithAnnotations = Campaign::with(['annotations' => function ($query) {
            $query->orderBy('annotations.order');
        }])->get();

        return Inertia::render('Ringba/BilledCallLogs', [
            'billedCallLogs'           => self::$billedCallLog::orderBy('id', 'asc')->get(),
            'campaignsWithAnnotations' => $campaignsWithAnnotations,
        ]);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return true or false
     */
    public function store(Request $request)
    {
        $Inbound_Ids = $request->inboundIds;

        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $billedCallLog = new BilledCallLog();

            // find existing record
            $existData = findDataByInboundId($billedCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }
            $ringbaCallLog = new PendingBillCallLog();
            // get for store data
            $data = findDataByInboundId($ringbaCallLog, $Inbound_Id);
            // $result = dataMoveHelper(self::$billedCallLog, $data);

            $billedCallLog->SN = $data->SN;
            $billedCallLog->Recording_Url = $data->Recording_Url;
            $billedCallLog->Call_Date_Time = $data->Call_Date_Time;
            $billedCallLog->Call_Date = dateFormat($data->Call_Date);
            $billedCallLog->Duplicate_Call = $data->Duplicate_Call;
            $billedCallLog->Affiliate = $data->Affiliate;
            $billedCallLog->Affiliate_Id = $data->Affiliate_Id;
            $billedCallLog->Market = $data->Market;
            $billedCallLog->Campaign = $data->Campaign;
            $billedCallLog->Campaign_Id = $data->Campaign_Id;
            $billedCallLog->Inbound = $data->Inbound;
            $billedCallLog->Inbound_Id = $data->Inbound_Id;
            $billedCallLog->Dialed = $data->Dialed;
            $billedCallLog->Type = $data->Type;
            $billedCallLog->Target = $data->Target;
            $billedCallLog->Target_Number = $data->Target_Number;
            $billedCallLog->Target_Description = $data->Target_Description;
            $billedCallLog->Source_Hangup = $data->Source_Hangup;
            $billedCallLog->Conn_Duration = $data->Conn_Duration;
            $billedCallLog->Time_To_Call = $data->Time_To_Call;
            $billedCallLog->call_Length_In_Seconds = $data->call_Length_In_Seconds;
            $billedCallLog->Revenue = $data->Revenue;
            $billedCallLog->payoutAmount = $data->payoutAmount;
            $billedCallLog->Total_Cost = $data->Total_Cost;
            $billedCallLog->Profit = $data->Profit;
            $billedCallLog->call_Logs_status = 'Billed';
            $billedCallLog->City = $data->City;
            $billedCallLog->State = $data->State;
            $billedCallLog->Zipcode = $data->Zipcode;
            $billedCallLog->Has_Annotation = $data->Has_Annotation;
            $billedCallLog->Annotation_Tag = $data->Annotation_Tag;
            $billedCallLog->Customer = $data->Customer;
            $result = $billedCallLog->save();

            // delete Record from Ringa Call log after transfer Billed call log table;
            $data->delete();
        }
        if ($result) {
            return response()->json([
                'msg'         => 'Data moved to Billed successfully',
                'status_code' => 200
            ]);
        } else {
            return response()->json([
                'msg'         => 'Data Moving failed',
                'status_code' => 500
            ]);
        }
    }

    // public function formPending()
    // {
    //     $Inbound_Ids = ['v2-0dsnlvCvvCnnrjXXVPGvmPLBP7RChtkTpC2DkdVIsp3WXvGcY3iqg'];

    //     foreach ($Inbound_Ids as $Inbound_Id) {
    //         $billedCallLog = new BilledCallLog();
    //         $existData = findDataByInboundId($billedCallLog, $Inbound_Id);

    //         $result = false;

    //         if ($existData) {
    //             return response()->json(["msg" => "Already exists", "status_code" => 500]);
    //         } else {

    //             $pending = new PendingBillCallLog();
    //             $data = findDataByInboundId($pending, $Inbound_Id);

    //             $billedCallLog->SN                  = $data->SN;
    //             $billedCallLog->Recording_Url       = $data->Recording_Url;
    //             $billedCallLog->Call_Date_Time      = $data->Call_Date_Time;
    //             $billedCallLog->Call_Date           = $data->Call_Date;
    //             $billedCallLog->Duplicate_Call      = $data->Duplicate_Call;
    //             $billedCallLog->Affiliate           = $data->Affiliate;
    //             $billedCallLog->Affiliate_Id        = $data->Affiliate_Id;
    //             $billedCallLog->Market              = $data->Market;
    //             $billedCallLog->Campaign            = $data->Campaign;
    //             $billedCallLog->Campaign_Id         = $data->Campaign_Id;
    //             $billedCallLog->Inbound             = $data->Inbound;
    //             $billedCallLog->Inbound_Id          = $data->Inbound_Id;
    //             $billedCallLog->Dialed              = $data->Dialed;
    //             $billedCallLog->Type                = $data->Type;
    //             $billedCallLog->Target              = $data->Target;
    //             $billedCallLog->Target_Description  = $data->Target_Description;
    //             $billedCallLog->Source_Hangup       = $data->Source_Hangup;
    //             $billedCallLog->Conn_Duration       = $data->Conn_Duration;
    //             $billedCallLog->Time_To_Call        = $data->Time_To_Call;
    //             $billedCallLog->call_Length_In_Seconds = $data->call_Length_In_Seconds;
    //             $billedCallLog->Revenue             = $data->Revenue;
    //             $billedCallLog->payoutAmount        = $data->payoutAmount;
    //             $billedCallLog->Total_Cost          = $data->Total_Cost;
    //             $billedCallLog->Profit              = $data->Profit;
    //             $billedCallLog->call_Logs_status    = 'Billed';
    //             $billedCallLog->City                = $data->City;
    //             $billedCallLog->State               = $data->State;
    //             $billedCallLog->Zipcode             = $data->Zipcode;
    //             $billedCallLog->Has_Annotation      = $data->Has_Annotation;
    //             $billedCallLog->Annotation_Tag      = $data->Annotation_Tag;
    //             $result = $billedCallLog->save();

    //             // delete Record from Ringa Call log after transfer Billed call log table;
    //             $data->delete();
    //         }
    //         if ($result) {
    //             return response()->json(["msg" => "Data moved to pending successfully", "status_code" => 200]);
    //         } else {
    //             return response()->json(["msg" => "moving failed", "status_code" => 500]);
    //         }
    //     }
    // }
    /**
     * @request post
     * @param \Illuminate\Http\Request $request
     * @param array $inboundIds
     * @return void
     */
    public function getAnnotation(Request $request)
    {
        $inboundIds = $request->inboundIds;
        $data = self::$RingbaApiHelpers->getUpdateAnnotation($inboundIds);
        $this->updateAnnotation($inboundIds, $data);
        $allData = self::$billedCallLog::all();
        return response()->json($allData);
    }

    /**
     * for update annotation
     * @param mixed $inboundId
     * @param array $data
     * @return void
     */
    private function updateAnnotation($inboundId, $data = [])
    {
        $findData = findDataByInboundId(self::$billedCallLog, $inboundId);
        $findData->Has_Annotation = $data['has_annotation'];
        $findData->Annotation_Tag = $data['annotation_tag'];
        $findData->save();
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            // $result =  DB::table('billed_call_logs')->where('id', $request->selectedRowIds[$i])->delete();
            $result = BilledCallLog::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function updateRevenue(Request $request)
    {
        BilledCallLog::where('Inbound_Id', '=', $request->inboundIds[0])->update(['Revenue' => '', 'payoutAmount' => '']);
    }
}
