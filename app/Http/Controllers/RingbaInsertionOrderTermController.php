<?php

namespace App\Http\Controllers;

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
        $campaigns        = Campaign::active()->select(['id', 'campaign_name'])->get();
        $customers        = Customer::active()->select(['id', 'customer_name'])->get();
        $ringbaAffiliates = $this->getRingbaAffiliates();
        $affiliateOptions = [];
        $getRingbaNumbers = $this->getRingbaNumbers();

        if (gettype($ringbaAffiliates) != 'string') {
            foreach ($ringbaAffiliates->publishers as $item) {
                $affiliateOptions[] = (object) [
                    'value' => $item->id,
                    'label' => $item->name
                ];
            }
        }

        $ringbaNumbers = gettype($getRingbaNumbers) != 'string' ? $getRingbaNumbers->numbers : [];

        return Inertia::render('RingbaInsertionOrder/RingbaInsertionOrderTermCreate', compact('campaigns', 'customers', 'affiliateOptions', 'ringbaNumbers'));
    }

    private function getRingbaAffiliates()
    {
        $client      = new Client(['headers' => $this->ringbaApiHeader]);
        $apiEndPoint = 'https://api.ringba.com/v2/' . $this->ringbaAccountId . '/Publishers';

        try {
            $ringbaAffiliates = $client->get($apiEndPoint);
        } catch (RequestException $e) {
            return (string) $e->getResponse()->getBody();
        }

        return json_decode($ringbaAffiliates->getBody()->getContents());
    }

    private function getRingbaNumbers()
    {
        $client      = new Client(['headers' => $this->ringbaApiHeader]);
        $apiEndPoint = 'https://api.ringba.com/v2/' . $this->ringbaAccountId . '/numbers';

        try {
            $ringbaNumbers = $client->get($apiEndPoint);
        } catch (RequestException $e) {
            return (string) $e->getResponse()->getBody();
        }

        return json_decode($ringbaNumbers->getBody()->getContents());
    }
}
