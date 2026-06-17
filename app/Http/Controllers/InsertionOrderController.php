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

        $createdIos = [];

        if ($request->insertionOrderFor == 'customer') {
            $selectedCustomers = explode(',', $request->selectedCustomers);

            foreach ($selectedCustomers as $selectedCustomer) {
                $customerDetails = explode('+cEmail+', $selectedCustomer);
                $customerId      = $customerDetails[0];
                $ioNo            = uniqid($customerId);
                $ioLink          = '?io=' . $ioNo . '&type=customer&id=' . $customerId;
                $InsertionOrder  = InsertionOrder::create([
                    'customer_id' => $customerId,
                    'io_no'       => $ioNo,
                    'io_link'     => $ioLink,
                    'status'      => InsertionOrder::STATUS['draft'],
                ]);

                if (!empty($attachedAffiliateIds)) {
                    $InsertionOrder->attachedAffiliates()->sync($attachedAffiliateIds);
                }

                $this->insertInsertionOrderDetails($request->selectedCodesAndPhones, $request->selectedTerm, $InsertionOrder);

                $createdIos[] = $InsertionOrder;
            }
        } elseif ($request->insertionOrderFor == 'affiliate') {
            $selectedAffiliates = explode(',', $request->selectedAffiliates);

            foreach ($selectedAffiliates as $selectedAffiliate) {
                $affiliateDetails = explode('+aEmail+', $selectedAffiliate);
                $affiliateId      = $affiliateDetails[0];
                $ioNo             = uniqid($affiliateId);
                $ioLink           = '?io=' . $ioNo . '&type=affiliate&id=' . $affiliateId;
                $InsertionOrder   = InsertionOrder::create([
                    'affiliate_id' => $affiliateId,
                    'io_no'        => $ioNo,
                    'io_link'      => $ioLink,
                    'status'       => InsertionOrder::STATUS['draft'],
                ]);

                // Mirror the FK into the pivot so the IO list can render every IO uniformly.
                $InsertionOrder->attachedAffiliates()->sync([(int) $affiliateId]);

                $this->insertInsertionOrderDetails($request->selectedCodesAndPhones, $request->selectedTerm, $InsertionOrder);

                $createdIos[] = $InsertionOrder;
            }
        } else {
            return ['success' => false, 'msg' => 'Fail to create'];
        }

        // Cash-buy spots: optional schedule rows + recurrence. Validate slot collisions first.
        $cashBuySpotsInput = $request->input('cash_buy_spots', []);
        if (!empty($cashBuySpotsInput) && is_array($cashBuySpotsInput)) {
            try {
                $expanded = $this->expandCashBuySpots($cashBuySpotsInput);
                $collisions = $this->detectCashBuyCollisions($expanded, null);
                if (!empty($collisions)) {
                    foreach ($createdIos as $io) {
                        $io->delete();
                    }
                    return response()->json([
                        'success'    => false,
                        'msg'        => 'Cash-buy spot collision with another active IO.',
                        'collisions' => $collisions,
                    ], 422);
                }

                foreach ($createdIos as $io) {
                    foreach ($expanded as $spotRow) {
                        \App\Models\CashBuySpot::create(array_merge($spotRow, [
                            'insertion_order_id' => $io->id,
                        ]));
                    }
                }
            } catch (\DomainException $e) {
                foreach ($createdIos as $io) {
                    $io->delete();
                }
                return response()->json(['success' => false, 'msg' => $e->getMessage()], 422);
            }
        }

        // type != 'save' (legacy Submit) -> immediately move into the sent state and email tokenized links.
        if ($request->type != 'save') {
            foreach ($createdIos as $io) {
                $this->dispatchSend($io);
            }
        }

        return ['success' => true, 'msg' => 'Insertion order(s) created successfully'];
    }

    /**
     * Pre-flight slot collision check for the cash-buy editor. POST body:
     *   { spots: [{ spot_date, spot_time, affiliate_id, weeks_count }], exclude_io_id?: int }
     * Returns the list of conflicting (date, time, affiliate_id) tuples, if any.
     */
    public function cashBuyCheckSlot(Request $request)
    {
        $data = $request->validate([
            'spots'                  => ['required', 'array', 'min:1'],
            'spots.*.spot_date'      => ['required', 'date'],
            'spots.*.spot_time'      => ['required', 'string'],
            'spots.*.affiliate_id'   => ['required', 'integer'],
            'spots.*.weeks_count'    => ['nullable', 'integer', 'min:1', 'max:52'],
            'spots.*.day_of_week'    => ['nullable', 'string'],
            'spots.*.time_zone'      => ['nullable', 'string'],
            'spots.*.amount'         => ['nullable', 'numeric'],
            'exclude_io_id'          => ['nullable', 'integer'],
        ]);

        $expanded   = $this->expandCashBuySpots($data['spots']);
        $collisions = $this->detectCashBuyCollisions($expanded, $data['exclude_io_id'] ?? null);

        return response()->json([
            'success'    => empty($collisions),
            'count'      => count($expanded),
            'collisions' => $collisions,
        ]);
    }

    /**
     * Expand each input row by its weeks_count into N rows (1 row + weekly repeats).
     * Returns an array of rows ready for insertion / collision checking.
     *
     * Input row: { spot_date, spot_time, affiliate_id, weeks_count, day_of_week?, time_zone?, amount? }
     */
    protected function expandCashBuySpots(array $rows): array
    {
        $out = [];
        foreach ($rows as $row) {
            $weeks = max(1, (int) ($row['weeks_count'] ?? 1));
            if ($weeks > 52) {
                throw new \DomainException('Cash-buy recurrence cannot exceed 52 weeks.');
            }
            $start = \Carbon\Carbon::parse($row['spot_date']);
            $time  = $row['spot_time'];
            for ($i = 0; $i < $weeks; $i++) {
                $d = (clone $start)->addWeeks($i);
                $out[] = [
                    'affiliate_id' => (int) $row['affiliate_id'],
                    'spot_date'    => $d->toDateString(),
                    'spot_time'    => strlen($time) === 5 ? $time . ':00' : $time,
                    'day_of_week'  => $row['day_of_week'] ?? $d->format('D'),
                    'time_zone'    => $row['time_zone'] ?? 'EST',
                    'amount'       => (float) ($row['amount'] ?? 0),
                ];
            }
        }
        return $out;
    }

    /**
     * Look for collisions against existing cash_buy_spots whose IO is in sent or accepted state
     * and not yet past its cancellation effective date.
     */
    protected function detectCashBuyCollisions(array $expanded, ?int $excludeIoId): array
    {
        $collisions = [];

        foreach ($expanded as $row) {
            $exists = \App\Models\CashBuySpot::query()
                ->join('insertion_orders', 'insertion_orders.id', '=', 'insertion_order_cash_buy_spots.insertion_order_id')
                ->where('insertion_order_cash_buy_spots.affiliate_id', $row['affiliate_id'])
                ->where('insertion_order_cash_buy_spots.spot_date', $row['spot_date'])
                ->where('insertion_order_cash_buy_spots.spot_time', $row['spot_time'])
                ->whereIn('insertion_orders.status', [
                    InsertionOrder::STATUS['sent'],
                    InsertionOrder::STATUS['accepted'],
                ])
                ->where(function ($q) {
                    $q->whereNull('insertion_orders.canceled_at')
                      ->orWhere('insertion_orders.canceled_at', '>=', now());
                })
                ->when($excludeIoId, fn($q) => $q->where('insertion_orders.id', '!=', $excludeIoId))
                ->exists();

            if ($exists) {
                $collisions[] = [
                    'spot_date'    => $row['spot_date'],
                    'spot_time'    => $row['spot_time'],
                    'affiliate_id' => $row['affiliate_id'],
                ];
            }
        }

        return $collisions;
    }

    /**
     * Move an IO from draft/pending to sent and email tokenized accept-decline links to both
     * the customer side and the affiliate (or corporation) side.
     */
    public function sendIo(Request $request, $id)
    {
        $io = InsertionOrder::with(['customer', 'affiliate'])->findOrFail($id);

        try {
            $this->dispatchSend($io);
        } catch (\DomainException $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()], 422);
        }

        return ['success' => true, 'msg' => 'Insertion order sent for approval', 'status' => $io->fresh()->status];
    }

    /**
     * Apply a state-machine action to many IOs at once. Used by the IO list page's
     * checkbox toolbar. Returns a per-row success/error map plus aggregate counts so
     * the UI can surface partial failures.
     *
     * Body shape: { action: cancel|void|draft|resend|send, ids: [int] }
     */
    public function bulk(Request $request)
    {
        $data = $request->validate([
            'action' => ['required', \Illuminate\Validation\Rule::in(['cancel', 'void', 'draft', 'resend', 'send'])],
            'ids'    => ['required', 'array', 'min:1'],
            'ids.*'  => ['integer'],
        ]);

        $service = app(\App\Services\InsertionOrderService::class);
        $ios     = InsertionOrder::with(['customer', 'affiliate'])->whereIn('id', $data['ids'])->get()->keyBy('id');

        $results = [];
        $ok      = 0;
        foreach ($data['ids'] as $id) {
            $io = $ios->get($id);
            if (!$io) {
                $results[$id] = ['success' => false, 'msg' => 'Not found'];
                continue;
            }

            try {
                switch ($data['action']) {
                    case 'cancel':
                        $service->cancel($io);
                        break;
                    case 'void':
                        // Force-flip to void (used for in-flight IOs the user wants to abandon).
                        if (in_array($io->status, ['draft', 'pending', 'sent'], true)) {
                            $io->status = InsertionOrder::STATUS['void'];
                            $io->save();
                        } else {
                            throw new \DomainException("IO status '{$io->status}' cannot be voided in bulk.");
                        }
                        break;
                    case 'draft':
                        // Revive void -> draft, or pull a sent IO back into editing.
                        if ($io->status === InsertionOrder::STATUS['void']) {
                            $service->revive($io);
                        } elseif (in_array($io->status, ['pending', 'sent'], true)) {
                            $io->forceFill([
                                'status'                => InsertionOrder::STATUS['draft'],
                                'customer_token'        => null,
                                'affiliate_token'       => null,
                                'customer_accepted_at'  => null,
                                'affiliate_accepted_at' => null,
                                'sent_at'               => null,
                            ])->save();
                        } else {
                            throw new \DomainException("IO status '{$io->status}' cannot be reverted to draft.");
                        }
                        break;
                    case 'send':
                        // draft/pending -> sent (tokens generated, emails dispatched)
                        $this->dispatchSend($io);
                        break;
                    case 'resend':
                        // Re-fire the existing tokenized emails without transitioning state.
                        // Works on sent/accepted IOs; missing tokens are generated on the fly.
                        $this->dispatchResend($io);
                        break;
                }
                $ok++;
                $results[$id] = ['success' => true, 'status' => $io->fresh()->status];
            } catch (\DomainException $e) {
                $results[$id] = ['success' => false, 'msg' => $e->getMessage()];
            } catch (\Throwable $e) {
                $results[$id] = ['success' => false, 'msg' => 'Unexpected error'];
            }
        }

        return response()->json([
            'success'  => $ok > 0,
            'msg'      => "{$ok} of " . count($data['ids']) . " insertion order(s) updated",
            'ok_count' => $ok,
            'results'  => $results,
        ]);
    }

    /**
     * Re-fire IOLink emails for an IO that has already been sent (or even accepted) without
     * touching its status. Used by the bulk "Resend" action and is safe to call repeatedly.
     */
    protected function dispatchResend(InsertionOrder $io): void
    {
        if (in_array($io->status, [InsertionOrder::STATUS['draft'], InsertionOrder::STATUS['pending']], true)) {
            // Shouldn't be resending something that was never sent — fall through to send().
            $this->dispatchSend($io);
            return;
        }

        // Generate tokens lazily so legacy IOs without tokens still get a working link.
        if (empty($io->customer_token) || empty($io->affiliate_token)) {
            $io->customer_token  = $io->customer_token  ?: sha1(\Illuminate\Support\Str::uuid()->toString() . '|c|' . $io->id);
            $io->affiliate_token = $io->affiliate_token ?: sha1(\Illuminate\Support\Str::uuid()->toString() . '|a|' . $io->id);
            $io->save();
            $io->refresh();
        }

        $this->dispatchIOLinkEmails($io);
    }

    protected function dispatchSend(InsertionOrder $io): void
    {
        $service = app(\App\Services\InsertionOrderService::class);
        $io      = $service->send($io);
        $this->dispatchIOLinkEmails($io);
    }

    /**
     * Email the tokenized accept-decline link to both the customer side and the affiliate
     * (or corporation contact) side. Used by both the send and resend paths.
     */
    protected function dispatchIOLinkEmails(InsertionOrder $io): void
    {
        $customerEmail = optional($io->customer)->email;
        if ($customerEmail && $io->customer_token) {
            $this->emailIOLink([[
                'email'  => $customerEmail,
                'ioLink' => '?io=' . $io->io_no . '&type=customer&id=' . $io->customer_id . '&t=' . $io->customer_token,
            ]]);
        }

        $affiliateEmail = null;
        $corpRow        = $io->corporation();
        if ($corpRow && !empty($corpRow->contact_email)) {
            $affiliateEmail = $corpRow->contact_email;
        } elseif ($io->affiliate) {
            $affiliateEmail = $io->affiliate->email;
        }

        if ($affiliateEmail && $io->affiliate_token) {
            $affiliateIdForUrl = $io->affiliate_id ?: 0;
            $this->emailIOLink([[
                'email'  => $affiliateEmail,
                'ioLink' => '?io=' . $io->io_no . '&type=affiliate&id=' . $affiliateIdForUrl . '&t=' . $io->affiliate_token,
            ]]);
        }
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
                        'titleName'   => EcommerceAffiliate::lengthTitle($length, $ecommerceAffiliate?->campaign?->campaign_name),
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

    /**
     * Shape the cash-buy spot rows for the PDF view. Returns an empty array when the IO has none.
     * Public so the public IO controller can reuse the same shape when resending docs.
     */
    public function cashBuySpotsForPdf(InsertionOrder $io): array
    {
        return $io->cashBuySpots()
            ->with('affiliate:id,affiliate_name')
            ->orderBy('spot_date')
            ->orderBy('spot_time')
            ->get()
            ->map(fn($spot) => [
                'date'        => $spot->spot_date?->toDateString(),
                'day_of_week' => $spot->day_of_week,
                'time'        => substr((string) $spot->spot_time, 0, 5),
                'time_zone'   => $spot->time_zone,
                'affiliate'   => optional($spot->affiliate)->affiliate_name ?? 'Affiliate',
                'amount'      => (float) $spot->amount,
            ])
            ->all();
    }

    /**
     * Resolve corporation name + slim list of linked affiliates for the PDF view.
     * Returns [null, []] for single-affiliate IOs.
     *
     * @return array{0: string|null, 1: array<int, array{affiliate_name: string, market: string|null}>}
     */
    public function corpDetailsForPdf(InsertionOrder $io): array
    {
        $corp = $io->corporation();
        if (!$corp) {
            return [null, []];
        }

        $nameCol = \App\Services\CorporationService::TYPE_TO_NAME_COLUMN[$io->corporation_type] ?? null;
        $corpName = $nameCol ? $corp->{$nameCol} : null;

        $affiliates = $corp->affiliates()->select('affiliates.id', 'affiliates.affiliate_name', 'affiliates.market')->get();
        $list = $affiliates->map(fn($a) => [
            'affiliate_name' => $a->affiliate_name,
            'market'         => $a->market,
        ])->all();

        return [$corpName, $list];
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
                'id'                       => $insertionOrder->id,
                'ioNo'                     => 'IO-' . str_pad($insertionOrder->id, 3, 0, STR_PAD_LEFT),
                'name'                     => $type === 'customer' ? $billingFor->customer_name : $billingFor->affiliate_name,
                'contactName'              => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
                'contactPhone'             => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
                'email'                    => !empty($billingFor->email) ? $billingFor->email : 'Email',
                'address'                  => $billingFor->address,
                'status'                   => $insertionOrder->status,
                'date'                     => date_format(date_create($insertionOrder->created_at), 'd-M-Y'),
                'cancellationRequestedAt'  => optional($insertionOrder->cancellation_requested_at)->toDateString(),
                'canceledAt'               => optional($insertionOrder->canceled_at)->toDateString(),
            ];
        }

        $insertionOrderDetails = InsertionOrderDetail::with('ecommerceAffiliate')->where('io_no', $ioNo)->get();

        foreach ($insertionOrderDetails as $insertionOrderDetail) {
            $ecommerceAffiliate = $insertionOrderDetail->ecommerceAffiliate;

            if (!empty($ecommerceAffiliate->lengths)) {
                $lengths = explode(',', str_replace(':', '', $ecommerceAffiliate->lengths));

                foreach ($lengths as $length) {
                    $orderDetails[] = [
                        'titleName'   => EcommerceAffiliate::lengthTitle($length, $ecommerceAffiliate?->campaign?->campaign_name),
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

        $cashBuySpots   = $this->cashBuySpotsForPdf($insertionOrder);
        [$corpName, $corpAffiliates] = $this->corpDetailsForPdf($insertionOrder);

        Notification::route('mail', $email)->notify(new InsertionOrderDocument(
            $billingDetails,
            $orderDetails,
            $subTotal,
            $type,
            $cashBuySpots,
            $corpName,
            $corpAffiliates
        ));

        return [
            'success' => true,
            'msg'     => 'Insertion order ' . ($request->type == 'cancel' ? 'canceled' : 'document sent') . ' successfully'
        ];
    }
}
