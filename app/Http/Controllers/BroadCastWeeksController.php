<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BroadCastWeeks;
use Illuminate\Support\Facades\DB;

class BroadCastWeeksController extends Controller
{

    function __construct()
    {
        $this->middleware('auth');
    }
    public function index()
    {
        return Inertia::render('Settings/AddBroadcastWeek');
    }

    public function store(Request $request)
    {
   
        $existData = BroadCastWeeks::where('broad_cast_week', $request->broad_cast_week)->where('start_date', $request->start_date)->where('end_date', $request->end_date)->count();
        if ($existData>0) {
            return response()->json(["msg" => "Data already exists"]);
        }
        BroadCastWeeks::create([
            'broad_cast_week' => $request->broad_cast_week,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);
        return response()->json(["msg" => "Successfully Added"]);
    }

    public function broadCastWeekReport()
    {
      
        $BroadCastWeeks = BroadCastWeeks::all();
        return Inertia::render('Settings/BroadcastWeekReport', [
            'BroadCastWeeks' => $BroadCastWeeks,
        ]);
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  DB::table('broad_cast_weeks')->where('id', $request->selectedRowIds[$i])->delete();
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
