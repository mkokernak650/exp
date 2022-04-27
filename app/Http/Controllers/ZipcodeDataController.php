<?php
namespace App\Http\Controllers;

use App\Exports\ZipcodeDataExport;
use App\Imports\ZipcodeDataImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ZipCodeData;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ZipcodeDataController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $zipDataQuery = ZipCodeData::query();

            $firstCond = $conditions->items[0];
            $this->makeConditionQuery($zipDataQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);

            for ($i = 1; $i < count($conditions->items); $i++) {
                $cond = $conditions->items[$i];
                $this->makeConditionQuery($zipDataQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
            }
            return $zipDataQuery->paginate(request('itemPerPage') ?? 15);
        }

        $allZipcodes = ZipCodeData::paginate(request('itemPerPage') ?? 15);
        if (request('page')) {
            return $allZipcodes;
        }
        return Inertia::render('Settings/ZipcodeDatabase', [
            'allZipcodes' => $allZipcodes
        ]);
    }

    public function export(Request $request)
    {
        Excel::download(new ZipcodeDataExport, 'Zipcode_database.' . $request->type);
        return back();
    }

    public function import(Request $request)
    {
        Excel::import(new ZipcodeDataImport, $request->importfile);
        $newZipcodes = ZipCodeData::orderBy('id', 'DESC')->take(1000)->get();
        return response()->json($newZipcodes);
    }

    /**
     * @method post
     * @param mixed array($page, $take)
     * @param \Illuminate\Http\Request $request
     */
    public function pagination($page = 1)
    {
        $take = 50;
        $skip = ($page === 0 || $page === 1) ? 0 : $take * ($page - 1);
        $results = ZipCodeData::skip($skip)->take($take)->get();
        varDump($results);
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = DB::table('zip_code_data')->where('id', $request->selectedRowIds[$i])->delete();
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
