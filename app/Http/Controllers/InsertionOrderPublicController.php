<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InsertionOrderPublicController extends Controller
{
    public function show()
    {
        // dd(request()->all());

        return Inertia::render('InsertionOrderPublic/InsertionOrderPublicIndex');
    }
}
