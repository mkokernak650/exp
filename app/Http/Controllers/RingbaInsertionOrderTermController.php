<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\RingbaAuthDetails;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RingbaInsertionOrderTermController extends Controller
{
    private $ringbaApiHeader;
    private $ringbaAccountId;

    public function __construct()
    {
        $ringbaAuthDetails = RingbaAuthDetails::first();

        if ($ringbaAuthDetails) {
            $this->ringbaApiHeader = [
                'Authorization' => 'Token ' . json_decode($ringbaAuthDetails->api_token)->api_token
            ];

            $this->ringbaAccountId = json_decode($ringbaAuthDetails->account_details)->accountId;
        }
    }

    public function index()
    {
        $campaigns = Campaign::active()->select(['campaign_id', 'campaign_name'])->get();
        $customers = Customer::active()->select(['id', 'customer_name'])->get();

        return Inertia::render('RingbaInsertionOrder/RingbaInsertionOrderTermCreate', compact('campaigns', 'customers'));
    }

    public function getDataByCampaign(Request $request)
    {
        $affiliateOptions = $phoneOptions = $payoutOptions = $revenueOptions = $callLengthOptions = [];
        $apiResponse      = $this->campaignApiRequest($request->campaignId);

        if ($apiResponse == "string") {
            return ['success' => false, 'msg' => 'Data fetching failed!'];
        }

        $campaign = $apiResponse->campaign;

        if (isset($campaign->affiliates)) {
            foreach ($campaign->affiliates as $affiliate) {
                $affiliates[] = $affiliate->id;
            }
        }

        if (!empty($affiliates)) {
            $getAffiliates = Affiliate::whereIn('affiliate_id', $affiliates)->select(['id', 'affiliate_id', 'affiliate_name', 'market'])->orderBy('affiliate_name')->get();

            foreach ($getAffiliates as $affiliate) {
                $affiliateOptions[] = (object) [
                    'value' => $affiliate->affiliate_id,
                    'label' => $affiliate->affiliate_name . (!empty($affiliate->market) ? ' (' . $affiliate?->market . ')' : '')
                ];
            }
        }

        if (isset($campaign->affiliateNumbers)) {
            foreach ($campaign->affiliateNumbers as $item) {
                $phoneOptions[] = (object) [
                    'value'       => $item->phoneNumber,
                    'label'       => $item->phoneNumber,
                    'affiliateId' => $item->affiliate->id
                ];
            }
        }

        foreach ($campaign->defaultPayouts as $defaultPayout) {
            $payoutOptions[] = (object) [
                'value' => (string) $defaultPayout->payoutAmount,
                'label' => $defaultPayout->payoutAmount
            ];

            if (isset($defaultPayout->payoutConversionArgs) && isset($defaultPayout->payoutConversionArgs->callLengthInSeconds)) {
                $callLengthOptions[] = (object) [
                    'value' => (string) $defaultPayout->payoutConversionArgs->callLengthInSeconds,
                    'label' => $defaultPayout->payoutConversionArgs->callLengthInSeconds . ' Sec'
                ];
            }
        }

        foreach ($campaign->routes as $route) {
            $conversionValue  = $route->conversionSettings[0]->conversionValue;
            $revenueOptions[] = (object) [
                'value' => (string) $conversionValue,
                'label' => $conversionValue
            ];
        }

        return ['success' => true, 'msg' => 'Data fetched successfully', 'data' => [
            'affiliateOptions'  => $affiliateOptions,
            'phoneOptions'      => $phoneOptions,
            'payoutOptions'     => $payoutOptions,
            'revenueOptions'    => $revenueOptions,
            'callLengthOptions' => $callLengthOptions
        ]];
    }

    private function campaignApiRequest($campaignId)
    {
        $client      = new Client(['headers' => $this->ringbaApiHeader]);
        $apiEndPoint = 'https://api.ringba.com/v2/' . $this->ringbaAccountId . '/campaigns/' . $campaignId;

        try {
            $ringbaAffiliates = $client->get($apiEndPoint);
        } catch (RequestException $e) {
            return (string) $e->getResponse()->getBody();
        }

        return json_decode($ringbaAffiliates->getBody()->getContents());
    }
}
