<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\ArchivedCallLog;
use App\Models\PendingBillCallLog;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Target;
use App\Models\ZipCodeData;
use App\Models\Exception;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Support\Facades\DB;


class ExceptionController extends Controller
{
    private static $RingbaApiHelpers;
    private static $Exception;

    protected $get_dtStamp = null;
    protected $get_accountId = '';
    protected $get_campaignId = '';
    protected $get_campaignName = '';
    protected $get_affiliateId = '';
    protected $get_affiliateName = '';
    protected $get_number = '';
    protected $get_inboundCallId = '';
    protected $get_inboundPhoneNumber = '';
    protected $get_totalAmount = '';
    protected $get_targetName = '';
    protected $get_Target_Description = '';
    protected $get_targetId = '';
    protected $get_targetBuyerId = '';
    protected $get_targetBuyer = '';
    protected $get_timeToConnect = null;
    protected $get_callConnectionLength = null;
    protected $get_targetNumber = '';
    protected $get_recordingUrl = '';
    // protected $get_conversionAmount = null;
    protected $get_callLengthInSeconds = null;
    protected $get_callCompletedDt = '';
    protected $get_payoutAmount = null;
    protected $get_profit = '';
    protected $get_duplicated_status = 'No';
    protected $get_source_hangup = '';
    protected $get_customer_name_id = null;
    protected $get_revenue = null;
    protected $get_annotations_tag = '';
    protected $has_annotations = 'NO';
    protected $get_call_log_status = 'Exceptions';
    protected $get_call_qualification = 'Not Qualified';
    protected $get_city = "";
    protected $get_state = "";
    protected $get_zipcode = "";
    protected $get_market = "";
    protected $get_type = "";

    public function __construct()
    {
        $this->middleware('auth');
        self::$RingbaApiHelpers = new RingbaApiHelpers();
        self::$Exception = new Exception();
    }

    public function index()
    {
        $allExceptions = self::$Exception::orderBy('id', 'asc')->get();
        return Inertia::render('Ringba/Exception', [
            'Exceptions' => $allExceptions
        ]);
    }
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
        $allData = self::$Exception::all();
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
        $findData = findDataByInboundId(self::$Exception, $inboundId);
        $findData->Has_Annotation = $data['has_annotation'];
        $findData->Annotation_Tag = $data['annotation_tag'];
        $findData->save();
    }

    /**
     * @method post
     * @param array
     * @param \Illuminate\Http\Request $request
     */
    public function moveToPending(Request $request)
    {
        $inboundIds = $request->inboundIds;

        $result = false;
        if (is_array($inboundIds)) {
            $i = 0;

            while ($i < count($inboundIds)) {
                $pendingCallLog = new PendingBillCallLog();
                if (!findDataByInboundId($pendingCallLog, $inboundIds[$i])) {

                    $dataById = findDataByInboundId(self::$Exception, $inboundIds[$i]);
                    $pendingCallLog->call_Logs_status = 'Pending';
                    $result = dataMoveHelper($pendingCallLog, $dataById);
                }
                $i++;
            }
        }
        if ($result) {
            return response()->json(["msg" => "Data moved to Pending successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Data moving failed", "status_code" => 500]);
        }
    }

    /**
     * @method post
     * @param array
     * @param \Illuminate\Http\Request $request
     */
    public function moveToArhived(Request $request)
    {
        $inboundIds = $request->inboundIds;

        $msg = [];
        if (is_array($inboundIds)) {
            $i = 0;
            while ($i < count($inboundIds)) {
                $archivedCallLog = new ArchivedCallLog();
                $exception = new Exception();

                if (findDataByInboundId($archivedCallLog, $inboundIds[$i]) === null) {

                    $dataById = findDataByInboundId($exception, $inboundIds[$i]);
                    $archivedCallLog->call_Logs_status = 'Archive';
                    $result = dataMoveHelper($archivedCallLog, $dataById);
                    if ($result) {
                        $msg = ["msg" => "Data moved to Archive successfully", "status_code" => 200];
                    } else {
                        $msg = ["msg" => "Data moving failed", "status_code" => 500];
                    }
                } else {
                    $msg = ["msg" => "Data already exixts", "status_code" => 500];
                }
                $i++;
            }
        }

        return response()->json($msg);
    }

    /**
     * @method for ringba calllog
     * @method post 
     * @param \Illuminate\Http\Request $request
     * @return void
     */
    public function updateExceptionReport(Request $request)
    {
        $inboundIds = $request->inboundIds;

        $apiResposnse = self::$RingbaApiHelpers->getUpdateData($inboundIds);

        if ($apiResposnse->columns)  $this->columns($apiResposnse->columns);
        if ($apiResposnse->events)   $this->events($apiResposnse->events);
        if ($apiResposnse->tags)     $this->tags($apiResposnse->tags);
        // dd($apiResposnse);

        $getDataById = findDataByInboundId(self::$Exception, $inboundIds);
        // dd($getDataById);

        $getDataById->Call_Date_Time       = date("d-M-y H:i:s", $this->get_dtStamp / 1000);
        $getDataById->Has_Annotation       = $this->has_annotations;
        $getDataById->Annotation_Tag       = $this->get_annotations_tag;
        $getDataById->Recording_Url        = $this->get_recordingUrl;
        $getDataById->call_time            = date('d-M-y', $this->get_dtStamp / 1000);
        $getDataById->Duplicate_Call       = $this->get_duplicated_status;
        $getDataById->Affiliate            = $this->get_affiliateName;
        $getDataById->Affiliate_Id         = $this->get_affiliateId;
        $getDataById->Market               = $this->get_market;
        $getDataById->Campaign             = $this->get_campaignName;
        $getDataById->Campaign_Id          = $this->get_campaignId;
        $getDataById->Inbound              = $this->get_inboundPhoneNumber;
        $getDataById->Inbound_Id           = $this->get_inboundCallId;
        $getDataById->Dialed               = $this->get_number;
        $getDataById->Type                 = $this->get_type;
        $getDataById->Customer             = $this->get_customer_name_id;
        $getDataById->Target               = $this->get_targetName;
        $getDataById->Target_Description   = $this->get_Target_Description;
        $getDataById->Source_Hangup        = $this->get_source_hangup;
        $getDataById->Conn_Duration        = $this->get_callConnectionLength;
        $getDataById->Time_To_Call         = $this->get_timeToConnect;
        $getDataById->call_Length_In_Seconds = $this->get_callLengthInSeconds;
        $getDataById->Revenue              = $this->get_revenue;
        $getDataById->payoutAmount         = $this->get_payoutAmount;
        $getDataById->Total_Cost           = $this->get_totalAmount;
        $getDataById->Profit               = $this->get_profit;
        $getDataById->City                 = $this->get_city;
        $getDataById->State                = $this->get_state;
        $getDataById->Zipcode              = $this->get_zipcode;
        $getDataById->save();

        $allData = Exception::all();
        return response()->json($allData);
    }

    /**
     * @method for convert and assign value from String to Array
     * @param mixed $row
     * @return void
     */
    private function columns($row)
    {
        $results = gettype($row) === 'array' ? $row : json_decode($row);
        // $results = json_decode($row);
        foreach ($results as $item) {
            if ($item->name === 'dtStamp') {
                $this->get_dtStamp = $item->formattedValue;
            } else if ($item->name === 'accountId') {
                $this->get_accountId = $item->formattedValue;
            } else if ($item->name === 'campaignId') {
                $this->get_campaignId = $item->formattedValue;
            } else if ($item->name === 'campaignName') {
                $this->get_campaignName = $item->formattedValue;
            } else if ($item->name === 'affiliateId') {
                $this->get_affiliateId = $item->formattedValue;
            } else if ($item->name === 'affiliateName') {
                $this->get_affiliateName = $item->formattedValue;
            } else if ($item->name === 'number') {
                $this->get_number = $item->formattedValue;
            } else if ($item->name === 'inboundCallId') {
                $this->get_inboundCallId = $item->formattedValue;
            } else if ($item->name === 'inboundPhoneNumber') {
                if ($item->formattedValue) {
                    $this->get_inboundPhoneNumber = $item->formattedValue;
                    $this->zipCodeInfo($this->get_inboundPhoneNumber);
                } else {
                    $this->get_inboundPhoneNumber = '';
                }
            } else if ($item->name === 'totalAmount') {
                $this->get_totalAmount = $item->formattedValue;
            } else if ($item->name === 'callCompletedDt') {
                $this->get_callCompletedDt = $item->formattedValue;
            } else if ($item->name === 'source') {
                $this->get_source_hangup = $item->formattedValue;
            } else if ($item->name === 'profit') {
                $this->get_profit = $item->formattedValue;
            } else if ($item->name === 'targetName') {
                $this->get_targetName = $item->formattedValue;
                if (!empty($this->get_targetName)) {
                    // $targetsTable = new Target();
                    $result = Target::where('Ringba_Targets_Name', 'LIKE', "%{$item->formattedValue}%")->first();
                    if ($result) {
                        $this->get_Target_Description = $result->Description;
                        $this->get_customer_name_id = $result->Customer;
                    }
                } else {
                    $this->get_Target_Description = '';
                    $this->get_customer_name_id = null;
                }
            } else if ($item->name === 'targetId') {
                $this->get_targetId = $item->formattedValue;
            } else if ($item->name === 'targetBuyerId') {
                $this->get_targetBuyerId = $item->formattedValue;
            } else if ($item->name === 'targetBuyer') {
                $this->get_targetBuyer = $item->formattedValue;
            } else if ($item->name === 'timeToConnect') {
                $this->get_timeToConnect = $item->formattedValue;
            } else if ($item->name === 'callConnectionLength') {
                $this->get_callConnectionLength = $item->formattedValue;
            } else if ($item->name === 'targetNumber') {
                $this->get_targetNumber = $item->formattedValue;
            } else if ($item->name === 'recordingUrl') {
                $this->get_recordingUrl = $item->formattedValue;
            } else if ($item->name === 'conversionAmount') {
                // $this->get_conversionAmount = $item->formattedValue;
                $this->get_revenue = $item->formattedValue;
            } else if ($item->name === 'callLengthInSeconds') {
                $this->get_callLengthInSeconds = $item->formattedValue;
            } else if ($item->name === 'payoutAmount') {
                $this->get_payoutAmount = $item->formattedValue;
            }
            // else if ($item->name === 'revenue') {
            //     $this->get_revenue = $item->formattedValue;
            // }
        }
    }

    /**
     * @method for convert and assign value from String to Array
     * @param mixed $row
     * @return void
     */
    private function events($row)
    {
        $results = gettype($row) === 'array' ? $row : json_decode($row);

        foreach ($results as $item) {
            if ($item->name === 'DuplicateCall') {
                $this->get_duplicated_status = "Yes";
                return;
            } else {
                $this->get_duplicated_status = "No";
            }
        }
    }

    /**
     * @method for convert and assign value from String to Array
     * @param mixed $row
     * @return void
     */
    private function tags($row)
    {
        $results = gettype($row) === 'array' ? $row : json_decode($row);

        foreach ($results as $item) {
            if ($item->tagType === 'Annotations') {
                $this->has_annotations = 'Yes';
                $this->get_annotations_tag = $item->tagName;
            } else {
                $this->has_annotations = 'No';
                $this->get_annotations_tag = "";
            }
        }
    }

    /**
     * @param mixed $inboundPhoneNumber
     * @return void
     */
    private function zipCodeInfo($inboundPhoneNumber)
    {
        $npanxx_number  = substr($inboundPhoneNumber, 2, 6);
        // dd($npanxx_number);
        $result         = ZipCodeData::select(['ZipCode', 'State', 'City', 'FIPS', 'NXXUseType'])
            ->where('NPANXX', $npanxx_number)
            ->orderBy('ZipCodeCount', 'DESC')
            ->first();

        if ($result) {
            $res = ZipcodeByTelevisionMarket::select('Market')
                ->where('fips', $result->FIPS)
                ->where('zip_code', $result->ZipCode)
                ->first();

            $this->get_zipcode = $result->ZipCode;
            $this->get_state = $result->State;
            $this->get_city = $result->City;
            $this->get_market = $res->Market ?? "";
            $this->get_type = $result->NXXUseType;
        } else {
            $this->get_zipcode = "";
            $this->get_state = "";
            $this->get_city = "";
            $this->get_market = "";
            $this->get_type = "";
        }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            // $result =  DB::table('exceptions')->where('id', $request->selectedRowIds[$i])->delete();
            $result =  Exception::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    public function updateRevenue(Request $request)
    {
        Exception::where('Inbound_Id', '=', $request->inboundIds[0])->update(['Revenue' => '', 'payoutAmount' => '']);
    }
}
