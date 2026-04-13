<?php
namespace App\Http\Controllers;

use App\Exports\ZipcodeByTelevisionMarketExport;
use App\Imports\ZipcodeByTelevisionMarketImport;
use App\Models\TableDetails;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\ReportTableSort;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class ZipcodeByTelevisionMarketController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $conditions = json_decode(request('filteredValue'));
        if (request('filteredValue') && count($conditions->items)) {
            $zipDataQuery = ZipcodeByTelevisionMarket::query();

            $firstCond = $conditions->items[0];
            $this->makeConditionQuery($zipDataQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);
            for ($i = 1; $i < count($conditions->items); $i++) {
                $cond = $conditions->items[$i];
                $this->makeConditionQuery($zipDataQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
            }

            if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
                $sortField = request('sortField');
                $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
                $sortableColumns = ['market', 'state', 'county', 'city', 'population', 'zip_code', 'fips', 'median_household_income_2007_2011', 'race_americanindian', 'race_asian', 'race_white', 'race_black', 'race_hawaiian', 'race_hispanic', 'race_other'];
                $numericSortColumns = [
                    'population', 'zip_code', 'fips', 'median_household_income_2007_2011',
                    'race_americanindian', 'race_asian', 'race_white', 'race_black',
                    'race_hawaiian', 'race_hispanic', 'race_other',
                ];
                if (in_array($sortField, $sortableColumns)) {
                    ReportTableSort::apply(
                        $zipDataQuery,
                        $sortField,
                        $sortOrder,
                        $sortableColumns,
                        $numericSortColumns,
                        'zipcode_by_television_markets'
                    );
                    $zipDataQuery->orderBy('zipcode_by_television_markets.id');
                }
            }

            return $zipDataQuery->paginate(request('itemPerPage') ?? 10);
        }

        $query = ZipcodeByTelevisionMarket::query();

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';
            $sortableColumns = ['market', 'state', 'county', 'city', 'population', 'zip_code', 'fips', 'median_household_income_2007_2011', 'race_americanindian', 'race_asian', 'race_white', 'race_black', 'race_hawaiian', 'race_hispanic', 'race_other'];
            $numericSortColumns = [
                'population', 'zip_code', 'fips', 'median_household_income_2007_2011',
                'race_americanindian', 'race_asian', 'race_white', 'race_black',
                'race_hawaiian', 'race_hispanic', 'race_other',
            ];
            if (in_array($sortField, $sortableColumns)) {
                ReportTableSort::apply(
                    $query,
                    $sortField,
                    $sortOrder,
                    $sortableColumns,
                    $numericSortColumns,
                    'zipcode_by_television_markets'
                );
                $query->orderBy('zipcode_by_television_markets.id');
            }
        }

        $allZipcodesByTelevisionMarket = $query->paginate(request('itemPerPage') ?? 10);
        if (request('page')) {
            return $allZipcodesByTelevisionMarket;
        }
        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('Settings/ZipcodeByTelevisionMarketNew', [
            'allZipcodesByTelevisionMarket' => $allZipcodesByTelevisionMarket,
            'columnsData'                   => $columnsData
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(new ZipcodeByTelevisionMarketExport($request->filterValue), 'ZipCodeTelevisionByMarket.' . 'xlsx');
    }

    public function import(Request $request)
    {
        Excel::import(new ZipcodeByTelevisionMarketImport, $request->importfile);
        $newData = ZipcodeByTelevisionMarket::orderBy('id', 'DESC')->take(1000)->get();
        return response()->json($newData);
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result = DB::table('zipcode_by_television_markets')->where('id', $request->selectedRowIds[$i])->delete();
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
