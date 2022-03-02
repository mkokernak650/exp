<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class EcommerceSaleController extends Controller
{
    public function import()
    {
        return Inertia::render('Ecommerce/SalesImport');
    }

    public function importStore(Request $request)
    {
        // $request->validate([
        //     'file' => ['required', 'file', 'mimes:csv,xlsx'],
        // ]);

        dd($request->all());

        return response()->json(['msg' => 'Imported Successfully.']);
    }
}
