<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RingbaReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('GenerateReport/RingbaReports');
    }
}
