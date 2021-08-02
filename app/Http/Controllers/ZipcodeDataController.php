<?php

namespace App\Http\Controllers;

use App\Exports\ZipcodeDataExport;
use App\Imports\ZipcodeDataImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ZipCodeData;
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

        // dd($allZipcodes);
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

        // Session::put('success', 'Your file is imported Successfully in database');
        return back();
    }
}
