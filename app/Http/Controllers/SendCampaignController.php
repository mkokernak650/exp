<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\EcommerceCampaign;
use App\Notifications\SendCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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
        $selectedAffiliates = explode(',', $request['selectedAffiliates']);
        $affiliatesEmail    = Affiliate::whereIn('id', $selectedAffiliates)->pluck('email')->toArray();
        $additionalEmails   = explode(',', $request['additionalEmails']);
        $emails             = array_merge($affiliatesEmail, $additionalEmails);
        $emails             = array_unique($emails);
        $ringbaCampaigns    = Campaign::active()->get();
        $ecommerceCampaigns = EcommerceCampaign::active()->get();
        $allCampaigns       = $ringbaCampaigns->merge($ecommerceCampaigns)->sortByDesc('created_at')->values();
        $message            = '';

        foreach ($allCampaigns as $campaign) {
            $message .= '<div><strong>' . $campaign->campaign_name . '</strong>' . (!empty($campaign->description) ? "<br>{$campaign->description}<br>" : '') . (!empty($campaign->length_url) ? "<br>{$campaign->length_url}<br>" : '') . '</div><br>';
        }

        if (app()->environment('local')) {
            $emails = ['fahimikbal97@gmail.com'];
        }

        foreach ($emails as $email) {
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Notification::route('mail', $email)->notify(new SendCampaign($message));
            }
        }

        return redirect()->back();
    }
}
