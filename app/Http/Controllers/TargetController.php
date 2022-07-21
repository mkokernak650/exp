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
        $allCustomers = Customer::select('customer_name')->where('status', '=', '1')->distinct()->get();
        $allTargetNames = TargetNames::select('target_name')->where('status', '=', '1')->distinct()->get();
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
    public function TargetNamesReport()
    {
        $allTargetNames = TargetNames::all();
        return Inertia::render('Settings/TargetNames', [
            'allTargetNames' => $allTargetNames
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

    public function targetEdit(Request $request)
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
    public function targetNamesEdit(Request $request)
    {
        $data = TargetNames::find($request->id);
        $data->target_name  = $request->target_name;
        $result = $data->save();

        if ($result) {
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200, "targetData" => TargetNames::all()]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }

    public function targetDelete(Request $request)
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
    public function targetNamesDelete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  TargetNames::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }


    public static function getAllTarget()
    {
        $api = new RingbaApiHelpers();
        $results = $api->getTargets();
        $targetNames = TargetNames::all();
        $allTargetNames = [];
        foreach ($targetNames as $targetName) {
            array_push($allTargetNames, $targetName->target_name);
        }
        foreach ($results as $row) {
            $targetName = new TargetNames();
            if (!in_array($row->name, $allTargetNames)) {
                $targetName->target_name = $row->name;
                $targetName->save();
            }

            $existData = Target::where('Customer', $row->owner->name)->where('Ringba_Targets_Name', $row->name)->count();

            if ($existData > 0) {
                continue;
            } else {
                Target::create([
                    'Customer' => $row->owner->name,
                    'Ringba_Targets_Name' => $row->name,
                ]);
            }
        }
    }



    public static function getAllCustomers()
    {
        $api = new RingbaApiHelpers();
        $results = $api->getCustomers();

        $customers = Customer::all();
        $all_customer_name = [];
        foreach ($customers as $customer) {
            array_push($all_customer_name, $customer->customer_name);
        }

        foreach ($results as $row) {
            $customer = new Customer();
            if (!in_array($row->name, $all_customer_name)) {
                $customer->customer_name = $row->name;
                $customer->save();
            }
        }
    }

    public function targetStatusUpdate(Request $request)
    {
        $data = Target::find($request->rowId);
        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }
        $result = $data->save();
    }
    public function targetNamesStatusUpdate(Request $request)
    {
        $data = TargetNames::find($request->rowId);
        if ($request->value == 1) {
            $data->status = 0;
        } else {
            $data->status = 1;
        }
        $result = $data->save();
    }
}
