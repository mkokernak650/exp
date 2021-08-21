<?php

namespace App\Http\Controllers;

use App\Exports\CustomerExport;
use App\Imports\CustomerImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Customer;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
        $allCustomers = Customer::all();
        return Inertia::render('Settings/CustomerReport', [
            'allCustomers' => $allCustomers,
        ]);
    }

    public function storeCustomer(Request $request)
    {
        $allCustomers = Customer::all();
        $existing_cutomer = $allCustomers->where('customer_name', $request->customer)->first();
        if ($existing_cutomer) {
            return response()->json(["msg" => "Cutomer already exists"]);
        }
        Customer::create([
            'customer_name' => $request->customer,
        ]);
        return response()->json(["msg" => "Successfully Added"]);
    }

    public function import(Request $request)
    {
        // post request
        // dd($request->importfile);
        Excel::import(new CustomerImport, $request->importfile);
        return back()->with('Successfully import!');
    }

    public function export($type)
    {
        // get request
        Excel::download(new CustomerExport,  'Customers.' . $type);
        return back()->with('Export successfully');
    }

    public function delete(Request $request)
    {
        $result = true;
        $i = 0;
        while ($i < count($request->selectedRowIds)) {
            $result =  DB::table('customers')->where('id', $request->selectedRowIds[$i])->delete();
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
