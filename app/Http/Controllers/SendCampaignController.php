<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\EcommerceCampaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SendCampaignController extends Controller
{
    public function index()
    {
        $affiliates         = Affiliate::select(['id', 'affiliate_id', 'affiliate_name', 'market'])->active()->orderBy('affiliate_name')->get();
        $ringbaCampaigns    = Campaign::active()->get();
        $ecommerceCampaigns = EcommerceCampaign::active()->get();
        $allCampaigns       = $ringbaCampaigns->merge($ecommerceCampaigns)->sortByDesc('created_at')->values();

        return Inertia::render('SendCampaign/SendCampaign', compact('affiliates', 'allCampaigns'));
    }

    public function sendCampaign(Request $request)
    {
        // dd($request->all());

        $selectedAffiliates = explode(',', $request['selectedAffiliates']);
        $affiliatesEmail    = Affiliate::whereIn('id', $selectedAffiliates)->pluck('email')->toArray();
        $additionalEmails   = explode(',', $request['additionalEmails']);
        $emails             = array_merge($affiliatesEmail, $additionalEmails);
        $emails             = array_unique($emails);

        dd($emails);

        dd($additionalEmails);
        dd($affiliatesEmail);


        dd($selectedAffiliates);
    }
}
