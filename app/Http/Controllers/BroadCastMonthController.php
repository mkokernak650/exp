<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BroadCastMonth;
use App\Models\TableDetails;
use Carbon\Carbon;

class BroadCastMonthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        return Inertia::render('Settings/AddBroadcastMonth');
    }

    public function store(Request $request)
    {
        $existData = BroadCastMonth::where([
            'broad_cast_month' => $request->broad_cast_month,
            'start_date'       => $request->start_date,
            'end_date'         => $request->end_date
        ])->count();

        if ($existData > 0) {
            return response()->json(["msg" => "Data already exists"]);
        }

        BroadCastMonth::create([
            'broad_cast_month' => $request->broad_cast_month,
            'start_date'       => $request->start_date,
            'end_date'         => $request->end_date,
        ]);

        return response()->json(["msg" => "Successfully Added"]);
    }

    public function broadCastMonthReport()
    {
        $filteredValue = request('filteredValue');
        $conditions    = $filteredValue ? json_decode($filteredValue) : null;

        $hasValidFilters = $filteredValue
            && isset($conditions->items)
            && is_array($conditions->items)
            && count($conditions->items)
            && isset($conditions->items[0]->value);

        if ($hasValidFilters) {
            $broadCastMonthData = BroadCastMonth::query()
                ->select('*')
                ->selectRaw('DATEDIFF(end_date, start_date) + 1 as days_count');
            $firstCond          = $conditions->items[0];
            $itemsCount         = count($conditions->items);

            $this->makeConditionQuery($broadCastMonthData, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);

            for ($i = 1; $i < $itemsCount; $i++) {
                $cond = $conditions->items[$i];
                $this->makeConditionQuery($broadCastMonthData, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
            }

            if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortableColumns = ['broad_cast_month', 'start_date', 'end_date', 'days_count'];
                if (in_array($sortField, $sortableColumns)) {
                    $broadCastMonthData->orderBy($sortField, $sortOrder);
                }
            }

            $paginatedData = $broadCastMonthData->paginate(request('itemPerPage') ?? 10);

            return $paginatedData;
        }

        $query = BroadCastMonth::query()
            ->select('*')
            ->selectRaw('DATEDIFF(end_date, start_date) + 1 as days_count');

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['broad_cast_month', 'start_date', 'end_date', 'days_count'];
            if (in_array($sortField, $sortableColumns)) {
                $query->orderBy($sortField, $sortOrder);
            }
        }

        $allBroadCastMonths = $query->paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $allBroadCastMonths;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/BroadcastMonthReport', [
            'allBroadCastMonths' => $allBroadCastMonths,
            'columnsData'        => $columnsData
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
            $result = BroadCastMonth::where('id', $ids[$i])->delete();
            $i++;
        }

        if ($result) {
            activity('Broadcast Months')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json([
                "msg"         => "Successfully Deleted",
                "status_code" => 200
            ]);
        } else {
            return response()->json([
                "msg"         => "Deleting Failed",
                "status_code" => 500
            ]);
        }
    }

    public function edit(Request $request)
    {
        $data                   = BroadCastMonth::find($request->id);
        $data->broad_cast_month = $request->broad_cast_month;
        $data->start_date       = $request->start_date;
        $data->end_date         = $request->end_date;
        $result                 = $data->save();

        if ($result) {
            return response()->json([
                "msg"             => "Successfully Edited",
                "status_code"     => 200,
                "days_count" => $this->getDaysCount($data->start_date, $data->end_date)
            ]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
        }
    }


    public function statusUpdate(Request $request)
    {
        $data = BroadCastMonth::find($request->rowId);

        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }

        $result = $data->save();

        if ($result) {
            return response()->json(['msg' => 'Status updated successfully.', 'status_code' => 200]);
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
