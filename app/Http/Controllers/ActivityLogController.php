<?php

namespace App\Http\Controllers;

use App\Exports\ZipcodeByTelevisionMarketExport;

use App\Models\TableDetails;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $activityQuery = Activity::query();

            $firstCond = $conditions->items[0];
            $this->makeConditionQuery($activityQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);
            for ($i = 1; $i < count($conditions->items); $i++) {
                $cond = $conditions->items[$i];
                $this->makeConditionQuery($activityQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
            }
            if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortableColumns = ['event', 'log_name', 'description', 'created_at'];
                if (in_array($sortField, $sortableColumns)) {
                    $activityQuery->orderBy($sortField, $sortOrder);
                }
            }
            return $activityQuery->orderBy('id', 'DESC')->paginate(request('itemPerPage') ?? 10);
        }

        $query = Activity::query();
        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['event', 'log_name', 'description', 'created_at'];
            if (in_array($sortField, $sortableColumns)) {
                $query->orderBy($sortField, $sortOrder);
            }
        }
        $allActivityLog = $query->orderBy('id', 'DESC')->paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $allActivityLog;
        }
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/ActivityLog', [
            'allActivityLog' => $allActivityLog,
            'columnsData'    => $columnsData
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(new ZipcodeByTelevisionMarketExport($request->filterValue), 'ZipCodeTelevisionByMarket.' . 'xlsx');
    }
}
