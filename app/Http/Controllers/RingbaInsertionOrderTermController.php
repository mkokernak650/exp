<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RingbaInsertionOrderTermController extends Controller
{
    public function index()
    {
        return Inertia::render('RingbaInsertionOrder/RingbaInsertionOrderTermCreate');
    }
}
