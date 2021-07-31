<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Target;
use Inertia\Inertia;

class TargetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $allTargets = Target::all();
        return Inertia::render('Settings/Targets', [
            'allTargets' => $allTargets
        ]);
    }
}
