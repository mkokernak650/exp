<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\InsertionOrder;
use App\Models\InsertionOrderDetail;
use App\Models\TableDetails;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsertionOrderController extends Controller
{
    public function index()
    {
        $insertionOrders = InsertionOrder::with('customer:id,customer_name')
            ->with('affiliate:id,affiliate_name')
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
}
