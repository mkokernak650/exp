<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class InsertionOrderPublicController extends Controller
{
    public function show()
    {
        dd(request()->all());
    }
}
