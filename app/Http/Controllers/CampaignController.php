<?php

namespace App\Http\Controllers;

use App\Http\Helpers\RingbaApiHelpers;
use App\Models\Campaign;
use Illuminate\Http\Request;

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
}
