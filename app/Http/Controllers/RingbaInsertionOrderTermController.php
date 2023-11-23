<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\RingbaAuthDetails;
use App\Models\RingbaInsertionOrder;
use App\Models\TableDetails;
use App\Notifications\IOLink;
use App\Notifications\RingbaInsertionOrderDocument;
use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
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

    public function allList()
    {
        $ringbaInsertionOrders = DB::table('ringba_insertion_orders')
            ->when(
                !empty(request('filterByStatus')),
                fn ($q) => $q->whereIn('status', explode(',', request('filterByStatus')))
            )
            ->select([
                DB::raw('DATE_FORMAT(created_at, "%d %M, %Y %H:%i:%s") as formatted_created_at'),
                'id', 'io_for', 'io_no',
                DB::raw('(SELECT campaign_name FROM campaigns WHERE campaigns.campaign_id = ringba_insertion_orders.campaign_id LIMIT 1) AS campaign'),
                DB::raw('(SELECT customer_name FROM customers WHERE customers.id = ringba_insertion_orders.customer_id LIMIT 1) AS customer'),
                DB::raw('(SELECT affiliate_name FROM affiliates WHERE affiliates.affiliate_id = ringba_insertion_orders.affiliate_id LIMIT 1) AS affiliate'),
                'phone', 'term', 'call_length', 'payout', 'revenue', 'status', 'io_link'
            ])
            ->paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $ringbaInsertionOrders;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('RingbaInsertionOrder/RingbaInsertionOrderIndex', compact('ringbaInsertionOrders', 'columnsData'));
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

    public function store(Request $request)
    {
        $data            = $request->all();
        $ioNo            = uniqid();
        $data['io_no']   = $ioNo;
        $data['io_link'] = '?io=' . $ioNo . '&type=' . $data['io_for'];
        $submitType      = $data['submit_type'];

        unset($data['submit_type']);

        $ringbaInsertionOrder = RingbaInsertionOrder::create($data);

        if ($ringbaInsertionOrder) {
            if ($submitType != 'save') {
                $this->emailIOLink($ringbaInsertionOrder);
            }

            return ['success' => true, 'msg' => 'Insertion order created successfully'];
        }

        return ['success' => false, 'msg' => 'Fail to create'];
    }

    public function view(Request $request)
    {
        $lastIoId = RingbaInsertionOrder::toBase()->select('id')->latest()->first();

        if ($lastIoId === null) {
            $lastIoId = (object) ['id' => 0];
        }

        $data     = $request->all();
        $ioFor    = $data['io_for'];

        if ($ioFor === 'customer') {
            $customer              = Customer::where('id', $data['customer_id'])->first();
            $billingDetailsForView = $this->billingDetailsForView($customer, $lastIoId);
        } elseif ($ioFor === 'affiliate') {
            $affiliate             = Affiliate::where('affiliate_id', $data['affiliate_id'])->first();
            $billingDetailsForView = $this->billingDetailsForView($affiliate, $lastIoId);
        } else {
            return ['success' => false, 'msg' => 'Billing-for not available'];
        }

        $campaign = Campaign::where('campaign_id', $data['campaign_id'])->first();

        $orderDetailsForView = [
            'titleName'   => (!empty($data['call_length']) ?  $data['call_length'] . ' sec- ' : '') . $campaign?->campaign_name,
            'description' => $campaign?->description,
            'term'        => $data['term'],
            'phone'       => $data['phone'],
            'netPrice'    => (float) ($ioFor === 'customer' ? $data['payout'] : $data['revenue'])
        ];

        return [
            'success' => true,
            'data'    => ['billingDetailsForView' => $billingDetailsForView, 'orderDetailsForView' => $orderDetailsForView, 'ioFor' => $ioFor]
        ];
    }

    public function delete(Request $request)
    {
        $ids          = $request->selectedRowIds;
        $idsCount     = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;
        $itemsCount   = $idsCount > 1 ? 'items' : 'item';

        $result = RingbaInsertionOrder::whereIn('id', $ids)->delete();

        if ($result) {
            activity('Pay Per Call Insertion Order')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");

            return ['success' => true, 'msg' => 'Successfully deleted'];
        } else {
            return ['success' => false, 'msg' => 'Can not delete the data'];
        }
    }

    public function resendIODocument(Request $request)
    {
        $ioNo                 = $request->ioNo;
        $ringbaInsertionOrder = RingbaInsertionOrder::where('io_no', $ioNo)->first();
        $ioFor                = $ringbaInsertionOrder->io_for;

        if ($request->type == 'cancel') {
            $ringbaInsertionOrder->status = 'canceled';
            if (!$ringbaInsertionOrder->save()) {
                return ['success' => false, 'msg' => 'Insertion order cancellation fialed'];
            }
        }

        if (empty($ringbaInsertionOrder)) {
            return ['success' => false, 'msg' => 'Insertion order not found'];
        }

        if ($ioFor === 'customer') {
            $customer       = Customer::where('id', $ringbaInsertionOrder->customer_id)->first();
            $billingDetails = $this->billingDetails($customer, $ringbaInsertionOrder);
        } else {
            $affiliate      = Affiliate::where('affiliate_id', $ringbaInsertionOrder->affiliate_id)->first();
            $billingDetails = $this->billingDetails($affiliate, $ringbaInsertionOrder);
        }

        $email = $billingDetails['email'];

        if (app()->environment('local')) {
            $email = 'fahimikbal97@gmail.com';
        }

        $email = 'fahimikbal97@gmail.com'; //to be removed

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'msg' => 'No email found! Document resending fail'];
        }

        $campaign = Campaign::where('campaign_id', $ringbaInsertionOrder->campaign_id)->first();

        $orderDetails = [
            'titleName'   => (!empty($ringbaInsertionOrder->call_length) ?  $ringbaInsertionOrder->call_length . ' sec- ' : '') . $campaign?->campaign_name,
            'description' => $campaign?->description,
            'term'        => $ringbaInsertionOrder->term,
            'phone'       => $ringbaInsertionOrder->phone,
            'netPrice'    => (float) ($ioFor === 'customer' ? $ringbaInsertionOrder->payout : $ringbaInsertionOrder->revenue)
        ];

        Notification::route('mail', $email)->notify(new RingbaInsertionOrderDocument($billingDetails, $orderDetails, $ioFor));

        return [
            'success' => true,
            'msg'     => 'Insertion order ' . ($request->type == 'cancel' ? 'canceled' : 'document sent') . ' successfully'
        ];
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

    private function emailIOLink($ringbaInsertionOrder)
    {
        $ioFor  = $ringbaInsertionOrder->io_for;
        $ioLink = $ringbaInsertionOrder->io_link;

        if ($ioFor === 'customer') {
            $customerId = $ringbaInsertionOrder->customer_id;
            $email      = Customer::where('id', $customerId)->select(['email'])->value('email');
        } elseif ($ioFor === 'affiliate') {
            $affiliateId = $ringbaInsertionOrder->affiliate_id;
            $email       = Affiliate::where('affiliate_id', $affiliateId)->select(['email'])->value('email');
        }

        if (app()->environment('local')) {
            $email = 'fahimikbal97@gmail.com';
        }

        $email = 'fahimikbal97@gmail.com'; //to be removed

        if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Notification::route('mail', $email)->notify(new IOLink($ioLink, 'ringba'));
        }
    }

    private function billingDetailsForView($billingFor, $lastIoId)
    {
        $date = Carbon::now()->format('d-M-Y');

        return [
            'ioNo'         => 'IO-' . str_pad(($lastIoId->id + 1), 3, 0, STR_PAD_LEFT),
            'contactName'  => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
            'contactPhone' => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
            'email'        => !empty($billingFor->email) ? $billingFor->email : 'Email',
            'address'      => $billingFor->address,
            'date'         => $date
        ];
    }

    private function billingDetails($billingFor, $io)
    {
        if (!empty($billingFor)) {
            return [
                'id'           => $io->id,
                'ioNo'         => 'IO-' . str_pad($io->id, 3, 0, STR_PAD_LEFT),
                'contactName'  => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
                'contactPhone' => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
                'email'        => !empty($billingFor->email) ? $billingFor->email : 'Email',
                'address'      => $billingFor?->address,
                'status'       => $io->status,
                'date'         => date_format(date_create($io->created_at), 'd-M-Y')
            ];
        }

        return [
            'id'           => 'N/A',
            'ioNo'         => 'N/A',
            'contactName'  => 'N/A',
            'contactPhone' => 'N/A',
            'email'        => 'N/A',
            'address'      => 'N/A',
            'status'       => 'N/A',
            'date'         => 'N/A'
        ];
    }
}
