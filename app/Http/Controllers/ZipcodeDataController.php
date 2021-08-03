<?php

namespace App\Http\Controllers;

use App\Exports\ZipcodeDataExport;
// use App\Exports\CustomerExport;
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
        return Inertia::render('Settings/ZipcodeDatabase', [
            'allZipcodes' => $allZipcodes
        ]);
    }

    public function export($type)
    {
        return Excel::download(new ZipcodeDataExport,  'Zipcode_database.' .  $type);
        // return Excel::download(new CustomerExport,  'zipcode.' . $type);
        // return (new MarketExport)->download('invoices.xlsx', \Maatwebsite\Excel\Excel::XLSX);
    }

    public function import(Request $request)
    {
        Excel::import(new ZipcodeDataImport, $request->importfile);
        // Session::put('success', 'Your file is imported Successfully in database');
        return back();
    }
}
