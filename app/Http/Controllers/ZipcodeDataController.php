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
    function __construct()
    {
        $this->middleware('auth');
    }


    public function index()
    {
        $allZipcodes = ZipCodeData::take(1000)->get();
        // $allZipcodes = ZipCodeData::all();

        return Inertia::render('Settings/ZipcodeDatabase', [
            'allZipcodes' => $allZipcodes
        ]);
    }

    public function export(Request $request)
    {
        Excel::download(new ZipcodeDataExport,  'Zipcode_database.' . $request->type);
        return back();
        // return Excel::download(new MarketExport,  'mark.'. \Maatwebsite\Excel\Excel::XLSX);
        // return (new MarketExport)->download('invoices.xlsx', \Maatwebsite\Excel\Excel::XLSX);
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
        // DB::enableQueryLog();
        // varDump(DB::getQueryLog());
        $take = 50;
        $skip = ($page === 0 || $page === 1) ? 0 : $take * ($page - 1);
        $results = ZipCodeData::skip($skip)->take($take)->get();
        varDump($results);
    }
}
