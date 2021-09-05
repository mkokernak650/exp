<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Target;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Customer;

class TargetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $allCustomers = Customer::all();
        return Inertia::render('Settings/AddTargets', [
            'allCustomers' => $allCustomers
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
        $allTargets = Target::all();
        $exisxtData = $allTargets->where('Customer', $request->Customer)->where('Ringba_Targets_Name', $request->Ringba_Targets_Name);
        if (!$exisxtData->isEmpty()) {
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
        $data->Customer  = $request->Customer;
        $data->Description = $request->Description;
        $data->Ringba_Targets_Name  = $request->Ringba_Targets_Name;
        $result=$data->save();
        $allTargets = Target::all();

        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200,"targetData"=>$allTargets]);
        }
        else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  DB::table('targets')->where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        }
        else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
