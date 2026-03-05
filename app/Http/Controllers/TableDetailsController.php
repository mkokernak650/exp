<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TableDetails;

class TableDetailsController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'columnsData' => ['required', 'array'],
        ]);

        TableDetails::updateOrCreate(
            ['user_id' => auth()->id()],
            ['column_details' => json_encode($request->columnsData)]
        );

        return response()->json(['success' => true]);
    }
}
