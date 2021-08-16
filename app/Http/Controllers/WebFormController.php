<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WebForm;
use Inertia\Inertia;

class WebFormController extends Controller
{
    public function index()
    {
        $allData=WebForm::all();
        return Inertia::render('WebFormReport',[
            'allReports' => $allData
        ]);
    }
    public function store(Request $request)
    {
        $result = WebForm::create([
            'company' => $request->company,
            'lname' => $request->lname,
            'email' => $request->email,
            'phone' => $request->phone,
            'skype' => $request->skype,
            'street' => $request->street,
            'city' => $request->city,
            'state' => $request->state,
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
}
