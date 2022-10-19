<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use  App\Models\Affiliate;
use App\Models\ArchivedCallLog;
use App\Models\BilledCallLog;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\RingbaCallLog;
use App\Models\PendingBillCallLog;
use App\Models\Target;
use App\Models\ZipCodeData;
use App\Models\Exception;
use App\Models\ZipcodeByTelevisionMarket;
use App\Models\RingbaDataFetchedLog;
use App\Http\Controllers\CampaignController;
use App\Models\TableDetails;
use App\Jobs\FetchRingbaData;

class RingbaCallLogController extends Controller
{
    private static $RingbaApiHelpers;
    private static $RingbaCallLog;
    protected $get_dtStamp              = null;
    protected $get_accountId            = '';
    protected $get_campaignId           = '';
    protected $get_campaignName         = '';
    protected $get_affiliateId          = '';
    protected $get_affiliateName        = '';
    protected $get_number               = '';
    protected $get_inboundCallId        = '';
    protected $get_inboundPhoneNumber   = '';
    protected $get_totalAmount          = '';
    protected $get_targetName           = '';
    protected $get_Target_Description   = '';
    protected $get_targetId             = '';
    protected $get_targetBuyerId        = '';
    protected $get_targetBuyer          = '';
    protected $get_timeToConnect        = null;
    protected $get_callConnectionLength = null;
    protected $get_targetNumber         = '';
    protected $get_recordingUrl         = '';
    protected $get_callLengthInSeconds  = null;
    protected $get_callCompletedDt      = '';
    protected $get_payoutAmount         = null;
    protected $get_profit               = '';
    protected $get_duplicated_status    = 'No';
    protected $get_source_hangup        = '';
    protected $get_customer_name_id     = null;
    protected $get_revenue              = null;
    protected $has_annotations          = 'No';
    protected $get_call_log_status      = 'Active';
    protected $get_call_qualification   = 'Not Qualified';
    protected $get_city                 = '';
    protected $get_state                = '';
    protected $get_zipcode              = '';
    protected $get_market               = '';
    protected $get_type                 = '';
    protected $payout                   = [];

    public function __construct()
    {
        $this->middleware('auth');
        self::$RingbaApiHelpers = new RingbaApiHelpers();
        self::$RingbaCallLog    = new RingbaCallLog();
    }

    public function getRingbaDataForm()
    {
        $lastDataFetchedDate = RingbaDataFetchedLog::all();
        return Inertia::render('Ringba/GetRingbaData', [
            'lastDataFetchedDate' => $lastDataFetchedDate,
        ]);
    }

    /**
     * @method use for get data By Scheduler
     * @call form \Illuminate\Console\Scheduling\Schedule
     * @return void
     */
    public function getRingbaDataByScheduler()
    {
        $startDate   = now()->subDay()->format('Y-m-d');
        $endDate     = now()->addDay()->format('Y-m-d');
        $offset      = 0;
        $apiResponse = self::$RingbaApiHelpers->getRingbaData($startDate, $endDate, $offset);
        $this->storeRingbaDataLogs($startDate, $endDate);
        $this->ringbaCallLogs($apiResponse->report->records);
    }

    public function getCallLogsScheduler()
    {
        ignore_user_abort();
        $this->ringbaCallLogs();
    }

    /**
     * @method for ringba calllog
     * @return void
     */
    public function ringbaCallLogs($apiData)
    {
        CampaignController::getNewCampaigns();
        $sn_id = empty(self::$RingbaCallLog->latest('id')->first()->id) ? 0 : self::$RingbaCallLog->latest('id')->first()->id;

        foreach ($apiData as $row) {
            $sn_id++;
            $this->insertCallLogs($row);
            $ringbaCallLogs          = new RingbaCallLog();
            $checkRingbaCallLogs     = findDataByInboundId(self::$RingbaCallLog, $row->inboundCallId);
            $checkArchiveCallLogs    = findDataByInboundId(new ArchivedCallLog(), $row->inboundCallId);
            $checkPendingBillCallLog = findDataByInboundId(new PendingBillCallLog(), $row->inboundCallId);
            $checkBilledCallLag      = findDataByInboundId(new BilledCallLog(), $row->inboundCallId);
            $checkExceptionCallLog   = findDataByInboundId(new Exception(), $row->inboundCallId);

            if ($checkRingbaCallLogs !== null) {
                // for existing data update
                $checkRingbaCallLogs->call_Logs_status = $this->get_call_log_status;
                $this->ringbaDataObject($checkRingbaCallLogs);
            } else {
                if ($checkRingbaCallLogs || $checkArchiveCallLogs || $checkPendingBillCallLog || $checkBilledCallLag || $checkExceptionCallLog) {
                    continue;
                }

                $ringbaCallLogs->SN = "Exp-{$sn_id}";
                $ringbaCallLogs->call_Logs_status = $this->get_call_log_status;

                $this->ringbaDataObject($ringbaCallLogs);
                $campaign = Campaign::where('campaign_name', $this->get_campaignName)->select(['id', 'connection_duration'])->first();

                $market_exception = $campaign->marketExceptions()
                    ->where('market_id', $this->get_market)
                    ->where('call_type', $this->get_type)
                    ->where('start_date', '<=', date('d-M-y', $this->get_dtStamp / 1000))
                    ->count();

                if ($market_exception > 0) {
                    $this->insertExceptions($ringbaCallLogs->id);
                } else {
                    if ((int)$this->get_callLengthInSeconds < (int)$campaign->connection_duration || is_null($this->get_callLengthInSeconds)) {
                        $this->moveToArchive($ringbaCallLogs->id);
                    }
                }
            }
        }
        // for insert Affiliate
        $this->getAffiliate();

        // for insert Customer
        $this->getCustomer();
    }

    /**
     * @method for convert and assign value from String to Array
     * @param mixed $row
     * @return void
     */
    private function insertCallLogs($item)
    {
        if (isset($item->previouseCallDateTime)) {
            $this->get_dtStamp = $item->previouseCallDateTime;
        }
        if (isset($item->campaignId)) {
            $this->get_campaignId = $item->campaignId;
        }
        if (isset($item->campaignName)) {
            $this->get_campaignName = $item->campaignName;
        }
        if (isset($item->publisherId)) {
            $this->get_affiliateId = $item->publisherId;
        }
        if (isset($item->publisherName)) {
            $this->get_affiliateName = $item->publisherName;
        }
        if (isset($item->number)) {
            $this->get_number = $item->number;
        }
        if (isset($item->inboundCallId)) {
            $this->get_inboundCallId = $item->inboundCallId;
        }
        if (isset($item->inboundPhoneNumber)) {
            if ($item->inboundPhoneNumber) {
                $this->get_inboundPhoneNumber = $item->inboundPhoneNumber;
                $this->zipCodeInfo($this->get_inboundPhoneNumber);
            } else {
                $this->get_inboundPhoneNumber = '';
            }
        }
        if (isset($item->totalCost)) {
            $this->get_totalAmount = $item->totalCost;
        }
        if (isset($item->callCompletedDt)) {
            $this->get_callCompletedDt = $item->callCompletedDt;
        }
        if (isset($item->endCallSource)) {
            $this->get_source_hangup = $item->endCallSource;
        }
        if (isset($item->profitGross)) {
            if (isset($item->profitGross)) {
                $this->get_profit = $item->profitGross;
            } else {
                $this->get_profit = 0;
            }
        }

        if (isset($item->targetName)) {
            $this->get_targetName = $item->targetName;
            if (!empty($this->get_targetName)) {
                $result = Target::where('Ringba_Targets_Name', 'LIKE', "%{$item->targetName}%")->first();
                if ($result) {
                    $this->get_Target_Description = $result->Description;
                    $this->get_customer_name_id = $result->Customer;
                }
            } else {
                $this->get_Target_Description = '';
                $this->get_customer_name_id = null;
            }
        }

        if (isset($item->connectedCallLengthInSeconds) && isset($item->callLengthInSeconds)) {
            $this->get_timeToConnect = $item->callLengthInSeconds - $item->connectedCallLengthInSeconds;
            $this->get_callConnectionLength = $item->connectedCallLengthInSeconds;
        } elseif (isset($item->connectedCallLengthInSeconds) && !isset($item->callLengthInSeconds)) {
            $this->get_callConnectionLength = $item->connectedCallLengthInSeconds;
            $this->get_timeToConnect = 0;
        } elseif (!isset($item->connectedCallLengthInSeconds) && isset($item->callLengthInSeconds)) {
            $this->get_timeToConnect = $item->callLengthInSeconds;
            $this->get_callConnectionLength = 0;
        } else {
            $this->get_callConnectionLength = 0;
            $this->get_timeToConnect = 0;
        }

        if (isset($item->targetNumber)) {
            $this->get_targetNumber = $item->targetNumber;
        }

        if (isset($item->recordingUrl)) {
            $this->get_recordingUrl = $item->recordingUrl;
        }
        if (isset($item->conversionAmount)) {
            $this->get_revenue = $item->conversionAmount;
        } else {
            $this->get_revenue = 0;
        }
        if (isset($item->callLengthInSeconds)) {
            $this->get_callLengthInSeconds = $item->callLengthInSeconds;
        }

        if (isset($item->payoutAmount)) {
            $this->get_payoutAmount = $item->payoutAmount;
        } else {
            $this->get_payoutAmount = 0;
        }
        if (isset($item->isDuplicate)) {
            if ($item->isDuplicate) {
                $this->get_duplicated_status = 'Yes';
            } else {
                $this->get_duplicated_status = 'No';
            }
        }
    }

    /**
     * @param mixed $inboundPhoneNumber
     * @return void
     */
    private function zipCodeInfo($inboundPhoneNumber)
    {
        $npanxx_number = substr($inboundPhoneNumber, 2, 6);
        $result = ZipCodeData::select(['ZipCode', 'State', 'City', 'FIPS', 'NXXUseType'])
            ->where('NPANXX', $npanxx_number)
            ->orderBy('ZipCodeCount', 'DESC')
            ->first();

        if ($result) {
            $res = ZipcodeByTelevisionMarket::select('Market')
                ->where('fips', $result->FIPS)
                ->where('zip_code', $result->ZipCode)
                ->first();
            $this->get_zipcode = $result->ZipCode;
            $this->get_state   = $result->State;
            $this->get_city    = $result->City;
            $this->get_market  = $res->Market ?? '';
            $this->get_type    = $result->NXXUseType;
        } else {
            $this->get_zipcode = '';
            $this->get_state   = '';
            $this->get_city    = '';
            $this->get_market  = '';
            $this->get_type    = '';
        }
    }

    /**
     * @request post
     * @param \Illuminate\Http\Request $request
     * @param array $inboundIds
     * @return void
     */
    public function updateByInboundIds(Request $request)
    {
        $inboundId   = $request->inboundId;
        $result      = $this->updateData($inboundId);
        $updatedData = RingbaCallLog::where('inbound_id', $inboundId)->get();

        return response()->json($updatedData, $result->getStatusCode());
    }

    /**
     * @method for update data by $inboundId
     * @param mixed $inboundId
     * @return void
     */
    private function updateData($inboundId)
    {
        $response = self::$RingbaApiHelpers->getUpdateData($inboundId);

        if (!empty($response->getData())) {
            $row = $response->getData();
            $this->insertCallLogs($row[0]);

            $ringbaCallLogs = findDataByInboundId(self::$RingbaCallLog, $inboundId);
            $ringbaCallLogs->call_Logs_status = $this->get_call_log_status;
            $this->ringbaDataObject($ringbaCallLogs);
            return $response;
        } else {
            return $response;
        }
    }

    /**
     * @method for bind ringba data & save data
     * @param mixed Object instance $instance
     * @return void
     */
    private function ringbaDataObject($instance)
    {
        $instance->Call_Date_Time         = $this->get_callCompletedDt ? date('Y-m-d h:i:s', $this->get_callCompletedDt / 1000) : dateFormat($this->get_dtStamp / 1000);
        $instance->Call_Date              = dateFormat($this->get_dtStamp / 1000);
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
        $instance->Target_Number          = $this->get_targetNumber;
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
        $inboundIds = $request->inboundIds;
        $data       = self::$RingbaApiHelpers->getUpdateAnnotation($inboundIds);
        $this->updateAnnotation($inboundIds, $data);
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
        $insertedData = self::$RingbaCallLog::find($insertId);
        $instance     = new Exception();
        $instance->call_Logs_status = 'Exceptions';
        dataMoveHelper($instance, $insertedData);
    }

    /**
     * auto validate data by campaign call duration settings
     * @param mixed $inboundId
     * @return void
     */
    private function moveToArchive($insertId)
    {
        $insertedData = self::$RingbaCallLog::find($insertId);
        $instance     = new ArchivedCallLog();
        $instance->call_Logs_status = 'Archived';
        dataMoveHelper($instance, $insertedData);
    }

    // for get Affiliate
    private function getAffiliate()
    {
        $get_affiliate = RingbaCallLog::distinct()->get(['Affiliate', 'Affiliate_Id']);
        $results       = Affiliate::all();

        $aff_key = [];
        $aff_val = [];
        foreach ($results as $res) {
            array_push($aff_key, $res->affiliate_id);
            array_push($aff_val, $res->affiliate_name);
        }
        // affiliate data insert from Ringba Call Logs
        foreach ($get_affiliate as $aff_item) {
            if (!in_array($aff_item->Affiliate, $aff_val) || !in_array($aff_item->Affiliate_Id, $aff_key)) {
                $affiliateModel = new Affiliate();
                $affiliateModel->affiliate_id = $aff_item->Affiliate_Id;
                $affiliateModel->affiliate_name = $aff_item->Affiliate;
                $affiliateModel->save();
            }
        }
    }

    // for get Customer
    public function getCustomer()
    {
        $get_customers = RingbaCallLog::distinct()->get(['Customer']);
        $all_customer  = Customer::all();
        $customer_arr  = [];
        foreach ($all_customer as $cus) {
            array_push($customer_arr, $cus->customer_name);
        }

        foreach ($get_customers as $customer) {
            if ($customer->Customer && !in_array($customer->Customer, $customer_arr)) {
                $customer_inc = new Customer();
                $customer_inc->customer_name = $customer->Customer;
                $customer_inc->save();
            }
        }

        return true;
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return success response
     */
    public function dateWiseData(Request $request)
    {
        $totalDataCount = 0;
        $startDate      = $request->start_date;
        $endDate        = $request->end_date;
        $response       = self::$RingbaApiHelpers->totalDataCount($startDate, $endDate);

        if (isset($response->isSuccessful) && $response->isSuccessful) {
            $this->storeRingbaDataLogs($startDate, $endDate);
            $totalDataCount = $response->report->totalCount;
            $requestLength = (int) ceil($totalDataCount / 1000);
            $offset = 0;
            $data = [];
            for ($i = 0; $i < $requestLength; $i++) {
                $apiResponse = self::$RingbaApiHelpers->getRingbaData($startDate, $endDate, $offset);
                $offset += 1000;
                if ($i < 1) {
                    $data = $apiResponse->report->records;
                } else {
                    $data = array_merge($data, $apiResponse->report->records);
                }
            }
            $this->ringbaCallLogs($data);
            // FetchRingbaData::dispatch($data);
            return response()->json(['msg' => 'Data fetched Successfully'], 200);
        } elseif (isset($response->isSuccessful) && !$response->isSuccessful) {
            return response()->json(['msg' => 'End date must be later than Start date'], 201);
        } else {
            return response()->json(['msg' => 'Data fetching failed'], 500);
        }
    }

    public function storeRingbaDataLogs($start_date, $end_date)
    {
        RingbaDataFetchedLog::truncate();
        RingbaDataFetchedLog::create([
            'start_date' => $start_date,
            'end_date'   => $end_date,
        ]);
    }

    public function callLogsReport()
    {
        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $ringbaDataQuery = self::$RingbaCallLog::query();
            $groupName = $conditions->groupName;
            foreach ($conditions->items as $cond) {
                $ringbaDataQuery->{$this->condTypes[$groupName]}(function ($q) use ($cond, $groupName) {
                    if ($cond->value !== null && $cond->value !== '' && gettype($cond->value) === 'array') {
                        foreach ($cond->value as $key => $value) {
                            $this->RingbaMakeConditionQuery($q, $groupName, $cond->field, $cond->operator, $value, $cond->dataType, $key, 'array');
                        }
                    } else {
                        $this->RingbaMakeConditionQuery($q, $groupName, $cond->field, $cond->operator, $cond->value, $cond->dataType, 0, '');
                    }
                });
            }
            return $ringbaDataQuery->paginate(request('itemPerPage') ?? 10);
        }

        $allCallLogs = self::$RingbaCallLog::paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $allCallLogs;
        }

        $campaignsWithAnnotations = Campaign::with(['annotations' => function ($query) {
            $query->orderBy('annotations.order');
        }])->get();

        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Ringba/CallLogsReport', [
            'allCallLogs'              => $allCallLogs,
            'campaignsWithAnnotations' => $campaignsWithAnnotations,
            'columnsData'              => $columnsData

        ]);
    }

    public function changeAnnotation(Request $request, $tableName)
    {
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $logName      = trim(preg_replace('/(?<!\ )[A-Z]/', ' $0', $tableName));

        if ($tableName == 'RingbaCallLogs') {
            $callLog = RingbaCallLog::findOrFail($request->input('indexId'));
            $id = $callLog->id;
        } elseif ($tableName == 'PendingCallLogs') {
            $callLog = PendingBillCallLog::findOrFail($request->input('indexId'));
            $id = $callLog->id;
        } elseif ($tableName == 'BilledCallLogs') {
            $callLog = BilledCallLog::findOrFail($request->input('indexId'));
            $id = $callLog->id;
        } else {
            return response()->json([
                'msg' => 'Please, reload and try again.'
            ], 404);
        }

        $has_annotation = 'Yes';
        if (!$request->input('annotation_id')) {
            $has_annotation = 'No';
        }

        $callLog->update([
            'Annotation_Tag' => $request->input('annotation_id'),
            'Has_Annotation' => $has_annotation,
        ]);

        activity($logName)->event('updated')
            ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
            ->log("Annotation Updated");

        return response()->json([
            'has_annotation' => $callLog->Has_Annotation,
            'msg'            => 'Annotation Updated.'
        ]);
    }

    /**
     * @method for move data from PendingCallLog to RingbaCallLog
     * @method post
     * @param array|string
     * @param \Illuminate\Http\Request $request
     */
    public function fromPendingBill(Request $request)
    {
        $inboundIds = $request->inboundIds;
        $result = false;
        if (is_array($inboundIds)) {
            $i = 0;
            while ($i < count($inboundIds)) {
                $dataById = findDataByInboundId(new PendingBillCallLog(), $inboundIds[$i]);
                self::$RingbaCallLog->call_Logs_status = 'Active';
                $result = dataMoveHelper(self::$RingbaCallLog, $dataById);
                $i++;
            }
        }
        if ($result) {
            return response()->json(['msg' => 'Data moved to Call Logs successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
        }
    }

    /**
     * @method POST
     * @param \Illuminate\Http\Request $request
     * @param array|string
     */
    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;
        $i            = 0;

        while ($i < $idsCount) {
            $result = DB::table('ringba_call_logs')->where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Ringba Call Logs')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function updateRevenue(Request $request)
    {
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $id           = RingbaCallLog::where('Inbound_Id', '=', $request->inboundIds[0])->pluck('id')->first();
        $result       = RingbaCallLog::where('Inbound_Id', '=', $request->inboundIds[0])->update(['Revenue' => '', 'payoutAmount' => '']);

        if ($result) {
            activity('Ringba Call Logs')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("Revenue and payout cleared");
        }
    }
}
