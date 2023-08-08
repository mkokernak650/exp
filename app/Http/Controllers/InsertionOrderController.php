<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\InsertionOrder;
use App\Models\InsertionOrderDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsertionOrderController extends Controller
{
    public function create()
    {
        $campaigns      = EcommerceCampaign::active()->get();
        $customers      = Customer::active()->get();
        $codesAndPhones = EcommerceAffiliate::select(['id', 'coupon_code', 'dialed'])->get();

        return Inertia::render('InsertionOrder/InsertionOrderCreate', compact('campaigns', 'customers', 'codesAndPhones'));
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

    public function store(Request $request)
    {
        // dd($request->all());

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
        }

        dd($request->insertionOrderFor);
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
}
