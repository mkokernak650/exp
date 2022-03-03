<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Imports\EcommerceSaleImport;
use Maatwebsite\Excel\Facades\Excel;

class EcommerceSaleController extends Controller
{
    public function import()
    {
        return Inertia::render('Ecommerce/SalesImport');
    }

    public function importStore(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file'],
            'fieldMap' => ['required', 'string'],
        ]);

        $filterFields = [];
        foreach (json_decode($request->input('fieldMap')) as $value) {
            if (!empty($value->applicationField) && !empty($value->reportField)) {
                $filterFields[$value->applicationField] = Str::slug($value->reportField, '_');
            }
        }
        Excel::import(new EcommerceSaleImport($filterFields), $request->file('file'));

        return response()->json(['msg' => 'Imported Successfully.']);
    }
}
