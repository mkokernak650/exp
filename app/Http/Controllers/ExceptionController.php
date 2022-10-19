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
use App\Models\TableDetails;
use App\Models\ZipcodeByTelevisionMarket;

class ExceptionController extends Controller
{
    private static $RingbaApiHelpers;
    private static $Exception;

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
    protected $get_annotations_tag      = '';
    protected $has_annotations          = 'NO';
    protected $get_call_log_status      = 'Exceptions';
    protected $get_call_qualification   = 'Not Qualified';
    protected $get_city                 = '';
    protected $get_state                = '';
    protected $get_zipcode              = '';
    protected $get_market               = '';
    protected $get_type                 = '';

    public function __construct()
    {
        $this->middleware('auth');
        self::$RingbaApiHelpers = new RingbaApiHelpers();
        self::$Exception = new Exception();
    }

    public function index()
    {
        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $ExceptionDataQuery = Exception::query();
            $groupName = $conditions->groupName;
            foreach ($conditions->items as $cond) {
                $ExceptionDataQuery->{$this->condTypes[$groupName]}(function ($q) use ($cond, $groupName) {
                    if ($cond->value !== null && $cond->value !== '' && gettype($cond->value) === 'array') {
                        foreach ($cond->value as $key => $value) {
                            $this->RingbaMakeConditionQuery($q, $groupName, $cond->field, $cond->operator, $value, $cond->dataType, $key, 'array');
                        }
                    } else {
                        $this->RingbaMakeConditionQuery($q, $groupName, $cond->field, $cond->operator, $cond->value, $cond->dataType, 0, '');
                    }
                });
            }
            return $ExceptionDataQuery->paginate(request('itemPerPage') ?? 10);
        }

        $allExceptions = self::$Exception::paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $allExceptions;
        }
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ringba/Exception', [
            'Exceptions'               => $allExceptions,
            'columnsData'              => $columnsData
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
        $data       = self::$RingbaApiHelpers->getUpdateAnnotation($inboundIds);
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
        $ids          = [];
        $inboundIds   = $request->inboundIds;
        $idsCount     = count($inboundIds);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;

        if (is_array($inboundIds)) {
            $i = 0;

            while ($i < count($inboundIds)) {
                $pendingCallLog = new PendingBillCallLog();
                if (!findDataByInboundId($pendingCallLog, $inboundIds[$i])) {
                    $dataById   = findDataByInboundId(self::$Exception, $inboundIds[$i]);
                    if (!empty($dataById)) {
                        $ids[] = $dataById->id;
                    } else {
                        return response()->json(['msg' => 'Data moving failed', 'status_code' => 500]);
                    }


                    $pendingCallLog->call_Logs_status = 'Pending';
                    $result = dataMoveHelper($pendingCallLog, $dataById);
                }
                $i++;
            }
        }

        if ($result) {
            activity('Ringba Exceptions')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been moved to pending");
            return response()->json(['msg' => 'Data moved to Pending successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Data moving failed', 'status_code' => 500]);
        }
    }

    /**
     * @method post
     * @param array
     * @param \Illuminate\Http\Request $request
     */
    public function moveToArhived(Request $request)
    {
        $ids          = [];
        $inboundIds   = $request->inboundIds;
        $idsCount     = count($inboundIds);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $msg          = [];

        if (is_array($inboundIds)) {
            $i = 0;
            while ($i < count($inboundIds)) {
                $archivedCallLog = new ArchivedCallLog();
                $exception = new Exception();

                if (findDataByInboundId($archivedCallLog, $inboundIds[$i]) === null) {
                    $dataById   = findDataByInboundId($exception, $inboundIds[$i]);
                    if (!empty($dataById)) {
                        $ids[]      = $dataById->id;
                    } else {
                        $msg = ['msg' => 'Data moving failed', 'status_code' => 500];
                    }

                    $archivedCallLog->call_Logs_status = 'Archive';
                    $result = dataMoveHelper($archivedCallLog, $dataById);
                    if ($result) {
                        activity('Ringba Exceptions')->event('updated')
                            ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                            ->log("{$idsCount} {$itemsCount} has been moved to archive");
                        $msg = ['msg' => 'Data moved to Archive successfully', 'status_code' => 200];
                    } else {
                        $msg = ['msg' => 'Data moving failed', 'status_code' => 500];
                    }
                } else {
                    $msg = ['msg' => 'Data already exixts', 'status_code' => 500];
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
    public function updateByInboundIds(Request $request)
    {
        $inboundId = $request->inboundId;
        $result = $this->updateExceptionReport($inboundId);

        $updatedData = Exception::where('inbound_id', $inboundId)->get();
        return response()->json($updatedData, $result->getStatusCode());
    }

    public function updateExceptionReport($inboundId)
    {
        $response = self::$RingbaApiHelpers->getUpdateData($inboundId);

        if (!empty($response->getData())) {
            $row = $response->getData();
            $this->insertCallLogs($row[0]);
            $getDataById = findDataByInboundId(self::$Exception, $inboundId);

            $getDataById->Call_Date_Time         = date('d-M-y H:i:s', $this->get_dtStamp / 1000);
            $getDataById->Recording_Url          = $this->get_recordingUrl;
            $getDataById->call_time              = date('d-M-y', $this->get_dtStamp / 1000);
            $getDataById->Duplicate_Call         = $this->get_duplicated_status;
            $getDataById->Affiliate              = $this->get_affiliateName;
            $getDataById->Affiliate_Id           = $this->get_affiliateId;
            $getDataById->Market                 = $this->get_market;
            $getDataById->Campaign               = $this->get_campaignName;
            $getDataById->Campaign_Id            = $this->get_campaignId;
            $getDataById->Inbound                = $this->get_inboundPhoneNumber;
            $getDataById->Inbound_Id             = $this->get_inboundCallId;
            $getDataById->Dialed                 = $this->get_number;
            $getDataById->Type                   = $this->get_type;
            $getDataById->Customer               = $this->get_customer_name_id;
            $getDataById->Target                 = $this->get_targetName;
            $getDataById->Target_Description     = $this->get_Target_Description;
            $getDataById->Source_Hangup          = $this->get_source_hangup;
            $getDataById->Conn_Duration          = $this->get_callConnectionLength;
            $getDataById->Time_To_Call           = $this->get_timeToConnect;
            $getDataById->call_Length_In_Seconds = $this->get_callLengthInSeconds;
            $getDataById->Revenue                = $this->get_revenue;
            $getDataById->payoutAmount           = $this->get_payoutAmount;
            $getDataById->Total_Cost             = $this->get_totalAmount;
            $getDataById->Profit                 = $this->get_profit;
            $getDataById->City                   = $this->get_city;
            $getDataById->State                  = $this->get_state;
            $getDataById->Zipcode                = $this->get_zipcode;
            $getDataById->save();

            return $response;
        } else {
            return $response;
        }
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
        $this->get_callLengthInSeconds = $item->callLengthInSeconds;
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
            $result = Exception::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Ringba Exceptions')->event('deleted')
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
        $id           = Exception::where('Inbound_Id', '=', $request->inboundIds[0])->pluck('id')->first();
        $result       = Exception::where('Inbound_Id', '=', $request->inboundIds[0])->update(['Revenue' => '', 'payoutAmount' => '']);

        if ($result) {
            activity('Ringba Exceptions')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("Revenue and payout cleared");
        }
    }
}
