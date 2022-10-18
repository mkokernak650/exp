<?php

namespace App\Http\Controllers;

use App\Exports\CustomerExport;
use App\Imports\CustomerImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Customer;
use App\Models\TableDetails;
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
        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/CustomerReport', [
            'allCustomers' => $allCustomers,
            'columnsData'  => $columnsData
        ]);
    }

    public function archivedCustomers()
    {
        $allCustomers = Customer::where('status', '=', '0')->get();
        $columnsData  = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/ArchivedCustomers', [
            'allCustomers' => $allCustomers,
            'columnsData'  => $columnsData
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
            'email'         => $request->email,
            'telephone'     => $request->telephone,
            'address'       => $request->address,
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
        $id                  = $request->id;
        $userFullName        = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail           = auth()->user()->email;
        $data                = Customer::find($request->id);
        $data->customer_name = $request->customer;
        $data->email         = $request->email;
        $data->telephone     = $request->telephone;
        $data->address       = $request->address;
        $result              = $data->save();

        if ($result) {
            activity('Customer')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $id])
                ->log("An Item has been updated");
            return response()->json(["msg" => "Successfully Edited", "status_code" => 200,]);
        } else {
            return response()->json(["msg" => "Editing Failed", "status_code" => 500]);
        }
    }

    public function moveArchive(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;

        if (is_array($ids)) {
            $i = 0;
            while ($i < $idsCount) {
                $dataById         = Customer::find($ids[$i]);
                $dataById->status = "0";
                $result           = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            activity('Customer')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been archived");
            return response()->json(["msg" => "Data moved to Archive successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "moving failed", "status_code" => 500]);
        }
    }
    public function activeCustomer(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;

        if (is_array($ids)) {
            $i = 0;
            while ($i < $idsCount) {
                $dataById         = Customer::find($ids[$i]);
                $dataById->status = "1";
                $result           = $dataById->save();
                $i++;
            }
        }
        if ($result) {
            activity('Customer')->event('updated')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been activated");
            return response()->json(["msg" => "Customer active successfully", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "active failed", "status_code" => 500]);
        }
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = false;
        $i            = 0;

        while ($i < $idsCount) {
            $result =  Customer::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Customer')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        } else {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
