<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TableDetails;

class TableDetailsController extends Controller
{
    public function store(request $request)
    {
        $existingTableDetails = TableDetails::first();

        if ($existingTableDetails !== null && $existingTableDetails !=='') {
            $existingTableDetails->column_details = json_encode($request->columnsData);
            $existingTableDetails->updated_at = now();
            $existingTableDetails->save();
        } else {
            TableDetails::insert([
                'column_details' => json_encode($request->columnsData),
                'created_at'     => now()
            ]);
        }
    }
}
