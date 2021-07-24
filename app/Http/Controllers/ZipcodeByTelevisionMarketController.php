<?php

namespace App\Http\Controllers;

use App\Exports\ZipcodeByTelevisionMarketExport;
use App\Imports\ZipcodeByTelevisionMarketImport;
use App\Models\Customer;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ZipcodeByTelevisionMarketController extends Controller
{

    public function index()
    {
        $customer = Customer::all();
        return Inertia::render('Settings/ZipcodeByTelevisionMarket', [
            'allCustomers' => $customer
        ]);
    }

    public function import(Request $request)
    {
        //post
        Excel::import(new ZipcodeByTelevisionMarketImport, $request->importfile);
        return back()->with('Import successfully');
        // dd(ZipcodeByTelevisionMarket::all());
    }

    public function export($type)
    {
        // get request
        Excel::download(new ZipcodeByTelevisionMarketExport, 'Zipcode_by_television_marker.' . $type);
        return back()->with('Export successfully');
    }
}
