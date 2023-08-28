<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\InsertionOrder;
use App\Models\InsertionOrderDetail;
use App\Models\TableDetails;
use App\Notifications\IOLink;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class InsertionOrderController extends Controller
{
    public function index()
    {
        $insertionOrders = InsertionOrder::with('customer:id,customer_name')
            ->with('affiliate:id,affiliate_name')
            ->when(
                !empty(request('filterByStatus')),
                fn ($q) => $q->whereIn('status', explode(',', request('filterByStatus')))
            )
            ->select('*')
            ->selectRaw('DATE_FORMAT(created_at, "%d %M, %Y %H:%i:%s") as formatted_created_at')
            ->paginate(request('itemPerPage') ?? 10);

        if (request('page')) {
            return $insertionOrders;
        }

        $columnsData = TableDetails::all()->pluck('column_details');

        return Inertia::render('InsertionOrder/InsertionOrderIndex', compact('insertionOrders', 'columnsData'));
    }

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

    public function getCodesAndPhones(Request $request)
    {
        if (empty($request->selectedCampaigns) && empty($request->selectedCustomers) && empty($request->selectedAffiliates)) {
            return [];
        }

        $selectedCustomers = $selectedAffiliates = $codeAndPhoneOptions = [];

        if (!empty($request->selectedCustomers)) {
            $selectedCustomersWithEmail = explode(',', $request->selectedCustomers);

            foreach ($selectedCustomersWithEmail as $selectedCustomerWithEmail) {
                $customerDetails     = explode('+cEmail+', $selectedCustomerWithEmail);
                $selectedCustomers[] = $customerDetails[0];
            }
        }

        if (!empty($request->selectedAffiliates)) {
            $selectedAffiliatesWithEmail = explode(',', $request->selectedAffiliates);

            foreach ($selectedAffiliatesWithEmail as $selectedAffiliateWithEmail) {
                $affiliateDetails     = explode('+aEmail+', $selectedAffiliateWithEmail);
                $selectedAffiliates[] = $affiliateDetails[0];
            }
        }

        $codesAndPhones = EcommerceAffiliate::with('affiliate:id,affiliate_name')
            ->when(!empty($request->selectedCampaigns), fn ($q) => $q->whereIn('campaign_id', explode(',', $request->selectedCampaigns)))
            ->when(!empty($selectedCustomers), fn ($q) => $q->whereIn('customer_id', $selectedCustomers))
            ->when(!empty($selectedAffiliates), fn ($q) => $q->whereIn('affiliate_id', $selectedAffiliates))
            ->select(['id', 'affiliate_id', 'coupon_code', 'dialed'])->get();

        foreach ($codesAndPhones as $item) {
            $codeAndPhoneOptions[] = [
                'label' => ($item->coupon_code ? $item->coupon_code : $item->dialed) . " ({$item->affiliate?->affiliate_name})",
                'value' => (string) $item->id
            ];
        }

        return $codeAndPhoneOptions;
    }

    public function store(Request $request)
    {
        $emailData = [];

        if ($request->insertionOrderFor == 'customer') {
            $selectedCustomers = explode(',', $request->selectedCustomers);

            foreach ($selectedCustomers as $selectedCustomer) {
                $customerDetails = explode('+cEmail+', $selectedCustomer);
                $customerId      = $customerDetails[0];
                $ioNo            = uniqid($customerId);
                $ioLink          = '?io=' . $ioNo . '&type=customer&id=' . $customerId;
                $InsertionOrder  = InsertionOrder::create(['customer_id' => $customerId, 'io_no' => $ioNo, 'io_link' => $ioLink]);

                $this->insertInsertionOrderDetails($request->selectedCodesAndPhones, $request->selectedTerm, $InsertionOrder);

                $emailData[] = ['email' => $customerDetails[1], 'ioLink' => $InsertionOrder->io_link];
            }
        } elseif ($request->insertionOrderFor == 'affiliate') {
            $selectedAffiliates = explode(',', $request->selectedAffiliates);

            foreach ($selectedAffiliates as $selectedAffiliate) {
                $affiliateDetails = explode('+aEmail+', $selectedAffiliate);
                $affiliateId      = $affiliateDetails[0];
                $ioNo             = uniqid($affiliateId);
                $ioLink           = '?io=' . $ioNo . '&type=affiliate&id=' . $affiliateId;
                $InsertionOrder   = InsertionOrder::create(['affiliate_id' => $affiliateId, 'io_no' => $ioNo, 'io_link' => $ioLink]);

                $this->insertInsertionOrderDetails($request->selectedCodesAndPhones, $request->selectedTerm, $InsertionOrder);

                $emailData[] = ['email' => $affiliateDetails[1], 'ioLink' => $InsertionOrder->io_link];
            }
        } else {
            return ['success' => false, 'msg' => 'Fail to create'];
        }

        if (!empty($emailData)) {
            $this->emailIOLink($emailData);
        }

        return ['success' => true, 'msg' => 'Insertion order(s) created successfully'];
    }

    public function insertInsertionOrderDetails($codesAndPhones, $term, $InsertionOrder)
    {
        $InsertionOrderId = $InsertionOrder->id;
        $InsertionOrderNo = $InsertionOrder->io_no;
        $codesAndPhones   = !empty($codesAndPhones) ? explode(',', $codesAndPhones) : [];
        $createdAt        = Carbon::now();
        $data             = [];

        foreach ($codesAndPhones as $item) {
            $data[] = [
                'insertion_order_id'     => $InsertionOrderId,
                'io_no'                  => $InsertionOrderNo,
                'ecommerce_affiliate_id' => $item,
                'term'                   => $term,
                'created_at'             => $createdAt
            ];
        }

        if (!empty($data)) {
            InsertionOrderDetail::insert($data);
        }
    }

    protected function emailIOLink($emailData)
    {
        foreach ($emailData as $item) {
            if (filter_var($item['email'], FILTER_VALIDATE_EMAIL)) {
                $email = $item['email'];

                if (app()->environment('local')) {
                    $email = 'fahimikbal97@gmail.com';
                }

                Notification::route('mail', $email)->notify(new IOLink($item['ioLink']));
            }
        }
    }

    public function delete(Request $request)
    {
        $ids = $request->selectedRowIds;
        $idsCount = count($ids);
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail = auth()->user()->email;
        $itemsCount = $idsCount > 1 ? 'items' : 'item';

        $result = InsertionOrder::whereIn('id', $ids)->delete();

        if ($result) {
            activity('Insertion Order')->event('deleted')
                ->withProperties(['name' => $userFullName, 'email' => $userEmail, 'ids' => $ids])
                ->log("{$idsCount} {$itemsCount} has been deleted");

            return ['success' => true, 'msg' => 'Successfully deleted'];
        } else {
            return ['success' => false, 'msg' => 'Can not delete the data'];
        }
    }
}
