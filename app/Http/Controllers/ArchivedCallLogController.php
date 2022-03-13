<?php

namespace App\Http\Controllers;

use App\Models\ArchivedCallLog;
use App\Models\RingbaCallLog;
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
        $results = ArchivedCallLog::orderBy('id', 'asc')->get();
        return Inertia::render('Ringba/ArchivedCallLogReports', [
            'archivedCallLogs' => $results
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
        $Inbound_Ids = $request->inboundIds;

        $result = false;

        foreach ($Inbound_Ids as $Inbound_Id) {
            $archivedCallLog = new ArchivedCallLog();

            // find existing record
            $existData = findDataByInboundId($archivedCallLog, $Inbound_Id);
            if ($existData) {
                continue;
            }

            // get data for store data
            $data = findDataByInboundId(new RingbaCallLog(), $Inbound_Id);
            $archivedCallLog->call_Logs_status = 'Archived';
            $result = dataMoveHelper($archivedCallLog, $data);
        }

        if ($result) {
            return response()->json(["msg" => "Data moved to Arichive successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }

    public function getcolumn()
    {
        $arch = new ArchivedCallLog();
    }

    public function moveToCallLog(Request $request)
    {
        $inboundIds = $request->inboundIds;
        $result = false;
        if (is_array($inboundIds)) {
            $i = 0;
            while ($i < count($inboundIds)) {
                $dataById = findDataByInboundId(new ArchivedCallLog(), $inboundIds[$i]);
                $ringbaCallLog = new RingbaCallLog();
                $ringbaCallLog->call_Logs_status = 'Active';
                $result = dataMoveHelper($ringbaCallLog, $dataById);
                $i++;
            }
        }
        if ($result) {
            return response()->json(["msg" => "Data moved to Call Logs successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  ArchivedCallLog::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
