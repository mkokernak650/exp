<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BroadCastWeeks;
use App\Models\TableDetails;
use Carbon\Carbon;

class BroadCastWeeksController extends Controller
{

    function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        return Inertia::render('Settings/AddBroadcastWeek');
    }

    public function store(Request $request)
    {
        $existData = BroadCastWeeks::where([
            'broad_cast_week' => $request->broad_cast_week,
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date
        ])->count();

        if ($existData > 0) {
            return response()->json(["msg" => "Data already exists"]);
        }

        BroadCastWeeks::create([
            'broad_cast_week' => $request->broad_cast_week,
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
        ]);

        return response()->json(["msg" => "Successfully Added"]);
    }

    public function broadCastWeekReport()
    {
        $filteredValue = request('filteredValue');
        $conditions    = $filteredValue ? json_decode($filteredValue) : null;

        $hasValidFilters = $filteredValue
            && isset($conditions->items)
            && is_array($conditions->items)
            && count($conditions->items)
            && isset($conditions->items[0]->value);

        if ($hasValidFilters) {
            $broadCastWeeksData = BroadCastWeeks::query()
                ->select('*')
                ->selectRaw('DATEDIFF(end_date, start_date) + 1 as days_count');
            $firstCond          = $conditions->items[0];
            $itemsCount         = count($conditions->items);

            $this->makeConditionQuery($broadCastWeeksData, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);

            for ($i = 1; $i < $itemsCount; $i++) {
                $cond = $conditions->items[$i];
                $this->makeConditionQuery($broadCastWeeksData, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
            }

            $paginatedData = $broadCastWeeksData->paginate(request('itemPerPage') ?? 10);

            return $paginatedData;
        }

        $allBroadCastWeeks = BroadCastWeeks::query()
            ->select('*')
            ->selectRaw('DATEDIFF(end_date, start_date) + 1 as days_count')
            ->paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $allBroadCastWeeks;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/BroadcastWeekReport', [
            'allBroadCastWeeks' => $allBroadCastWeeks,
            'columnsData'       => $columnsData
        ]);
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
            $result = BroadCastWeeks::where('id', $ids[$i])->delete();
            $i++;
        }

        if ($result) {
            activity('Broadcast Weeks')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json([
                "msg"           => "Successfully Deleted",
                "status_code"   => 200
            ]);
        }

        if ($result) {
            return response()->json([
                "msg"           => "Deleting Failed",
                "status_code"   => 500
            ]);
        }
    }

    public function edit(Request $request)
    {
        $data                  = BroadCastWeeks::find($request->id);
        $data->broad_cast_week = $request->broad_cast_week;
        $data->start_date      = $request->start_date;
        $data->end_date        = $request->end_date;
        $result                = $data->save();

        if ($result) {
            return response()->json([
                "msg"         => "Successfully Edited",
                "status_code" => 200,
                "days_count"  => $this->getDaysCount($data->start_date, $data->end_date)
            ]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
        }
    }


    public function statusUpdate(Request $request)
    {
        $data = BroadCastWeeks::find($request->rowId);

        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }

        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Status updated successfully.'], 201);
        }
    }

    private function getDaysCount($startDate, $endDate)
    {
        if (!$startDate || !$endDate) {
            return null;
        }

        try {
            $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate), false);
            return $days >= 0 ? $days + 1 : $days - 1;
        } catch (\Exception $e) {
            return null;
        }
    }
}
