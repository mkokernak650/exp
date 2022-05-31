<?php
namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\PendingBillCallLog;
use App\Models\RingbaCallLog;
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
        $campaignsWithAnnotations = Campaign::with(['annotations' => function ($query) {
            $query->orderBy('annotations.order');
        }])->get();

        $results = PendingBillCallLog::orderBy('id', 'asc')->get();
        return Inertia::render('Ringba/PendingCallLogs', [
            'results'                  => $results,
            'campaignsWithAnnotations' => $campaignsWithAnnotations,
        ]);
    }

    /**
     * @param Array of inbound Id
     * @method POST
     * @return JsonResponse Success|| fail
     */
    public function store(Request $request)
    {
        $Inbound_Ids = $request->inboundIds;
        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $pendingBillCallLog = new PendingBillCallLog();

            // find existing record
            $existData = findDataByInboundId($pendingBillCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }
            $ringbaCallLog = new RingbaCallLog();

            // get data for store db
            $data = findDataByInboundId($ringbaCallLog, $Inbound_Id);

            $pendingBillCallLog->call_Logs_status = 'Pending';
            $result = dataMoveHelper($pendingBillCallLog, $data);
        }
        if ($result) {
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
        $inboundIds = $request->inboundIds;
        $result = false;
        if (is_array($inboundIds)) {
            $i = 0;

            while ($i < count($inboundIds)) {
                $dataById = findDataByInboundId(new PendingBillCallLog(), $inboundIds[$i]);
                $ringbaCallLog = new RingbaCallLog();
                $ringbaCallLog->call_Logs_status = 'Active';
                $result = dataMoveHelper($ringbaCallLog, $dataById);
                $i++;
            }
        }
        if ($result) {
            return response()->json(['msg' => 'Data moved to Call Logs successfully', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'moving failed', 'status_code' => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = DB::table('pending_bill_call_logs')->where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(['msg' => 'Successfully Deleted', 'status_code' => 200]);
        }
        if ($result) {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }
}
