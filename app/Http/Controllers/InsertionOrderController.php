<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InsertionOrderController extends Controller
{
    public function create()
    {
        $campaigns = [];

        return Inertia::render('InsertionOrder/InsertionOrderCreate', compact('campaigns'));
    }
}
