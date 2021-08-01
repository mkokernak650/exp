<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\ArchivedCallLog;
use Illuminate\Http\Request;
use App\Models\Exception;
use App\Models\PendingBillCallLog;
use Inertia\Inertia;

class ExceptionController extends Controller
{
    private static $RingbaApiHelpers;
    private static $Exception;
    public function __construct()
    {
        $this->middleware('auth');
        self::$RingbaApiHelpers = new RingbaApiHelpers();
        self::$Exception = new Exception();
    }

    public function index()
    {
        $allExceptions = self::$Exception::all();
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
        // $inboundIds = $request->inboundIds;
        $inboundIds = [
            'v2XrWUbyC6CyrpVZSkUKr-QS5vL1CUl8aTEYQnc_jfwbI9NB4Zk7j9Pw'
        ];
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
            return response()->json(["msg" => "Data moved to Call Logs successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }

    /**
     * @method post
     * @param array
     * @param \Illuminate\Http\Request $request
     */
    public function moveToArhived(Request $request)
    {
        // $inboundIds = $request->inboundIds;
        $inboundIds = [
            'v2XrWUbyC6CyrpVZSkUKr-QS5vL1CUl8aTEYQnc_jfwbI9NB4Zk7j9Pw'
        ];
        $result = false;
        if (is_array($inboundIds)) {
            $i = 0;

            while ($i < count($inboundIds)) {
                $archivedCallLog = new ArchivedCallLog();
                if (!findDataByInboundId($archivedCallLog, $inboundIds[$i])) {

                    $dataById = findDataByInboundId(self::$Exception, $inboundIds[$i]);
                    $archivedCallLog->call_Logs_status = 'Archive';
                    $result = dataMoveHelper($archivedCallLog, $dataById);
                }
                $i++;
            }
        }
        if ($result) {
            return response()->json(["msg" => "Data moved to Call Logs successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }
}
