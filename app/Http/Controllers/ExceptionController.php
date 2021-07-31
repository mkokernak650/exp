<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exception;
use Inertia\Inertia;

class ExceptionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $allExceptions = Exception::all();
        return Inertia::render('Ringba/Exception', [
            'Exceptions' => $allExceptions
        ]);
    }
}
