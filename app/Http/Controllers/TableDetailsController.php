<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\tableDetails;

class TableDetailsController extends Controller
{
    public function index()
    {
        $tableDetailsData = tableDetails::all();
        return $tableDetailsData;
    }
    public function store(request $request)
    {
        tableDetails::truncate();
        $result= tableDetails::create([
            'columns' =>$request->finalData
        ]);

        return $result;
    }
}
