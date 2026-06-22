<?php

namespace App\Http\Controllers;

use App\Models\EcommerceAffiliate;
use App\Models\InsertionOrder;
use App\Models\InsertionOrderDetail;
use App\Notifications\InsertionOrderDocument;
use App\Services\InsertionOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class InsertionOrderPublicController extends Controller
{
    public function show()
    {
        $insertionOrder = InsertionOrder::with(['customer', 'affiliate'])->where('io_no', request('io'))->first();

        if (empty($insertionOrder)) {
            return Inertia::render('InsertionOrderPublic/InsertionOrderPublicNotFound');
        }

        // Token-gated access: ?t=<token> must match either the customer or affiliate token,
        // and `type=customer|affiliate` is derived from which one matched.
        $resolved = $this->resolveSideByToken($insertionOrder, (string) request('t', ''));
        if (!$resolved) {
            return Inertia::render('InsertionOrderPublic/InsertionOrderPublicNotFound');
        }
        $ioFor = $resolved;

        $billingFor     = $ioFor === 'customer' ? $insertionOrder->customer : $insertionOrder->affiliate;
        $billingDetails = [];

        if (!empty($billingFor)) {
            $billingDetails = [
                'id'                    => $insertionOrder->id,
                'ioNo'                  => 'IO-' . str_pad($insertionOrder->id, 3, 0, STR_PAD_LEFT),
                'name'                  => $ioFor === 'customer' ? $billingFor->customer_name : $billingFor->affiliate_name,
                'contactName'           => !empty($billingFor->contact_name) ? $billingFor->contact_name : 'Contact Name',
                'contactPhone'          => !empty($billingFor->contact_telephone) ? $billingFor->contact_telephone : 'Telephone',
                'email'                 => !empty($billingFor->email) ? $billingFor->email : 'Email',
                'address'               => $billingFor->address,
                'status'                => $insertionOrder->status,
                'date'                  => date_format(date_create($insertionOrder->created_at), 'd-M-Y'),
                'customer_accepted_at'  => optional($insertionOrder->customer_accepted_at)->toDateString(),
                'affiliate_accepted_at' => optional($insertionOrder->affiliate_accepted_at)->toDateString(),
                'accepted_at'           => optional($insertionOrder->accepted_at)->toDateString(),
            ];
        }

        $orderDetails           = [];
        $insertionOrderDetails  = InsertionOrderDetail::with('ecommerceAffiliate')->where('io_no', request('io'))->get();

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
                        'netPrice'    => (float) ($ioFor === 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee),
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
                    'netPrice'    => (float) ($ioFor === 'customer' ? $ecommerceAffiliate->revenue : $ecommerceAffiliate->affiliate_fee),
                ];
            }
        }

        $subTotal = collect($orderDetails)->sum('netPrice');

        return Inertia::render('InsertionOrderPublic/InsertionOrderPublicIndex', compact('billingDetails', 'orderDetails', 'subTotal', 'ioFor'));
    }

    /**
     * Public accept/decline endpoint. Token must match the side being acted on.
     * Status is computed by the service, not taken from the request body.
     */
    public function updateStatus(Request $request, $id, $status)
    {
        $io      = InsertionOrder::findOrFail($id);
        $token   = (string) $request->input('t', request('t', ''));
        $side    = $this->resolveSideByToken($io, $token);

        if (!$side) {
            return response()->json(['success' => false, 'msg' => 'Invalid or missing approval token.', 'status' => ''], 403);
        }

        $service = app(InsertionOrderService::class);

        // Legacy IOs (created before phase 2A) carry no tokens and no status state machine
        // history. Flip the status field directly so the existing emailed links keep working.
        $legacy = empty($io->customer_token) && empty($io->affiliate_token);
        if ($legacy) {
            $allowed = [
                InsertionOrder::STATUS['accepted'],
                InsertionOrder::STATUS['declined'],
                InsertionOrder::STATUS['canceled'],
            ];
            if (!in_array($status, $allowed, true)) {
                return response()->json(['success' => false, 'msg' => 'Invalid status.', 'status' => ''], 422);
            }
            $io->status = $status;
            $io->save();
            return ['success' => true, 'msg' => '', 'status' => $io->status];
        }

        // Admin previewing via the View button has no token in the payload. Route the click
        // as a staff override so the service can record who flipped which side and still
        // enforce the cash-buy block.
        $staffUser   = (auth()->check() && empty($token)) ? auth()->user() : null;
        $tokenForSvc = $staffUser ? null : $token;

        try {
            if ($status === InsertionOrder::STATUS['declined']) {
                $io = $service->decline($io, $side, $tokenForSvc, $staffUser);
            } elseif ($status === InsertionOrder::STATUS['canceled']) {
                $io = $service->cancel($io, $staffUser);
                app(\App\Http\Controllers\InsertionOrderController::class)
                    ->dispatchCancellationPdfs($io->fresh());
            } elseif ($side === InsertionOrder::SIDE_CUSTOMER) {
                $io = $service->acceptCustomer($io, $tokenForSvc, $staffUser);
            } else {
                $io = $service->acceptAffiliate($io, $tokenForSvc, $staffUser);
            }
        } catch (\DomainException $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage(), 'status' => ''], 422);
        }

        return ['success' => true, 'msg' => '', 'status' => $io->status];
    }

    public function sendIODocument()
    {
        if (filter_var(request('billingDetails')['email'], FILTER_VALIDATE_EMAIL)) {
            $email          = request('billingDetails')['email'];
            $billingDetails = request('billingDetails');
            $orderDetails   = request('orderDetails');
            $subTotal       = request('subTotal');
            $ioFor          = request('ioFor');

            if (app()->environment('local')) {
                $email = 'shosen@bitcode.pro';
            }

            // Enrich the PDF with cash-buy spots + corp affiliate list when applicable.
            $cashBuySpots   = [];
            $corpName       = null;
            $corpAffiliates = [];
            if (!empty($billingDetails['id'])) {
                $io = InsertionOrder::find($billingDetails['id']);
                if ($io) {
                    $ctrl           = app(\App\Http\Controllers\InsertionOrderController::class);
                    $cashBuySpots   = $ctrl->cashBuySpotsForPdf($io);
                    [$corpName, $corpAffiliates] = $ctrl->corpDetailsForPdf($io);
                }
            }

            Notification::route('mail', $email)->notify(new InsertionOrderDocument(
                $billingDetails,
                $orderDetails,
                $subTotal,
                $ioFor,
                $cashBuySpots,
                $corpName,
                $corpAffiliates
            ));

            return ['success' => true, 'msg' => 'IO document sent.'];
        } else {
            return ['success' => false, 'msg' => 'Failed to send the IO document (no email found).'];
        }
    }

    /**
     * Returns 'customer' | 'affiliate' | null based on which token matches.
     *
     * Backward-compat: legacy IOs created before phase 2A have null tokens. For those we
     * fall back to the ?type=... query param so existing emailed links keep working.
     *
     * Authenticated staff preview: when an admin is logged in and clicks View from the IO list,
     * the URL has no token. We allow access in that case using the ?type=... param.
     */
    protected function resolveSideByToken(InsertionOrder $io, string $token): ?string
    {
        $legacy    = empty($io->customer_token) && empty($io->affiliate_token);
        $adminUser = auth()->check();

        if ($legacy || $adminUser) {
            $type = request('type');
            if ($type === InsertionOrder::SIDE_CUSTOMER || $type === InsertionOrder::SIDE_AFFILIATE) {
                return $type;
            }
            return null;
        }

        if ($token === '') {
            return null;
        }
        if ($io->customer_token && hash_equals($io->customer_token, $token)) {
            return InsertionOrder::SIDE_CUSTOMER;
        }
        if ($io->affiliate_token && hash_equals($io->affiliate_token, $token)) {
            return InsertionOrder::SIDE_AFFILIATE;
        }
        return null;
    }
}
