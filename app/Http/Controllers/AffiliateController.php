<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function all()
    {
        $results = Affiliate::all();
        dd($results);
    }
}
