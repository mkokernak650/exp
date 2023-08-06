<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsertionOrderController extends Controller
{
    public function create()
    {
        $campaigns = EcommerceCampaign::active()->get();
        $customers = Customer::active()->get();

        return Inertia::render('InsertionOrder/InsertionOrderCreate', compact('campaigns', 'customers'));
    }

    public function getAffiliates(Request $request)
    {
        if (empty($request->selectedCampaigns) && empty($request->selectedCustomers)) {
            return [];
        }

        $affiliates = EcommerceAffiliate::with('affiliate:id,affiliate_name,email,market')
            ->when(!empty($request->selectedCampaigns), fn ($q) => $q->whereIn('campaign_id', explode(',', $request->selectedCampaigns)))
            ->when(!empty($request->selectedCustomers), fn ($q) => $q->whereIn('customer_id', explode(',', $request->selectedCustomers)))
            ->select(['id', 'affiliate_id'])->distinct()->get();

        $affiliateOptions = $affiliates->map(function ($item) {
            return [
                'label' => $item->affiliate->affiliate_name . (!empty($item->affiliate->market) ? ' (' . $item?->affiliate?->market . ')' : ''),
                'value' => $item->affiliate->id . '+aEmail+' . (!empty($item->affiliate->email) ? $item->affiliate->email : 'n/a')
            ];
        })->unique()->sortBy('label')->values()->toArray();

        return $affiliateOptions;
    }
}
