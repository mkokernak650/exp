<?php

namespace App\Http\Controllers;

use App\Exports\CustomerExport;
use App\Imports\CustomerImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Customer;
use Inertia\Inertia;

class CustomerController extends Controller
{
    function __construct()
    {
        $this->middleware('auth');
    }

    public function addCustomerForm()
    {
        return Inertia::render('Settings/AddCustomer');
    }

    public function customerReport()
    {
        $allCustomers = Customer::where('status', '=', '1')->get();
        return Inertia::render('Settings/CustomerReport', [
            'allCustomers' =>  $allCustomers,
        ]);
    }

    public function archivedCustomers()
    {
        $allCustomers = Customer::where('status', '=', '0')->get();
        return Inertia::render('Settings/ArchivedCustomers', [
            'allCustomers' => $allCustomers,
        ]);
    }



    public function storeCustomer(Request $request)
    {
        $existData = Customer::where('customer_name', $request->customer)->where('email', $request->email)->where('telephone', $request->telephone)->where('address', $request->address)->count();
        if ($existData > 0) {
            return response()->json(["msg" => "Cutomer already exists"]);
        }
        Customer::create([
            'customer_name' => $request->customer,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'address' => $request->address,
        ]);
        return response()->json(["msg" => "Successfully Added"]);
    }

    public function import(Request $request)
    {
        Excel::import(new CustomerImport, $request->importfile);
        return back()->with('Successfully import!');
    }

    public function export($type)
    {
        // get request
        Excel::download(new CustomerExport,  'Customers.' . $type);
        return back()->with('Export successfully');
    }

    public function edit(Request $request)
    {
        $data = Customer::find($request->id);
        $data->customer_name  = $request->customer;
        $data->email  = $request->email;
        $data->telephone  = $request->telephone;
        $data->address = $request->address;
        $result = $data->save();

        if ($result) {
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200,]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
        }
    }

    public function moveArchive(Request $request)
    {
        $result = true;
        $ids = $request->selectedRowIds;

        if (is_array($ids)) {
            $i = 0;
            while ($i < count($ids)) {
                $dataById = Customer::find($ids[$i]);
                $dataById->status = "0";
                $result = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            return response()->json(["msg" => "Data moved to Archive successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }
    public function activeCustomer(Request $request)
    {
        $result = true;
        $ids = $request->selectedRowIds;

        if (is_array($ids)) {
            $i = 0;
            while ($i < count($ids)) {
                $dataById = Customer::find($ids[$i]);
                $dataById->status = "1";
                $result = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            return response()->json(["msg" => "Customer active successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "active failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $result = false;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            // $result =  DB::table('customers')->where('id', $request->selectedRowIds[$i])->delete();
            $result =  Customer::where('id', $request->selectedRowIds[$i])->delete();
            $i++;
        }
        if ($result) {
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
 
}
