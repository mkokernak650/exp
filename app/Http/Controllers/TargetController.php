<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use Illuminate\Http\Request;
use App\Models\Target;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\TargetNames;

class TargetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $allCustomers = Customer::select('customer_name')->distinct()->get();
        $allTargetNames = TargetNames::select('target_name')->distinct()->get();
        return Inertia::render('Settings/AddTargets', [
            'allCustomers' => $allCustomers,
            'allTargetNames' => $allTargetNames
        ]);
    }

    public function TargetsReport()
    {
        $allTargets = Target::all();
        return Inertia::render('Settings/Targets', [
            'allTargets' => $allTargets
        ]);
    }

    public function addTarget(Request $request)
    {
        $existData = Target::where('Customer', $request->Customer)->where('Ringba_Targets_Name', $request->Ringba_Targets_Name)->count();
        if ($existData > 0) {
            return response()->json(["msg" => "Data already Exist"]);
        }
        $result = Target::create([
            'Customer' => $request->Customer,
            'Ringba_Targets_Name' => $request->Ringba_Targets_Name,
            'Description' => $request->Description,
        ]);

        if ($result) {
            return response()->json(["msg" => "Successfully added"]);
        } else {
            return response()->json(["msg" => "An internal error occured"]);
        }
    }

    public function edit(Request $request)
    {
        $data = Target::find($request->id);
        $data->Customer  = $request->customer;
        $data->Description = $request->Description;
        $data->Ringba_Targets_Name  = $request->Ringba_Targets_Name;
        $result = $data->save();

        if ($result) {
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200, "targetData" => Target::all()]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  Target::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    // fetch data by secdule
    public static function getAllTarget()
    {
        $api = new RingbaApiHelpers();
        $results = $api->getTargets();

        $targets = TargetNames::all();
        $all_target_name = [];
        foreach ($targets as $target) {
            array_push($all_target_name, $target->target_name);
        }

//        dd('from db', $all_target_name, 'from api', $results);
        foreach ($results as $row) {
            $target = new TargetNames();
            if (!in_array($row->name, $all_target_name)) {
                $target->target_name = $row->name;
                $target->save();
            }
        }
    }
}
