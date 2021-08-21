<?php

namespace App\Http\Controllers;

use App\Exports\ZipcodeByTelevisionMarketExport;
use App\Imports\ZipcodeByTelevisionMarketImport;
use App\Models\ZipcodeByTelevisionMarket;
// use App\Exports\CustomerExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class ZipcodeByTelevisionMarketController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }
    public function index()
    {
        $allZipcodesByTelevisionMarket = ZipcodeByTelevisionMarket::take(1000)->get();
        // $allZipcodesByTelevisionMarket = ZipcodeByTelevisionMarket::all();
        return Inertia::render('Settings/ZipcodeByTelevisionMarketNew', [
            'allZipcodesByTelevisionMarket' => $allZipcodesByTelevisionMarket
        ]);
    }

    public function export($type)
    {
        // get request
        // return Excel::download(new CustomerExport,  'zipcodeTelevisionMerket.' . $type);
        return Excel::download(new ZipcodeByTelevisionMarketExport, 'Zipcode_by_television_market.' .  $type);
    }

    public function import(Request $request)
    {
        //post
        Excel::import(new ZipcodeByTelevisionMarketImport, $request->importfile);
        $newData = ZipcodeByTelevisionMarket::orderBy('id', 'DESC')->take(1000)->get();
        return response()->json($newData);
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  DB::table('zipcode_by_television_markets')->where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        }
        if ($result) {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
