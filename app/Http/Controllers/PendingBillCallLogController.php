<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\PendingBillCallLog;
use App\Models\RingbaCallLog;
use App\Models\TableDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PendingBillCallLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * for display all data
     * @param null
     * @method GET
     * @return Object data
     */
    public function index()
    {
        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $ringbaDataQuery = PendingBillCallLog::query();
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

        $pendingCallLogs = PendingBillCallLog::paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $pendingCallLogs;
        }
        $campaignsWithAnnotations = Campaign::with(['annotations' => function ($query) {
            $query->orderBy('annotations.order');
        }])->get();
        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Ringba/PendingCallLogs', [
            'pendingCallLogs'                  => $pendingCallLogs,
            'campaignsWithAnnotations'         => $campaignsWithAnnotations,
            'columnsData'                      => $columnsData
        ]);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return JsonResponse Success|| fail
     */
    public function store(Request $request)
    {
        $ids          = [];
        $Inbound_Ids  = $request->inboundIds;
        $idsCount     = count($Inbound_Ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $pendingBillCallLog = new PendingBillCallLog();

            // find existing record
            $existData = findDataByInboundId($pendingBillCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }
            $ringbaCallLog = new RingbaCallLog();

            // get data for store db
            $data   = findDataByInboundId($ringbaCallLog, $Inbound_Id);
            if (!empty($data)) {
                $ids[]  = $data->id;
            } else {
                return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
            }

            $pendingBillCallLog->call_Logs_status = 'Pending';
            $result = dataMoveHelper($pendingBillCallLog, $data);
        }
        if ($result) {
            activity('Ringba Call Logs')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been moved to pending");
            return response()->json(['msg' => 'Data moved to pending successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
        }
    }

    /**
     * @method post
     * @param array
     * @param \Illuminate\Http\Request $request
     */
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
            while ($i < $idsCount) {
                $dataById   = findDataByInboundId(new PendingBillCallLog(), $inboundIds[$i]);
                if (!empty($dataById)) {
                    $ids[] = $dataById->id;
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
            activity('Pending Call Logs')->event('updated')
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
            $result = DB::table('pending_bill_call_logs')->where('id', $ids[$i])->delete();
            $i++;
        }

        if ($result) {
            activity('Pending Call Logs')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        }
        if ($result) {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
