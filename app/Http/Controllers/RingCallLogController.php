<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;
use App\Models\RingbaData;
use Inertia\Inertia;

class RingCallLogController extends Controller
{
    private $_ringba;
    private $_ringbaData;
    public function __construct()
    {
        $this->_ringba = new RingbaApiHelpers();
    }

    public function RingbaAuth()
    {
        dd($this->_ringba->getRingbaData());
    }

    public function dateWiseData(Request $request)
    {
        $get_past_days_range = null;
        $get_days_range = null;

        $start_date = date_create($request->startDate);
        $end_date = date_create($request->endDate);
        $current_date = date_create(date('m/d/Y'));

        $start_current_diff = date_diff($start_date, $current_date);
        $start_current_diff_result = $start_current_diff->format("%a");

        $start_end_diff = date_diff($start_date, $end_date);
        $start_end_diff_result = $start_end_diff->format("%a");

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

        $params = [
            'dateRange' => [
                'past' => $get_past_days_range,
                'days' =>  $get_days_range,
            ],
            'timeSeries' => [
                'timeGroup' => 'hour'
            ],
            'callLog' => [
                'page' => 0,
                'pageSize' => 10000,
                'sort' => 'dtStamp',
                'sortDirection' => 'desc'
            ],
            'timezoneId' => 'Eastern Standard Time'
        ];

        $results = json_decode($this->_ringba->postRequest('calllogs/date', $params));
        $ringbaData = new RingbaData();
        $ringbaData->truncate();
        $data = [];
        $this->_ringbaData = $results->result->callLog->data;
        foreach ($this->_ringbaData as $data) {
            $ringbaData = new RingbaData();
            $ringbaData->columns = json_encode($data->columns);
            $ringbaData->events = json_encode($data->events);
            $ringbaData->tags = json_encode($data->tags);
            $ringbaData->save();
        }
        return Inertia::render(
            'Ringba/TempRingbaData',
            [
                'ringbaData' => $results->result->callLog->data,
                'flash' => [
                    'message' => fn () => $request->session()->get('Data Fetched Successfully')
                ],
            ]
        );
    }

    public function tempRingbaData()
    {
        $ringbaData =  RingbaData::all();
        return Inertia::render('Ringba/TempRingbaData', [
            'ringbaData' =>  $ringbaData
        ]);
    }
}
