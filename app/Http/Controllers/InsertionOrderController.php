<?php

namespace App\Http\Controllers;

use App\Models\Affiliate;
use App\Models\Customer;
use App\Models\EcommerceAffiliate;
use App\Models\EcommerceCampaign;
use App\Models\InsertionOrder;
use App\Models\InsertionOrderDetail;
use App\Models\TableDetails;
use App\Notifications\InsertionOrderDocument;
use App\Notifications\IOLink;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Support\ReportTableSort;
use Inertia\Inertia;

class InsertionOrderController extends Controller
{
    public function index()
    {
        $ioQuery = InsertionOrder::with('customer:id,customer_name')
            ->with('affiliate:id,affiliate_name')
            ->with(['attachedAffiliates:id,affiliate_name,market'])
            ->when(
                !empty(request('filterByStatus')),
                fn($q) => $q->whereIn('status', explode(',', request('filterByStatus')))
            )
            ->select('insertion_orders.*')
            ->selectRaw('DATE_FORMAT(insertion_orders.created_at, "%d %M, %Y %H:%i:%s") as formatted_created_at');

        if (!empty(request('sortField')) && !empty(request('sortOrder'))) {
            $sortField = request('sortField');
            $sortOrder = request('sortOrder') === 'asc' ? 'asc' : 'desc';

            $sortableColumns = ['id', 'status', 'created_at'];

            if ($sortField === 'customer') {
                $ioQuery->leftJoin('customers', 'insertion_orders.customer_id', '=', 'customers.id')
                    ->orderBy('customers.customer_name', $sortOrder);
            } elseif ($sortField === 'affiliate') {
                $ioQuery->leftJoin('affiliates', 'insertion_orders.affiliate_id', '=', 'affiliates.id')
                    ->orderBy('affiliates.affiliate_name', $sortOrder);
            } elseif ($sortField === 'formatted_created_at') {
                $ioQuery->orderBy('insertion_orders.created_at', $sortOrder);
            } elseif (in_array($sortField, $sortableColumns)) {
                ReportTableSort::apply(
                    $ioQuery,
                    $sortField,
                    $sortOrder,
                    $sortableColumns,
                    ['id', 'status'],
                    'insertion_orders'
                );
            }
        }

        $insertionOrders = $ioQuery->paginate(request('itemPerPage') ?? 10);

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
        $allCorporations = app(\App\Services\CorporationService::class)->all();

        return Inertia::render('InsertionOrder/InsertionOrderCreate', compact('campaigns', 'customers', 'allCorporations'));
    }

    public function getAffiliates(Request $request)
    {
        // Corp-driven: return all corp affiliates regardless of ecommerce_affiliates rows.
        if (!empty($request->corporation_type) && !empty($request->corporation_id)) {
            $service = app(\App\Services\CorporationService::class);
            $corpAffiliates = $service->affiliatesOf($request->corporation_type, (int) $request->corporation_id);

            $typeToNameCol = \App\Services\CorporationService::TYPE_TO_NAME_COLUMN;
            $modelClass    = \App\Services\CorporationService::TYPE_TO_MODEL[$request->corporation_type] ?? null;
            $corpRow       = $modelClass ? $modelClass::find($request->corporation_id) : null;
            $corpName      = $corpRow ? $corpRow->{$typeToNameCol[$request->corporation_type]} : '';
            $typeLabel     = \App\Services\CorporationService::TYPE_TO_LABEL[$request->corporation_type] ?? '';

            return $corpAffiliates->map(function ($affiliate) use ($corpName, $typeLabel) {
                $market = !empty($affiliate->market) ? ' (' . $affiliate->market . ')' : '';
                $suffix = $corpName ? ' — ' . $corpName . ' / ' . $typeLabel : '';
                return [
                    'label' => $affiliate->affiliate_name . $market . $suffix,
                    'value' => $affiliate->id . '+aEmail+' . (!empty($affiliate->email) ? $affiliate->email : 'n/a'),
                ];
            })->unique('value')->sortBy('label')->values()->toArray();
        }

        if (empty($request->selectedCampaigns) && empty($request->selectedCustomers)) {
            return [];
        }

        $affiliates = EcommerceAffiliate::with('affiliate:id,affiliate_name,email,market')
            ->when(!empty($request->selectedCampaigns), fn($q) => $q->whereIn('campaign_id', explode(',', $request->selectedCampaigns)))
            ->when(!empty($request->selectedCustomers), fn($q) => $q->whereIn('customer_id', explode(',', $request->selectedCustomers)))
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

        // Corp-driven: skip affiliate filter; fall back to campaign + customer for codes/phones.
        $corporationDriven = !empty($request->corporation_type) && !empty($request->corporation_id);

        $codesAndPhones = EcommerceAffiliate::with('affiliate:id,affiliate_name')
            ->when(!empty($request->selectedCampaigns), fn($q) => $q->whereIn('campaign_id', explode(',', $request->selectedCampaigns)))
            ->when(!empty($selectedCustomers), fn($q) => $q->whereIn('customer_id', $selectedCustomers))
            ->when(!$corporationDriven && !empty($selectedAffiliates), fn($q) => $q->whereIn('affiliate_id', $selectedAffiliates))
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

        // Collect the affiliate ids the user picked (works for both modes — surfaces them
        // on the IO list even for customer-mode IOs that historically had no affiliate FK).
        $attachedAffiliateIds = [];
        if (!empty($request->selectedAffiliates)) {
            foreach (explode(',', $request->selectedAffiliates) as $token) {
                $parts = explode('+aEmail+', $token);
                if (!empty($parts[0]) && ctype_digit((string) $parts[0])) {
                    $attachedAffiliateIds[] = (int) $parts[0];
                }
            }
            $attachedAffiliateIds = array_values(array_unique($attachedAffiliateIds));
        }

        if ($request->insertionOrderFor == 'customer') {
            $selectedCustomers = explode(',', $request->selectedCustomers);

            foreach ($selectedCustomers as $selectedCustomer) {
                $customerDetails = explode('+cEmail+', $selectedCustomer);
                $customerId      = $customerDetails[0];
                $ioNo            = uniqid($customerId);
                $ioLink          = '?io=' . $ioNo . '&type=customer&id=' . $customerId;
                $InsertionOrder  = InsertionOrder::create(['customer_id' => $customerId, 'io_no' => $ioNo, 'io_link' => $ioLink]);

                if (!empty($attachedAffiliateIds)) {
                    $InsertionOrder->attachedAffiliates()->sync($attachedAffiliateIds);
                }

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

                // Mirror the FK into the pivot so the IO list can render every IO uniformly.
                $InsertionOrder->attachedAffiliates()->sync([(int) $affiliateId]);

                $this->insertInsertionOrderDetails($request->selectedCodesAndPhones, $request->selectedTerm, $InsertionOrder);

                $emailData[] = ['email' => $affiliateDetails[1], 'ioLink' => $InsertionOrder->io_link];
            }
        } else {
            return ['success' => false, 'msg' => 'Fail to create'];
        }

        if (!empty($emailData) && $request->type != 'save') {
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

    public function view(Request $request)
    {
        $lastIoId = InsertionOrder::toBase()->select('id')->latest()->first();

        if ($request->insertionOrderFor == 'customer') {
            $selectedCustomers     = explode(',', $request->selectedCustomers);
            $customerIdEmail       = explode('+cEmail+', $selectedCustomers[0]);
            $customerId            = $customerIdEmail[0];
            $customer              = Customer::where('id', $customerId)->first();
            $billingDetailsForView = $this->billingDetailsForView($customer, $lastIoId, 'customer');
        } elseif ($request->insertionOrderFor == 'affiliate') {
            $selectedAffiliates    = explode(',', $request->selectedAffiliates);
            $affiliateIdEmail      = explode('+aEmail+', $selectedAffiliates[0]);
            $affiliateId           = $affiliateIdEmail[0];
            $affiliate             = Affiliate::where('id', $affiliateId)->first();
            $billingDetailsForView = $this->billingDetailsForView($affiliate, $lastIoId, 'affiliate');
        } else {
            return ['success' => false, 'msg' => 'Billing-for not available'];
        }

        $orderDetailsForView = $this->orderDetailsForView($request->selectedCodesAndPhones, $request->selectedTerm, $request->insertionOrderFor);
        $subTotal            = collect($orderDetailsForView)->sum('netPrice');

        return [
            'success' => true,
            'data'    => [
                'billingDetailsForView' => $billingDetailsForView,
                'orderDetailsForView'   => $orderDetailsForView,
                'subTotal'              => $subTotal,
                'ioFor'                 => $request->insertionOrderFor
            ]
        ];
    }

    protected function billingDetailsForView($billingFor, $lastIoId, $ioFor)
    {
        $date = Carbon::now()->format('d-M-Y');

        return [
            'ioNo'         => 'IO-' . str_pad(($lastIoId->id + 1), 3, 0, STR_PAD_LEFT),
            'name'         => $ioFor === 'customer' ? $billingFor->customer_name : $billingFor->affiliate_name,
            'contactName'  => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
            'contactPhone' => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
            'email'        => !empty($billingFor->email) ? $billingFor->email : 'Email',
            'address'      => $billingFor->address,
            'date'         => $date
        ];
    }

    protected function orderDetailsForView($selectedCodesAndPhones, $selectedTerm, $insertionOrderFor)
    {
        $ecommerceAffiliates = EcommerceAffiliate::with('campaign')->whereIn('id', explode(',', $selectedCodesAndPhones))->get();

        foreach ($ecommerceAffiliates as $ecommerceAffiliate) {
            if (!empty($ecommerceAffiliate->lengths)) {
                $lengths = explode(',', str_replace(':', '', $ecommerceAffiliate->lengths));
                foreach ($lengths as $length) {
                    $orderDetails[] = [
                        'titleName'   => $length . ' sec- ' . $ecommerceAffiliate?->campaign?->campaign_name,
                        'description' => $ecommerceAffiliate->description,
                        'videoUrl'    => $ecommerceAffiliate->video_url,
                        'term'        => $selectedTerm,
                        'dialed'      => !empty($ecommerceAffiliate->dialed) ? $ecommerceAffiliate->dialed : 'null',
                        'couponCode'  => !empty($ecommerceAffiliate->coupon_code) ? $ecommerceAffiliate->coupon_code : 'null',
                        'netPrice'    => (float) ($insertionOrderFor == 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee)
                    ];
                }
            } else {
                $orderDetails[] = [
                    'titleName'   => $ecommerceAffiliate?->campaign?->campaign_name,
                    'description' => $ecommerceAffiliate->description,
                    'videoUrl'    => $ecommerceAffiliate->video_url,
                    'term'        => $selectedTerm,
                    'dialed'      => !empty($ecommerceAffiliate->dialed) ? $ecommerceAffiliate->dialed : 'null',
                    'couponCode'  => !empty($ecommerceAffiliate->coupon_code) ? $ecommerceAffiliate->coupon_code : 'null',
                    'netPrice'    => (float) ($insertionOrderFor == 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee)
                ];
            }
        }

        return $orderDetails;
    }

    protected function emailIOLink($emailData)
    {
        foreach ($emailData as $item) {
            if (filter_var($item['email'], FILTER_VALIDATE_EMAIL)) {
                $email = $item['email'];

                if (app()->environment('local')) {
                    $email = 'shosen@bitcode.pro';
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

    public function resendIODocument(Request $request)
    {
        $ioNo           = $request->ioNo;
        $insertionOrder = InsertionOrder::with(['customer', 'affiliate'])->where('io_no', $ioNo)->first();

        if ($request->type == 'cancel') {
            $insertionOrder->status = 'canceled';
            if (!$insertionOrder->save()) {
                return ['success' => false, 'msg' => 'Insertion order cancellation fialed'];
            }
        }

        if (empty($insertionOrder)) {
            return ['success' => false, 'msg' => 'Insertion order not found'];
        }

        if (!empty($insertionOrder->customer_id)) {
            $billingFor = $insertionOrder->customer;
            $type       = 'customer';
        } else {
            $billingFor = $insertionOrder->affiliate;
            $type       = 'affiliate';
        }

        $email = $billingFor->email;

        if (app()->environment('local')) {
            $email = 'shosen@bitcode.pro';
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'msg' => 'No email found! Document resending fail'];
        }

        $billingDetails = [];

        if (!empty($billingFor)) {
            $billingDetails = [
                'id'           => $insertionOrder->id,
                'ioNo'         => 'IO-' . str_pad($insertionOrder->id, 3, 0, STR_PAD_LEFT),
                'name'         => $type === 'customer' ? $billingFor->customer_name : $billingFor->affiliate_name,
                'contactName'  => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
                'contactPhone' => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
                'email'        => !empty($billingFor->email) ? $billingFor->email : 'Email',
                'address'      => $billingFor->address,
                'status'       => $insertionOrder->status,
                'date'         => date_format(date_create($insertionOrder->created_at), 'd-M-Y')
            ];
        }

        $insertionOrderDetails = InsertionOrderDetail::with('ecommerceAffiliate')->where('io_no', $ioNo)->get();

        foreach ($insertionOrderDetails as $insertionOrderDetail) {
            $ecommerceAffiliate = $insertionOrderDetail->ecommerceAffiliate;

            if (!empty($ecommerceAffiliate->lengths)) {
                $lengths = explode(',', str_replace(':', '', $ecommerceAffiliate->lengths));

                foreach ($lengths as $length) {
                    $orderDetails[] = [
                        'titleName'   => $length . ' sec- ' . $ecommerceAffiliate?->campaign?->campaign_name,
                        'description' => $ecommerceAffiliate->description,
                        'videoUrl'    => $ecommerceAffiliate->video_url,
                        'term'        => $insertionOrderDetail->term,
                        'dialed'      => !empty($ecommerceAffiliate->dialed) ? $ecommerceAffiliate->dialed : 'null',
                        'couponCode'  => !empty($ecommerceAffiliate->coupon_code) ? $ecommerceAffiliate->coupon_code : 'null',
                        'netPrice'    => (float) ($type == 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee)
                    ];
                }
            } else {
                $orderDetails[] = [
                    'titleName'   => $ecommerceAffiliate->campaign->campaign_name,
                    'description' => $ecommerceAffiliate->description,
                    'videoUrl'    => $ecommerceAffiliate->video_url,
                    'term'        => $insertionOrderDetail->term,
                    'dialed'      => !empty($ecommerceAffiliate->dialed) ? $ecommerceAffiliate->dialed : 'null',
                    'couponCode'  => !empty($ecommerceAffiliate->coupon_code) ? $ecommerceAffiliate->coupon_code : 'null',
                    'netPrice'    => (float) ($type == 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee)
                ];
            }
        }

        $subTotal = collect($orderDetails)->sum('netPrice');

        Notification::route('mail', $email)->notify(new InsertionOrderDocument($billingDetails, $orderDetails, $subTotal, $type));

        return [
            'success' => true,
            'msg'     => 'Insertion order ' . ($request->type == 'cancel' ? 'canceled' : 'document sent') . ' successfully'
        ];
    }
}
