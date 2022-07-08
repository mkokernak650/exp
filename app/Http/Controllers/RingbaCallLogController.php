<?php
namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Affiliate;
use App\Models\ArchivedCallLog;
use App\Models\BilledCallLog;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\RingbaCallLog;
use App\Models\PendingBillCallLog;
use App\Models\RingbaData;
use App\Models\Target;
use App\Models\ZipCodeData;
use App\Models\Exception;
use App\Models\MarketExcptions;
use App\Models\ZipcodeByTelevisionMarket;
use App\Models\RingbaDataFetchedLog;
use App\Http\Controllers\CampaignController;

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
    protected $has_annotations = 'No';
    protected $get_call_log_status = 'Active';
    protected $get_call_qualification = 'Not Qualified';
    protected $get_city = '';
    protected $get_state = '';
    protected $get_zipcode = '';
    protected $get_market = '';
    protected $get_type = '';
    // protected $array = [];
    protected $payout = [];

    public function __construct()
    {
        $this->middleware('auth');
        self::$RingbaApiHelpers = new RingbaApiHelpers();
        self::$RingbaCallLog = new RingbaCallLog();
    }

    public function getRingbaDataForm()
    {
        $lastDataFetchedDate = RingbaDataFetchedLog::all();
        return Inertia::render('Ringba/GetRingbaData', [
            'lastDataFetchedDate' => $lastDataFetchedDate,
        ]);
    }

    /**
     * for move data from Ringba temporary table id
     * @param \Illuminate\Http\Request $request post
     * @return void
     */
    public function moveDataToCallLogs(Request $request)
    {
        // $ids = $request->id;
        $ids = [45, 46, 47, 48, 49, 50, 51, 52, 53];
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
        $ids = [1, 2];
        RingbaData::whereIn('id', $ids)->delete();
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

    public function getCallLogsScheduler()
    {
        ignore_user_abort();
        $this->ringbaCallLogs();
    }

    /**
     * @method for ringba calllog
     * @return void
     */
    public function ringbaCallLogs($getRingbaDateById = null)
    {
        CampaignController::getNewCampaigns();
        $ringbaMain = $getRingbaDateById === null ? RingbaData::all() : $getRingbaDateById;

        $sn_id = empty(self::$RingbaCallLog->latest('id')->first()->id) ? 0 : self::$RingbaCallLog->latest('id')->first()->id;

        foreach ($ringbaMain as $row) {
            $sn_id++;
            if ($row->columns) {
                $this->columns($row->columns);
            }
            if ($row->events) {
                $this->events($row->events);
            }
            if ($row->tags) {
                $this->tags($row->tags);
            }

            $ringbaCallLogs = new RingbaCallLog();

            $checkRingbaCallLogs = findDataByInboundId(self::$RingbaCallLog, $this->get_inboundCallId);
            $checkArchiveCallLogs = findDataByInboundId(new ArchivedCallLog(), $this->get_inboundCallId);
            $checkPendingBillCallLog = findDataByInboundId(new PendingBillCallLog(), $this->get_inboundCallId);
            $checkBilledCallLag = findDataByInboundId(new BilledCallLog(), $this->get_inboundCallId);
            $checkExceptionCallLog = findDataByInboundId(new Exception(), $this->get_inboundCallId);

            if ($checkRingbaCallLogs !== null) {
                // for existing data update
                $checkRingbaCallLogs->call_Logs_status = $this->get_call_log_status;
                $this->ringbaDataObject($checkRingbaCallLogs);
            } else {
                if ($checkRingbaCallLogs || $checkArchiveCallLogs || $checkPendingBillCallLog || $checkBilledCallLag || $checkExceptionCallLog) {
                    // $row->delete();
                    continue;
                }

                $ringbaCallLogs->SN = "Exp-{$sn_id}";
                $ringbaCallLogs->call_Logs_status = $this->get_call_log_status;

                $this->ringbaDataObject($ringbaCallLogs);
                // $row->delete();

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
            $this->get_accountId =
                $this->get_campaignId =
                $this->get_campaignName =
                $this->get_affiliateId =
                $this->get_affiliateName =
                $this->get_number =
                $this->get_inboundCallId =
                $this->get_inboundPhoneNumber =
                $this->get_totalAmount =
                $this->get_targetName =
                $this->get_Target_Description =
                $this->get_targetId =
                $this->get_targetBuyerId =
                $this->get_targetBuyer =
                $this->get_targetNumber =
                $this->get_recordingUrl =
                $this->get_callCompletedDt =
                $this->get_profit =
                $this->get_source_hangup =
                $this->get_annotations_tag =
                $this->get_city =
                $this->get_state =
                $this->get_zipcode =
                $this->get_market =
                $this->get_type = '';

            $this->get_callLengthInSeconds =
                $this->get_payoutAmount =
                $this->get_customer_name_id =
                $this->get_revenue =
                $this->get_timeToConnect =
                $this->get_callConnectionLength = null;
        }
        // for inser Affiliate
        $this->getAffiliate();

        // for insert Customer
        $this->getCustomer();

        // dd('payout', $this->payout, 'count', count($this->payout));
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
            } elseif ($item->name === 'accountId') {
                $this->get_accountId = $item->formattedValue;
            } elseif ($item->name === 'campaignId') {
                $this->get_campaignId = $item->formattedValue;
            } elseif ($item->name === 'campaignName') {
                $this->get_campaignName = $item->formattedValue;
            } elseif ($item->name === 'affiliateId') {
                $this->get_affiliateId = $item->formattedValue;
            } elseif ($item->name === 'affiliateName') {
                $this->get_affiliateName = $item->formattedValue;
            } elseif ($item->name === 'number') {
                $this->get_number = $item->formattedValue;
            } elseif ($item->name === 'inboundCallId') {
                $this->get_inboundCallId = $item->formattedValue;
            } elseif ($item->name === 'inboundPhoneNumber') {
                if ($item->formattedValue) {
                    $this->get_inboundPhoneNumber = $item->formattedValue;
                    $this->zipCodeInfo($this->get_inboundPhoneNumber);
                } else {
                    $this->get_inboundPhoneNumber = '';
                }
            } elseif ($item->name === 'totalAmount') {
                $this->get_totalAmount = $item->formattedValue;
            } elseif ($item->name === 'callCompletedDt') {
                $this->get_callCompletedDt = $item->formattedValue;
            } elseif ($item->name === 'source') {
                $this->get_source_hangup = $item->formattedValue;
            } elseif ($item->name === 'profit') {
                $this->get_profit = $item->formattedValue;
            } elseif ($item->name === 'targetName') {
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
            } elseif ($item->name === 'targetId') {
                $this->get_targetId = $item->formattedValue;
            } elseif ($item->name === 'targetBuyerId') {
                $this->get_targetBuyerId = $item->formattedValue;
            } elseif ($item->name === 'targetBuyer') {
                $this->get_targetBuyer = $item->formattedValue;
            } elseif ($item->name === 'timeToConnect') {
                $this->get_timeToConnect = $item->formattedValue;
            } elseif ($item->name === 'callConnectionLength') {
                $this->get_callConnectionLength = $item->formattedValue;
            } elseif ($item->name === 'targetNumber') {
                $this->get_targetNumber = $item->formattedValue;
            } elseif ($item->name === 'recordingUrl') {
                $this->get_recordingUrl = $item->formattedValue;
            } elseif ($item->name === 'conversionAmount') {
                // $this->get_conversionAmount = $item->formattedValue;
                $this->get_revenue = $item->formattedValue;
            } elseif ($item->name === 'callLengthInSeconds') {
                $this->get_callLengthInSeconds = $item->formattedValue;
            } elseif ($item->name === 'payoutAmount') {
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
                $this->get_duplicated_status = 'Yes';
                return;
            } else {
                $this->get_duplicated_status = 'No';
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
                $this->get_annotations_tag = '';
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
        // dd($npanxx_number);
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
            $this->get_state = $result->State;
            $this->get_city = $result->City;
            $this->get_market = $res->Market ?? '';
            $this->get_type = $result->NXXUseType;
        } else {
            $this->get_zipcode = '';
            $this->get_state = '';
            $this->get_city = '';
            $this->get_market = '';
            $this->get_type = '';
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
        $inboundIds = $request->inboundIds;
        $this->updateData($inboundIds);
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
        if ($row->columns) {
            $this->columns($row->columns);
        }
        if ($row->events) {
            $this->events($row->events);
        }
        if ($row->tags) {
            $this->tags($row->tags);
        }
        $ringbaCallLogs = findDataByInboundId(self::$RingbaCallLog, $this->get_inboundCallId);
        $ringbaCallLogs->call_Logs_status = $this->get_call_log_status;
        $this->ringbaDataObject($ringbaCallLogs);
    }

    /**
     * @method for bind ringba data & save data
     * @param mixed Object instance $instance
     * @return void
     */
    private function ringbaDataObject($instance)
    {
        $instance->Call_Date_Time = $this->get_callCompletedDt ? date('Y-m-d h:i:s', $this->get_callCompletedDt / 1000) : dateFormat($this->get_dtStamp / 1000);
        // $instance->Call_Date_Time         = date("d-M-y H:i:s", $this->get_dtStamp / 1000);
        $instance->Call_Date = dateFormat($this->get_dtStamp / 1000);
        $instance->Campaign = $this->get_campaignName;
        $instance->Campaign_Id = $this->get_campaignId;
        $instance->Affiliate = $this->get_affiliateName;
        $instance->Affiliate_Id = $this->get_affiliateId;
        $instance->Inbound = $this->get_inboundPhoneNumber;
        $instance->Inbound_Id = $this->get_inboundCallId;
        $instance->Dialed = $this->get_number;
        $instance->Time_To_Call = $this->get_timeToConnect;
        $instance->Account_Id = $this->get_accountId;
        $instance->Total_Cost = $this->get_totalAmount;
        $instance->payoutAmount = $this->get_payoutAmount;
        $instance->Conn_Duration = $this->get_callConnectionLength;
        $instance->call_Length_In_Seconds = $this->get_callLengthInSeconds;
        $instance->Profit = $this->get_profit;
        $instance->Target = $this->get_targetName;
        $instance->Target_Number = $this->get_targetNumber;
        $instance->Target_Description = $this->get_Target_Description;
        $instance->Revenue = $this->get_revenue;
        $instance->Duplicate_Call = $this->get_duplicated_status;
        $instance->Source_Hangup = $this->get_source_hangup;
        $instance->City = $this->get_city;
        $instance->State = $this->get_state;
        $instance->Zipcode = $this->get_zipcode;
        $instance->Market = $this->get_market;
        $instance->Type = $this->get_type;
        $instance->Call_Qualification = $this->get_call_qualification;
        $instance->Recording_Url = $this->get_recordingUrl;
        $instance->Customer = $this->get_customer_name_id;
        $instance->Has_Annotation = $this->has_annotations;
        $instance->Annotation_Tag = $this->get_annotations_tag;
        $test = $instance->save();
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
        $instance = new ArchivedCallLog();
        $instance->call_Logs_status = 'Archived';
        dataMoveHelper($instance, $insertedData);
    }

    // for get Affiliate
    private function getAffiliate()
    {
        $get_affiliate = RingbaCallLog::distinct()->get(['Affiliate', 'Affiliate_Id']);
        $results = Affiliate::all();
        $affiliate_api = self::$RingbaApiHelpers->getAffiliate();

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
        // affiliate data insert from Ringba Api
        foreach ($affiliate_api as $api_aff_item) {
            if (!in_array($api_aff_item->name, $aff_val) || !in_array($api_aff_item->id, $aff_key)) {
                $affiliateModel = new Affiliate();
                $affiliateModel->affiliate_id = $api_aff_item->id;
                $affiliateModel->affiliate_name = $api_aff_item->name;
                $affiliateModel->save();
            }
        }
    }

    // for get Customer
    public function getCustomer()
    {
        $get_customers = RingbaCallLog::distinct()->get(['Customer']);
        $all_customer = Customer::all();
        $customer_arr = [];
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
        $get_past_days_range = null;
        $get_days_range = null;

        $start_date = date_create($request->start_date);
        $end_date = date_create($request->end_date);
        $current_date = date_create(date('m/d/Y'));

        $start_current_diff = date_diff($start_date, $current_date);
        $start_current_diff_result = $start_current_diff->format('%a');

        $start_end_diff = date_diff($start_date, $end_date);
        $start_end_diff_result = $start_end_diff->format('%a');

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

        $result = self::$RingbaApiHelpers->getRingbaData($get_past_days_range, $get_days_range);

        RingbaDataFetchedLog::truncate();
        RingbaDataFetchedLog::create([
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
        ]);
        $this->ringbaCallLogs();
        // if ($result) {
        //     $client = new Client(
        //         [
        //             // 'base_uri' => 'http://127.0.0.1:8000',
        //             'timeout'  => 0.5,
        //         ]
        //     );
        //     try {
        //         $response = $client->get('http://127.0.0.1:8000/get-call-logs-secheduler/');
        //     } catch (RequestException $e) {
        //         return (string) $e->getResponse()->getBody();
        //     }
        // }

        return $result;

        // return Inertia::render(
        //     'Ringba/TempRingbaData',
        //     [
        //         'ringbaData' => RingbaData::all()
        //     ]
        // );
    }

    /**
     * for get Ringba temporary data
     * @return JsonObject
     */
    public function tempRingbaData()
    {
        $ringbaData = RingbaData::all();
        return Inertia::render('Ringba/TempRingbaData', [
            'ringbaData' => $ringbaData
        ]);
        //    RingbaData::chunk(100, function ($items) {
        //         foreach ($items as $item) {
        //             array_push(self::$test,$item);
        //         }
        //     });
        //     return Inertia::render('Ringba/TempRingbaData', [
        //         'ringbaData' => self::$test
        //     ]);
    }

    public function callLogsReport()
    {
        $campaignsWithAnnotations = Campaign::with(['annotations' => function ($query) {
            $query->orderBy('annotations.order');
        }])->get();

        return Inertia::render('Ringba/callLogsReport', [
            'allCallLogs'              => self::$RingbaCallLog::orderBy('id', 'asc')->get(),
            'campaignsWithAnnotations' => $campaignsWithAnnotations
        ]);
    }

    public function changeAnnotation(Request $request, $tableName)
    {
        if ($tableName == 'ringbaCallLog') {
            $callLog = RingbaCallLog::findOrFail($request->input('indexId'));
        } elseif ($tableName == 'pendingBillCallLog') {
            $callLog = PendingBillCallLog::findOrFail($request->input('indexId'));
        } elseif ($tableName == 'billedCallLog') {
            $callLog = BilledCallLog::findOrFail($request->input('indexId'));
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
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = DB::table('ringba_call_logs')->where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function tempDataDelete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = DB::table('ringba_data')->where('id', $request->selectedRowIds[$i])->delete();
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
        RingbaCallLog::where('Inbound_Id', '=', $request->inboundIds[0])->update(['Revenue' => '', 'payoutAmount' => '']);
    }
}
