<?php

namespace App\Http\Controllers;

use App\Models\MarketExcptions;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Exports\MarketExceptionExport;
use App\Imports\MarketExceptionImport;

class MarketExceptionController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function addMarketException(Request $request)
    {
        $existData = MarketExcptions::where('customer_id', $request->customer)
            ->where('market_id', $request->market)
            ->where('call_type', $request->call_type)
            ->count();
        if ($existData > 0) {
            return response()->json(["msg" => "Data already Exist"]);
        }

        MarketExcptions::create([
            'customer_id' => $request->customer,
            'market_id' => $request->market,
            'call_type' => $request->call_type,
            'start_date' => $request->start_date,
        ]);

        return response()->json(["msg" => "Successfully added"]);
    }

    public function marketExceptionForm()
    {
        $allMarkets = DB::table('zipcode_by_television_markets')->select('market')->distinct()->get();
        $allCustomers = Customer::all();
        return Inertia::render('Settings/MarketExceptionForm', [
            'allCustomers' => $allCustomers,
            'allMarkets' => $allMarkets
        ]);
    }


    public function marketExceptionReport()
    {
        $marketExceptions = MarketExcptions::all();
        return Inertia::render('Settings/MarketExceptionReport', [
            'marketExceptions' => $marketExceptions,
        ]);
    }


    public function import(Request $request)
    {
        // post request
        Excel::import(new MarketExceptionImport, $request->file);
        return back()->with('Successfully import!');
    }

    public function export($type)
    {
        // get request
        Excel::download(new MarketExceptionExport,  'MarketExceptionExport.' . $type);
        return back()->with('Export successfully');
    }

    public function edit(Request $request)
    {
        $data = MarketExcptions::find($request->id);
        $data->customer_id  = $request->customer_id;
        $data->market_id    = $request->market_id;
        $data->start_date   = $request->start_date;
        $result             = $data->save();

        deleteSuccessOrFailed($result);
        // if ($result) {
        //     return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        // } else {
        //     return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        // }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            // $result =  DB::table('market_excptions')->where('id', $request->selectedRowIds[$i])->delete();
            $result =  MarketExcptions::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
