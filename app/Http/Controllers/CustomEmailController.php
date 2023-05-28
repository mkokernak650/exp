<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomEmailController extends Controller
{
    public function index()
    {
        return Inertia::render('CustomEmail/CustomEmail');
    }
}
