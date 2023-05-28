<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomEmailController extends Controller
{
    public function index()
    {
        $campaigns = EcommerceCampaign::active()->get();

        return Inertia::render('CustomEmail/CustomEmail', compact('campaigns'));
    }

    public function getAffiliates(Request $request)
    {
        $campaignIds         = explode(',', $request->selectedCampaignIds);
        $ecommerceAffiliates = EcommerceAffiliate::distinct()->whereIn('campaign_id', $campaignIds)->pluck('affiliate_id')->toArray();
        $affiliates          = Affiliate::whereIn('id', $ecommerceAffiliates)->orderBy('affiliate_name')->get();

        foreach ($affiliates as $affiliate) {
            if (!empty($affiliate->email)) {
                $affiliateOptions[] = [
                    'label' => "{$affiliate->affiliate_name} ({$affiliate->market})",
                    'value' => $affiliate->email
                ];
            }
        }

        return $affiliateOptions;
    }
}
