<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Campaign;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public static function getNewCampaigns()
    {
        $ringbaCampaigns = (new RingbaApiHelpers())->getCampaigns();
        $campaigns = Campaign::get(['campaign_name'])->pluck('campaign_name')->toArray();

        $newCampaign = [];
        foreach ($ringbaCampaigns as $key => $ringbaCampaign) {
            if (!in_array($ringbaCampaign->name, $campaigns)) {
                $newCampaign[$key] = [
                    'campaign_name' => $ringbaCampaign->name,
                    'status'        => $ringbaCampaign->enabled,
                ];
            }
        }

        Campaign::insert($newCampaign);
    }

    public function campaignSettingForm(): Response
    {
        $allCampaigns = Campaign::active()->get();
        return Inertia::render('Settings/Campaign/CampaignSettingForm', compact('allCampaigns'));
    }

    public function campaignSettingReport(): Response
    {
        $allCampaigns = Campaign::get();
        return Inertia::render('Settings/Campaign/CampaignSettingReport', compact('allCampaigns'));
    }
}
