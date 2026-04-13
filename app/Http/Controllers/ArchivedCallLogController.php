<?php

namespace App\Http\Controllers;

use App\Models\ArchivedCallLog;
use App\Models\RingbaCallLog;
use App\Models\TableDetails;
use App\Support\ReportTableSort;
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
        if (request('filteredValue')) {
            $allowedFields = [
                'SN',
                'Call_Date_Time',
                'Call_Date',
                'Campaign',
                'Inbound_Id',
                'Affiliate',
                'Market',
                'Inbound',
                'Dialed',
                'Type',
                'Customer',
                'Target',
                'Target_Number',
                'Target_Description',
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
                'Call_Length_In_Seconds' => 'call_Length_In_Seconds',
                'Payout' => 'payoutAmount',
                'Time' => 'Call_Date_Time',
            ];
            $ringbaDataQuery = ArchivedCallLog::query();

            if (!empty(request('orderBy'))) {
                $ringbaDataQuery->orderBy('Call_Date_Time', request('orderBy'));
            }

            $this->applyRingbaFilters($ringbaDataQuery, request('filteredValue'), $allowedFields, $fieldMap);

            if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortFieldMap = [
                    'Call_Length_In_Seconds' => 'call_Length_In_Seconds',
                    'Payout' => 'payoutAmount',
                ];
                $dbSortField = $sortFieldMap[$sortField] ?? $sortField;
                $sortableColumns = [
                    'SN', 'Call_Date_Time', 'Inbound_Id', 'Affiliate', 'Market', 'Campaign',
                    'Inbound', 'Dialed', 'Type', 'Customer', 'Target', 'Target_Number',
                    'Target_Description', 'call_Length_In_Seconds', 'Revenue', 'Conn_Duration',
                    'payoutAmount', 'Total_Cost', 'Profit', 'City', 'State', 'Zipcode',
                ];
                if (in_array($dbSortField, $sortableColumns)) {
                    ReportTableSort::apply(
                        $ringbaDataQuery,
                        $dbSortField,
                        $sortOrder,
                        $sortableColumns,
                        ReportTableSort::RINGBA_NUMERIC_SORT_COLUMNS
                    );
                }
            }

            return $ringbaDataQuery->paginate(request('itemPerPage') ?? 10);
        }

        $query = ArchivedCallLog::query();

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortFieldMap = [
                'Call_Length_In_Seconds' => 'call_Length_In_Seconds',
                'Payout' => 'payoutAmount',
            ];
            $dbSortField = $sortFieldMap[$sortField] ?? $sortField;
            $sortableColumns = [
                'SN', 'Call_Date_Time', 'Inbound_Id', 'Affiliate', 'Market', 'Campaign',
                'Inbound', 'Dialed', 'Type', 'Customer', 'Target', 'Target_Number',
                'Target_Description', 'call_Length_In_Seconds', 'Revenue', 'Conn_Duration',
                'payoutAmount', 'Total_Cost', 'Profit', 'City', 'State', 'Zipcode',
            ];
            if (in_array($dbSortField, $sortableColumns)) {
                ReportTableSort::apply(
                    $query,
                    $dbSortField,
                    $sortOrder,
                    $sortableColumns,
                    ReportTableSort::RINGBA_NUMERIC_SORT_COLUMNS
                );
            }
        }

        $archivedCallLogs = $query->paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $archivedCallLogs;
        }
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Ringba/ArchivedCallLogReports', [
            'archivedCallLogs'         => $archivedCallLogs,
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
        // static data
        $ids          = [];
        $Inbound_Ids  = $request->inboundIds;
        $idsCount     = count($Inbound_Ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';

        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $archivedCallLog = new ArchivedCallLog();

            // find existing record
            $existData = findDataByInboundId($archivedCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }

            // get data for store data
            $data   = findDataByInboundId(new RingbaCallLog(), $Inbound_Id);
            if (!empty($data)) {
                $ids[]  = $data->id;
            } else {
                return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
            }


            $archivedCallLog->call_Logs_status = 'Archived';
            $result = dataMoveHelper($archivedCallLog, $data);
        }

        if ($result) {
            activity('Ringba Call Logs')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been moved to arichive");
            return response()->json(['msg' => 'Data moved to Arichive successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
        }
    }

    public function getcolumn()
    {
        $arch = new ArchivedCallLog();
    }

    public function moveToCallLog(Request $request)
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
                $dataById   = findDataByInboundId(new ArchivedCallLog(), $inboundIds[$i]);
                if (!empty($dataById)) {
                    $ids[]      = $dataById->id;
                } else {
                    return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
                }

                $ringbaCallLog = new RingbaCallLog();
                $ringbaCallLog->call_Logs_status = 'Active';
                $result = dataMoveHelper($ringbaCallLog, $dataById);
                $i++;
            }
        }

        if ($result) {
            activity('Archived Call Logs')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been moved to Call Logs");
            return response()->json(['msg' => 'Data moved to Call Logs successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
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
            $result = ArchivedCallLog::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Archived Call Logs')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
