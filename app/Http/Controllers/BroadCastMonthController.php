<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BroadCastMonth;
use Illuminate\Support\Facades\DB;

class BroadCastMonthController extends Controller
{

    function __construct()
    {
        $this->middleware('auth');
    }
    public function index()
    {
        return Inertia::render('Settings/AddBroadcastMonth');
    }

    public function store(Request $request)
    {
   
        $existData = BroadCastMonth::where('broad_cast_month', $request->broad_cast_month)->where('start_date', $request->start_date)->where('end_date', $request->end_date)->count();
        if ($existData>0) {
            return response()->json(["msg" => "Data already exists"]);
        }
        BroadCastMonth::create([
            'broad_cast_month' => $request->broad_cast_month,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);
        return response()->json(["msg" => "Successfully Added"]);
    }

    public function broadCastMonthReport()
    {
      
        $BroadCastMonths = BroadCastMonth::all();
        return Inertia::render('Settings/BroadcastMonthReport', [
            'BroadCastMonths' => $BroadCastMonths,
        ]);
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  DB::table('broad_cast_months')->where('id', $request->selectedRowIds[$i])->delete();
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
