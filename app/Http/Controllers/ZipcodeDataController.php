<?php

namespace App\Http\Controllers;

use App\Exports\ZipcodeDataExport;
use App\Imports\ZipcodeDataImport;
use App\Models\TableDetails;
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
        $zipDataQuery = ZipCodeData::query();

        if (!empty(request('filterByState'))) {
            $filterByState = explode(',', request('filterByState'));
            $zipDataQuery->whereIn('State', $filterByState);
        }

        if (!empty(request('filterByTimeZone'))) {
            $filterByTimeZone = explode(',', request('filterByTimeZone'));
            $zipDataQuery->whereIn('TimeZone', $filterByTimeZone);
        }

        if (request('filterBySearchBoxValue')) {
            $filterBySearchBoxValue = json_decode(request('filterBySearchBoxValue'));

            if (!empty($filterBySearchBoxValue->county)) {
                $zipDataQuery->where('County', 'LIKE', "%{$filterBySearchBoxValue->county}%");
            }

            if (!empty($filterBySearchBoxValue->city)) {
                $zipDataQuery->where('City', 'LIKE', "%{$filterBySearchBoxValue->city}%");
            }

            if (!empty($filterBySearchBoxValue->zipCode)) {
                $zipDataQuery->where('ZipCode', 'LIKE', "%{$filterBySearchBoxValue->zipCode}%");
            }

            if (!empty($filterBySearchBoxValue->npa)) {
                $zipDataQuery->where('NPA', 'LIKE', "%{$filterBySearchBoxValue->npa}%");
            }

            if (!empty($filterBySearchBoxValue->nxx)) {
                $zipDataQuery->where('NXX', 'LIKE', "%{$filterBySearchBoxValue->nxx}%");
            }
        }

        $states = ZipCodeData::select('State')->whereNotNull('State')->orderBy('State')->distinct()->pluck('State');

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['NPA', 'NXX', 'NPANXX', 'ZipCode', 'State', 'City', 'County', 'CountyPop', 'ZipCodeCount', 'ZipCodeFreq', 'Latitude', 'Longitude', 'TimeZone', 'ObservesDST', 'NXXUseType', 'NXXIntroVersion', 'NPANew', 'FIPS', 'LATA', 'Overlay', 'RateCenter', 'SwitchCLLI', 'MSA_CBSA', 'MSA_CBSA_CODE', 'OCN', 'Company', 'CoverageAreaName', 'Flags', 'WeightedLat', 'WeightedLon'];
            if (in_array($sortField, $sortableColumns)) {
                $zipDataQuery->orderBy($sortField, $sortOrder);
            }
        }

        $allZipcodes = $zipDataQuery->paginate(request('itemPerPage') ?? 15);
        if (request('page')) {
            return $allZipcodes;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/ZipcodeDatabase', ['allZipcodes' => $allZipcodes, 'columnsData' => $columnsData, 'states' => $states]);
    }

    public function import(Request $request)
    {
        Excel::import(new ZipcodeDataImport, $request->importfile);
        $newZipcodes = ZipCodeData::orderBy('id', 'DESC')->take(1000)->get();
        return response()->json($newZipcodes);
    }

    public function export()
    {
        return Excel::download(new ZipcodeDataExport(request('filterByState'), request('filterByTimeZone'), request('filterBySearchBoxValue')), 'ZipCodeData.' . 'xlsx');
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
