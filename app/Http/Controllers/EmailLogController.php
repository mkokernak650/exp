<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use App\Models\TableDetails;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    protected array $fieldMap = [
        'to' => 'to',
        'subject' => 'subject',
        'type' => 'type',
        'status' => 'status',
        'error' => 'error',
        'sent_at' => 'sent_at',
        'created_at' => 'created_at',
    ];

    protected array $allowedFields = [
        'to',
        'subject',
        'type',
        'status',
        'error',
        'sent_at',
        'created_at',
    ];

    protected array $sortableColumns = ['subject', 'type', 'status', 'sent_at', 'created_at'];

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $query = EmailLog::query()->with('user:id,firstname,lastname,email');

        $this->applyEloquentTableFilters(
            $query,
            $request->query('filteredValue'),
            $this->fieldMap,
            $this->allowedFields
        );

        $sortField = $request->query('sortField');
        $sortOrder = $request->query('sortOrder');
        if ($sortField && in_array($sortField, $this->sortableColumns, true)) {
            $direction = $sortOrder === 'asc' ? 'asc' : 'desc';
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('id', 'desc');
        }

        $perPage = (int) $request->query('itemPerPage', 10);
        if ($perPage <= 0 || $perPage > 200) {
            $perPage = 10;
        }

        $emailLogs = $query->paginate($perPage);

        if ($request->query('page')) {
            return $emailLogs;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/EmailLog', [
            'allEmailLogs' => $emailLogs,
            'columnsData'  => $columnsData,
        ]);
    }

    public function deleteSelected(Request $request)
    {
        $ids = $request->selectedRowIds ?? [];
        if (!is_array($ids) || empty($ids)) {
            return response()->json(['msg' => 'No rows selected.'], 422);
        }

        $deleted = EmailLog::whereIn('id', $ids)->delete();

        return response()->json([
            'msg' => $deleted ? 'Selected logs deleted successfully.' : 'No logs deleted.',
            'deleted' => $deleted,
        ]);
    }

    public function clearAll()
    {
        $deleted = EmailLog::query()->delete();

        return response()->json([
            'msg' => 'All logs cleared successfully.',
            'deleted' => $deleted,
        ]);
    }
}
