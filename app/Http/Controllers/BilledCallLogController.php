<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\BilledCallLog;
use App\Models\Campaign;
use App\Models\PendingBillCallLog;
use App\Models\TableDetails;
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
        if (request('filteredValue')) {
            $allowedFields = [
                'SN',
                'Call_Date_Time',
                'Call_Date',
                'Has_Annotation',
                'Annotation_Tag',
                'call_Logs_status',
                'Duplicate_Call',
                'Inbound_Id',
                'Affiliate',
                'Market',
                'Campaign',
                'Inbound',
                'Dialed',
                'Type',
                'Customer',
                'Target',
                'Target_Number',
                'Target_Description',
                'Source_Hangup',
                'Time_To_Call',
                'call_Length_In_Seconds',
                'Revenue',
                'Conn_Duration',
                'payoutAmount',
                'Total_Cost',
                'Profit',
                'City',
                'State',
                'Zipcode',
            ];
            $fieldMap = [
                'Call_Status' => 'call_Logs_status',
                'Call_Length_In_Seconds' => 'call_Length_In_Seconds',
                'Payout' => 'payoutAmount',
                'Time' => 'Call_Date_Time',
            ];
            $ringbaDataQuery = BilledCallLog::query();

            if (!empty(request('orderBy'))) {
                $ringbaDataQuery->orderBy('Call_Date_Time', request('orderBy'));
            }

            $this->applyRingbaFilters($ringbaDataQuery, request('filteredValue'), $allowedFields, $fieldMap);

            if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortFieldMap = [
                    'Call_Status' => 'call_Logs_status',
                ];
                $dbSortField = $sortFieldMap[$sortField] ?? $sortField;
                $sortableColumns = [
                    'SN', 'Call_Date_Time', 'Has_Annotation', 'Annotation_Tag', 'call_Logs_status',
                    'Duplicate_Call', 'Recording_Url', 'Inbound_Id', 'Affiliate', 'Market', 'Campaign',
                    'Inbound', 'Dialed', 'Type', 'Customer', 'Target', 'Target_Number',
                    'Target_Description', 'Source_Hangup', 'Time_To_Call', 'call_Length_In_Seconds',
                    'Revenue', 'Conn_Duration', 'payoutAmount', 'Total_Cost', 'Profit',
                    'City', 'State', 'Zipcode',
                ];
                if (in_array($dbSortField, $sortableColumns)) {
                    $ringbaDataQuery->orderBy($dbSortField, $sortOrder);
                }
            }

            return $ringbaDataQuery->paginate(request('itemPerPage') ?? 10);
        }

        $query = BilledCallLog::query();

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortFieldMap = [
                'Call_Status' => 'call_Logs_status',
            ];
            $dbSortField = $sortFieldMap[$sortField] ?? $sortField;
            $sortableColumns = [
                'SN', 'Call_Date_Time', 'Has_Annotation', 'Annotation_Tag', 'call_Logs_status',
                'Duplicate_Call', 'Recording_Url', 'Inbound_Id', 'Affiliate', 'Market', 'Campaign',
                'Inbound', 'Dialed', 'Type', 'Customer', 'Target', 'Target_Number',
                'Target_Description', 'Source_Hangup', 'Time_To_Call', 'call_Length_In_Seconds',
                'Revenue', 'Conn_Duration', 'payoutAmount', 'Total_Cost', 'Profit',
                'City', 'State', 'Zipcode',
            ];
            if (in_array($dbSortField, $sortableColumns)) {
                $query->orderBy($dbSortField, $sortOrder);
            }
        }

        $billedCallLogs = $query->paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $billedCallLogs;
        }
        $campaignsWithAnnotations = Campaign::with(['annotations' => function ($query) {
            $query->orderBy('annotations.order');
        }])->get();
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ringba/BilledCallLogs', [
            'billedCallLogs'           => $billedCallLogs,
            'campaignsWithAnnotations' => $campaignsWithAnnotations,
            'columnsData'              => $columnsData

        ]);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return true or false
     */
    public function store(Request $request)
    {
        $ids          = [];
        $Inbound_Ids  = $request->inboundIds;
        $idsCount     = count($Inbound_Ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';

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
            $data   = findDataByInboundId($ringbaCallLog, $Inbound_Id);
            if (!empty($data)) {
                $ids[]  = $data->id;
            } else {
                return response()->json([
                    'msg'         => 'Data Moving failed',
                    'status_code' => 500
                ]);
            }

            // $result = dataMoveHelper(self::$billedCallLog, $data);

            $billedCallLog->SN                     = $data->SN;
            $billedCallLog->Recording_Url          = $data->Recording_Url;
            $billedCallLog->Call_Date_Time         = $data->Call_Date_Time;
            $billedCallLog->Call_Date              = dateFormat($data->Call_Date);
            $billedCallLog->Duplicate_Call         = $data->Duplicate_Call;
            $billedCallLog->Affiliate              = $data->Affiliate;
            $billedCallLog->Affiliate_Id           = $data->Affiliate_Id;
            $billedCallLog->Market                 = $data->Market;
            $billedCallLog->Campaign               = $data->Campaign;
            $billedCallLog->Campaign_Id            = $data->Campaign_Id;
            $billedCallLog->Inbound                = $data->Inbound;
            $billedCallLog->Inbound_Id             = $data->Inbound_Id;
            $billedCallLog->Dialed                 = $data->Dialed;
            $billedCallLog->Type                   = $data->Type;
            $billedCallLog->Target                 = $data->Target;
            $billedCallLog->Target_Number          = $data->Target_Number;
            $billedCallLog->Target_Description     = $data->Target_Description;
            $billedCallLog->Source_Hangup          = $data->Source_Hangup;
            $billedCallLog->Conn_Duration          = $data->Conn_Duration;
            $billedCallLog->Time_To_Call           = $data->Time_To_Call;
            $billedCallLog->call_Length_In_Seconds = $data->call_Length_In_Seconds;
            $billedCallLog->Revenue                = $data->Revenue;
            $billedCallLog->payoutAmount           = $data->payoutAmount;
            $billedCallLog->Total_Cost             = $data->Total_Cost;
            $billedCallLog->Profit                 = $data->Profit;
            $billedCallLog->call_Logs_status       = 'Billed';
            $billedCallLog->City                   = $data->City;
            $billedCallLog->State                  = $data->State;
            $billedCallLog->Zipcode                = $data->Zipcode;
            $billedCallLog->Has_Annotation         = $data->Has_Annotation;
            $billedCallLog->Annotation_Tag         = $data->Annotation_Tag;
            $billedCallLog->Customer               = $data->Customer;
            $result                                = $billedCallLog->save();

            // delete Record from Ringa Call log after transfer Billed call log table;
            $data->delete();
        }
        if ($result) {
            activity('Pending Call Logs')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been moved to billed call logs");
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
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;
        $i            = 0;

        while ($i < $idsCount) {
            $result = BilledCallLog::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Billed Call Logs')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function updateRevenue(Request $request)
    {
        dd($request->all());
        BilledCallLog::where('Inbound_Id', '=', $request->inboundIds[0])->update(['Revenue' => '', 'payoutAmount' => '']);
    }
}
