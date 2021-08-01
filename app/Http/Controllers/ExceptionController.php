<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;
use App\Models\Exception;
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
}
