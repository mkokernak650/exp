<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BroadCastMonth;

class BroadCastMonthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }
    public function index()
    {
        return Inertia::render('Settings/AddBroadcastMonth');
    }

    public function store(Request $request)
    {
        $existData = BroadCastMonth::where([
            'broad_cast_month'  => $request->broad_cast_month,
            'start_date'        => $request->start_date,
            'end_date'          => $request->end_date
        ])->count();
        if ($existData > 0) {
            return response()->json(["msg" => "Data already exists"]);
        }
        BroadCastMonth::create([
            'broad_cast_month'  => $request->broad_cast_month,
            'start_date'        => $request->start_date,
            'end_date'          => $request->end_date,
        ]);
        return response()->json(["msg" => "Successfully Added"]);
    }

    public function broadCastMonthReport()
    {
        $BroadCastMonths = BroadCastMonth::all();
        return Inertia::render('Settings/BroadcastMonthReport', [
            'BroadCastMonths'   => $BroadCastMonths,
        ]);
    }

    public function delete(Request $request)
    {
        $result = false;
        $ids = $request->selectedRowIds;
        $i = 0;
        while ($i < count($ids)) {
            $result =  BroadCastMonth::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json([
                "msg"           => "Successfully Deleted",
                "status_code"   => 200
            ]);
        } else {
            return response()->json([
                "msg"           => "Deleting Failed",
                "status_code"   => 500
            ]);
        }
    }

    public function edit(Request $request)
    {
        $data = BroadCastMonth::find($request->id);
        $data->broad_cast_month  = $request->broad_cast_month;
        $data->start_date  = $request->start_date;
        $data->end_date  = $request->end_date;
        $result = $data->save();
        $allData= BroadCastMonth::all();

        if ($result) {
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200,"allData" => $allData]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
        }
    }

    
    public function statusUpdate(Request $request)
    {
        $data = BroadCastMonth::find($request->rowId);
        if ($request->value ==1) {
            $data->status =0;
        } else {
            $data->status =1;
        }
        $result = $data->save();
    }
}
