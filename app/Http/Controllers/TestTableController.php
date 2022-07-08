<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\WebForm;
use Inertia\Inertia;
use App\Models\tableDetails;

class TestTableController extends Controller
{
    public function index()
    {
        $allData = WebForm::all();
        $tableDetailsData = tableDetails::all();
        return Inertia::render('Test', [
            'allReports' => $allData,
            'columns' =>  $tableDetailsData
        ]);
    }
}
