<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SendCampaignController extends Controller
{
    public function index()
    {
        $affiliates = Affiliate::select(['id', 'affiliate_id', 'affiliate_name', 'market'])->active()->orderBy('affiliate_name')->get();

        // dd($affiliates);
        return Inertia::render('SendCampaign/SendCampaign', compact('affiliates'));
    }
}
