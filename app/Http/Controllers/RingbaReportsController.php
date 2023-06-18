<?php

namespace App\Http\Controllers;

use App\Models\BroadCastMonth;
use App\Models\BroadCastWeeks;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\ZipcodeByTelevisionMarket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RingbaReportsController extends Controller
{
    public function index()
    {
        $campaigns       = Campaign::active()->get();
        $customers       = Customer::active()->get();
        $markets         = ZipcodeByTelevisionMarket::select('market')->distinct()->get();
        $states          = ZipcodeByTelevisionMarket::select('state')->distinct()->get();
        $broadCastWeeks  = BroadCastWeeks::active()->get();
        $broadCastMonths = BroadCastMonth::active()->get();

        return Inertia::render('GenerateReport/RingbaReports', compact('campaigns', 'customers', 'broadCastMonths', 'broadCastWeeks', 'states', 'markets'));
    }
}
