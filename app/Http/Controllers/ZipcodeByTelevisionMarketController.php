<?php

namespace App\Http\Controllers;

use App\Imports\ZipcodeByTalevisionMarketImport;
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
        Excel::import(new ZipcodeByTalevisionMarketImport, $request->importfile);

        dd(ZipcodeByTelevisionMarket::all());
    }
}
