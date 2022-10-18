<?php

namespace App\Http\Controllers;

use App\Models\TableDetails;
use Illuminate\Http\Request;
use App\Models\WebForm;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class WebFormController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $allData = WebForm::all();
        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('WebFormReport', [
            'allReports'  => $allData,
            'columnsData' => $columnsData
        ]);
    }
    public function store(Request $request)
    {
        $result = WebForm::create([
            'company' => $request->company,
            'lname'   => $request->lname,
            'email'   => $request->email,
            'phone'   => $request->phone,
            'skype'   => $request->skype,
            'street'  => $request->street,
            'city'    => $request->city,
            'state'   => $request->state,
            'zipcode' => $request->zipcode,
            'country' => $request->country,
            'website' => $request->website,
            'comment' => $request->comment
        ]);

        if ($result) {
            return response()->json(["msg" => "Successfully Submitted", "status_code" => "200"]);
        } else {
            return response()->json(["msg" => "Submitted Failed", "status_code" => "500"]);
        }
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';
        $result       = true;
        $i            = 0;

        while ($i < $idsCount) {
            $result =  DB::table('web_forms')->where('id', $ids[$i])->delete();
            $i++;
        }
        if ($result) {
            activity('Webforms Reports')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");
            return response()->json(["msg" => "Successfully Deleted", "status_code" => 200]);
        }
        if ($result) {
            return response()->json(["msg" => "Deleting Failed", "status_code" => 500]);
        }
    }
}
