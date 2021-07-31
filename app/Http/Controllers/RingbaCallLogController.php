<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\ArchivedCallLog;
use App\Models\BilledCallLog;
use App\Models\RingbaCallLog;
use App\Models\PendingBillCallLog;
use Illuminate\Http\Request;
use App\Models\RingbaData;
use App\Models\Target;
use App\Models\ZipCodeData;
use App\Models\Exception;
use App\Models\MarketExcptions;
use App\Models\ZipcodeByTelevisionMarket;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class RingbaCallLogController extends Controller
{
    private static $RingbaApiHelpers;
    private static $RingbaCallLog;

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
    protected $get_call_log_status = 'Active';
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
        self::$RingbaCallLog = new RingbaCallLog();
    }

    public function RingbaAuth()
    {
        dd(self::$RingbaApiHelpers->getRingbaData());
    }

   /**
    * for move data from Ringba temporary table id
    * @param \Illuminate\Http\Request $request post
    * @return void
    */
    public function moveDataToCallLogs(Request $request)
    {
        // $ids = $request->id;
        $ids = [45,46,47,48,49,50,51,52,53];
        $results = RingbaData::whereIn('id', $ids)->get();
        $this->ringbaCallLogs($results);
    }
    
    /**
     * for delete Ringba data form Ringba temporary table
     * @param \Illuminate\Http\Request $request post
     * @return success
     */
    public function deleteRingbaData(Request $request)
    {
        $ids= [1,2];
        $results = RingbaData::whereIn('id', $ids)->delete();
        dd($results);
    }

    /**
     * @method use for get data By Scheduler
     * @call form \Illuminate\Console\Scheduling\Schedule
     * @return void
     */
    public function getRingbaDataByScheduler()
    {
        self::$RingbaApiHelpers->getRingbaData();
        $this->ringbaCallLogs();
    }

    /**
     * @method for ringba calllog
     * @return void
     */
    public function ringbaCallLogs($getRingbaDateById = null)
    {
        $ringbaMain = $getRingbaDateById === null ? RingbaData::all() : $getRingbaDateById;

        foreach ($ringbaMain as $row) {

            if ($row->columns)  $this->columns($row->columns);
            if ($row->events)   $this->events($row->events);
            if ($row->tags)     $this->tags($row->tags);

            $ringbaCallLogs             = new RingbaCallLog();

            $checkRingbaCallLogs        = findDataByInboundId(self::$RingbaCallLog, $this->get_inboundCallId);
            $checkArchiveCallLogs       = findDataByInboundId(new ArchivedCallLog(), $this->get_inboundCallId);
            $checkPendingBillCallLog    = findDataByInboundId(new PendingBillCallLog(), $this->get_inboundCallId);
            $checkBilledCallLag         = findDataByInboundId(new BilledCallLog(), $this->get_inboundCallId);

            if ($checkRingbaCallLogs !== null) {
                
                // for existing data update
                $checkRingbaCallLogs->call_Logs_status = $this->get_call_log_status;
                $this->ringbaDataObject($checkRingbaCallLogs);
            } else {

                if ($checkRingbaCallLogs || $checkArchiveCallLogs || $checkPendingBillCallLog || $checkBilledCallLag) {
                    // $row->delete();
                    continue;
                }

                $sn_id = empty($ringbaCallLogs->latest()->first()->id) ? 0 : $ringbaCallLogs->latest()->first()->id;
                $sn = $sn_id + 1; // db last insert id + 1

                $ringbaCallLogs->SN                 = "Exp-{$sn}";
                $ringbaCallLogs->call_Logs_status   = $this->get_call_log_status;

                $this->ringbaDataObject($ringbaCallLogs);
                // $row->delete();

                $market_exception = MarketExcptions::where('customer_id', '=', $this->get_customer_name_id)
                    ->where('market_id', '=', $this->get_market)
                    ->where('start_date', '<=', date('d-M-y', $this->get_dtStamp / 1000))
                    ->count();

                if ($market_exception > 0) {
                    $this->insertExceptions($ringbaCallLogs->id);
                }
            }
        }
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
                $this->get_inboundPhoneNumber = $item->formattedValue;
                $this->zipCodeInfo($this->get_inboundPhoneNumber);
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
                return;
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
        
        // $zipCodeDb      = new ZipCodeData();
        $result         = ZipCodeData::select(['ZipCode', 'State', 'City', 'FIPS', 'NXXUseType'])
            ->where('NPANXX', $npanxx_number)
            ->first();

        if ($result) {
            // $zipcode_by_television_market = new ZipcodeByTelevisionMarket();
            $res = ZipcodeByTelevisionMarket::select('Market')
                ->where('fips', $result->FIPS)
                ->where('zip_code', $result->ZipCode)
                ->first();
            $this->get_zipcode = $result->ZipCode;
            $this->get_state = $result->State;
            $this->get_city = $result->City;
            $this->get_market = $res->Market;
            $this->get_type = $result->NXXUseType;
        }
    }

    /**
     * @request post 
     * @param \Illuminate\Http\Request $request
     * @param array $inboundIds
     * @return void
     */
    public function updateByInboundId(Request $request)
    {
        $inboundIds = $request->inboundIds;
        if (is_array($inboundIds)) {
            $i = 0;
            while ($i < count($inboundIds)) {
                $this->updateData($inboundIds[$i]);
                $i++;
            }
        } else {
            $this->updateData($inboundIds);
        }
        $allData = RingbaCallLog::all();
        return response()->json($allData);
    }

    /**
     * @method for update data by $inboundId
     * @param mixed $inboundId
     * @return void
     */
    private function updateData($inboundId)
    {
        $row = self::$RingbaApiHelpers->getUpdateData($inboundId);

        if ($row->columns) $this->columns($row->columns);
        if ($row->events) $this->events($row->events);
        if ($row->tags) $this->tags($row->tags);

        $ringbaCallLogs = findDataByInboundId(self::$RingbaCallLog, $this->get_inboundCallId);

        $ringbaCallLogs->call_Logs_status       = $this->get_call_log_status;
        $this->ringbaDataObject($ringbaCallLogs);
    }

    /**
     * @method for bind ringba data & save data
     * @param mixed Object instance $instance
     * @return void
     */
    private function ringbaDataObject($instance)
    {
        
        $instance->Call_Date_Time         = date("d-M-y H:i:s", $this->get_dtStamp / 1000);
        $instance->Call_Date              = date('d-M-y', $this->get_dtStamp / 1000);
        $instance->Campaign               = $this->get_campaignName;
        $instance->Campaign_Id            = $this->get_campaignId;
        $instance->Affiliate              = $this->get_affiliateName;
        $instance->Affiliate_Id           = $this->get_affiliateId;
        $instance->Inbound                = $this->get_inboundPhoneNumber;
        $instance->Inbound_Id             = $this->get_inboundCallId;
        $instance->Dialed                 = $this->get_number;
        $instance->Time_To_Call           = $this->get_timeToConnect;
        $instance->Account_Id             = $this->get_accountId;
        $instance->Total_Cost             = $this->get_totalAmount;
        $instance->payoutAmount           = $this->get_payoutAmount;
        $instance->Conn_Duration          = $this->get_callConnectionLength;
        $instance->call_Length_In_Seconds = $this->get_callLengthInSeconds;
        $instance->Profit                 = $this->get_profit;
        $instance->Target                 = $this->get_targetName;
        $instance->Target_Description     = $this->get_Target_Description;
        $instance->Revenue                = $this->get_revenue;
        $instance->Duplicate_Call         = $this->get_duplicated_status;
        $instance->Source_Hangup          = $this->get_source_hangup;
        $instance->City                   = $this->get_city;
        $instance->State                  = $this->get_state;
        $instance->Zipcode                = $this->get_zipcode;
        $instance->Market                 = $this->get_market;
        $instance->Type                   = $this->get_type;
        $instance->Call_Qualification     = $this->get_call_qualification;
        $instance->Recording_Url          = $this->get_recordingUrl;
        $instance->Customer               = $this->get_customer_name_id;
        $instance->Has_Annotation         = $this->has_annotations;
        $instance->Annotation_Tag         = $this->get_annotations_tag;
        $instance->save();
    }

    /**
     * @request post
     * @param \Illuminate\Http\Request $request
     * @param array $inboundIds
     * @return void
     */
    public function getAnnotation(Request $request)
    {
        $inboundIds=$request->inboundIds;
        if (is_array($inboundIds)) {
            $i = 0;
            while ($i < count($inboundIds)) {
                $data = self::$RingbaApiHelpers->getUpdateAnnotation($inboundIds[$i]);
                $this->updateAnnotation($inboundIds[$i], $data);
                $i++;
            }
        } else {
            $data = self::$RingbaApiHelpers->getUpdateAnnotation($inboundIds);
            $this->updateAnnotation($inboundIds, $data);
        }
        $allData = RingbaCallLog::all();
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
        $findData = findDataByInboundId(self::$RingbaCallLog, $inboundId);
        $findData->Has_Annotation = $data['has_annotation'];
        $findData->Annotation_Tag = $data['annotation_tag'];
        $findData->save();
    }

    /**
     * for insert Exception data
     * @param mixed $inboundId
     * @return void
     */
    private function insertExceptions($insertId)
    {
        // $insertedData = RingbaCallLog::find($insertId);
        $insertedData = self::$RingbaCallLog::find($insertId);
        $instance = new Exception();
        $instance->SN                   = $insertedData->SN;
        $instance->Call_Date_Time       = $insertedData->Call_Date_Time;
        $instance->Has_Annotation       = $insertedData->Has_Annotation;
        $instance->Annotation_Tag       = $insertedData->Annotation_Tag;
        $instance->Recording_Url        = $insertedData->Recording_Url;
        $instance->call_Logs_status     = 'Exceptions';
        $instance->call_time            = $insertedData->Call_Date;
        $instance->Duplicate_Call       = $insertedData->Duplicate_Call;
        $instance->Affiliate            = $insertedData->Affiliate;
        $instance->Affiliate_Id         = $insertedData->Affiliate_Id;
        $instance->Market               = $insertedData->Market;
        $instance->Campaign             = $insertedData->Campaign;
        $instance->Campaign_Id          = $insertedData->Campaign_Id;
        $instance->Inbound              = $insertedData->Inbound;
        $instance->Inbound_Id           = $insertedData->Inbound_Id;
        $instance->Dialed               = $insertedData->Dialed;
        $instance->Type                 = $insertedData->Type;
        $instance->Customer             = $insertedData->Customer;
        $instance->Target               = $insertedData->Target;
        $instance->Target_Description   = $insertedData->Target_Description;
        $instance->Source_Hangup        = $insertedData->Source_Hangup;
        $instance->Conn_Duration        = $insertedData->Conn_Duration;
        $instance->Time_To_Call         = $insertedData->Time_To_Call;
        $instance->call_Length_In_Seconds = $insertedData->call_Length_In_Seconds;
        $instance->Revenue              = $insertedData->Revenue;
        $instance->payoutAmount         = $insertedData->payoutAmount;
        $instance->Total_Cost           = $insertedData->Total_Cost;
        $instance->Profit               = $insertedData->Profit;
        $instance->City                 = $insertedData->City;
        $instance->State                = $insertedData->State;
        $instance->Zipcode              = $insertedData->Zipcode;
        $instance->save();
        $insertedData->delete();
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return success response
     */
    public function dateWiseData(Request $request)
    {
        $get_past_days_range = null;
        $get_days_range = null;

        $start_date = date_create($request->startDate);
        $end_date = date_create($request->endDate);
        $current_date = date_create(date('m/d/Y'));

        $start_current_diff = date_diff($start_date, $current_date);
        $start_current_diff_result = $start_current_diff->format("%a");

        $start_end_diff = date_diff($start_date, $end_date);
        $start_end_diff_result = $start_end_diff->format("%a");

        if ($start_current_diff_result > 0) {
            $get_past_days_range = $start_current_diff_result;
        } else {
            $get_past_days_range = 1;
        }

        if ($start_end_diff_result > 0) {
            $get_days_range = $start_end_diff_result + 1;
        } else {
            $get_days_range = 1;
        }

        self::$RingbaApiHelpers->getRingbaData($get_past_days_range, $get_days_range);

        // for transfer all data in Ring call log report table;
        $this->ringbaCallLogs();

        return Inertia::render(
            'Ringba/TempRingbaData',
            [
                'ringbaData' => RingbaData::all()
            ]
        );
    }

    public function tempRingbaData()
    {
        $ringbaData =  RingbaData::all();
        return Inertia::render('Ringba/TempRingbaData', [
            'ringbaData' =>  $ringbaData
        ]);
    }

    public function callLogsReport()
    {
        // $allCallLogs = RingbaCallLog::all();
        return Inertia::render('Ringba/callLogsReport', [
            'allCallLogs' => self::$RingbaCallLog::all(),
        ]);
    }

    /**
     * @method POST
     * @param \Illuminate\Http\Request $request
     * @param array|string
     */
    public function delete(Request $request)
    {
        // $inboundIds = [
        //     'v2V3ujp1hFp_pzCCS2EPxnzp4Lw9JedEILh9VTXVW5pkvK50q6od32qg',
        //     'v2hq53_0auhEZX6CPDhucjmQawmHBy_2PXJS_GRK0OwD2GOcSLOblZ_A'
        // ];
        $inboundIds = 'v2V3ujp1hFp_pzCCS2EPxnzp4Lw9JedEILh9VTXVW5pkvK50q6od32qg';
        $data = deleteRecords(self::$RingbaCallLog, $inboundIds);
        dd($data);
    }
}
