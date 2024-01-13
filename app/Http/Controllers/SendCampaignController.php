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
        // dd($request->all());

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
            // varDump($campaign);
            // dd($campaign);
            if (!empty($campaign->description)) {
                // $description = str_replace('\n', '<br>', $campaign->description);
                $description = $campaign->description;
            } else {
                $description = null;
            }

            if (!empty($campaign->length_url)) {
                // $lengthUrl = str_replace('\n', '<br>', $campaign->length_url);
                $lengthUrl = $campaign->length_url;
            } else {
                $lengthUrl = null;
            }

            $message .= '<div><strong>' . $campaign->campaign_name . '</strong>' . (!empty($description) ? "<br>{$description}<br>" : '') . (!empty($lengthUrl) ? "<br>{$lengthUrl}<br>" : '') .

                '</div><br>';
        }

        if (app()->environment('local')) {
            $emails = ['fahimikbal97@gmail.com'];
        }

        foreach ($emails as $email) {
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Notification::route('mail', $email)->notify(new SendCampaign($message));
            }
        }

        dd($message);
    }
}
