<?php

namespace App\Services;

use App\Models\InsertionOrder;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * State-machine for InsertionOrder. Methods are idempotent where they can be; transitions
 * that violate the current state throw a DomainException so the caller can return 422.
 */
class InsertionOrderService
{
    public const NOTICE_DAYS = 30;

    /**
     * draft|pending -> sent
     * Generates approval tokens for the two parties + stamps sent_at.
     */
    public function send(InsertionOrder $io): InsertionOrder
    {
        $this->ensureStatus($io, [InsertionOrder::STATUS['draft'], InsertionOrder::STATUS['pending']]);

        $io->customer_token  = $io->customer_token  ?: sha1(Str::uuid()->toString() . '|c|' . $io->id);
        $io->affiliate_token = $io->affiliate_token ?: sha1(Str::uuid()->toString() . '|a|' . $io->id);
        $io->status          = InsertionOrder::STATUS['sent'];
        $io->sent_at         = now();
        $io->save();

        return $io->refresh();
    }

    /**
     * Mark customer side accepted via token (party click) or by staff override (user provided).
     * Staff override blocked when the IO carries any cash-buy spot.
     */
    public function acceptCustomer(InsertionOrder $io, ?string $token = null, ?User $staff = null): InsertionOrder
    {
        $this->ensureSent($io);
        $this->verifyTokenOrStaff($io, $token, $staff, InsertionOrder::SIDE_CUSTOMER);

        $io->customer_accepted_at         = now();
        $io->customer_accepted_by_user_id = $staff?->id;
        $io->save();

        return $this->finalizeIfBothAccepted($io);
    }

    public function acceptAffiliate(InsertionOrder $io, ?string $token = null, ?User $staff = null): InsertionOrder
    {
        $this->ensureSent($io);
        $this->verifyTokenOrStaff($io, $token, $staff, InsertionOrder::SIDE_AFFILIATE);

        $io->affiliate_accepted_at         = now();
        $io->affiliate_accepted_by_user_id = $staff?->id;
        $io->save();

        return $this->finalizeIfBothAccepted($io);
    }

    /**
     * Decline. Cash-buy IO declined by either party -> void (revivable). Other IOs -> declined (permanent).
     */
    public function decline(InsertionOrder $io, string $side, ?string $token = null, ?User $staff = null): InsertionOrder
    {
        $this->ensureSent($io);
        $this->verifyTokenOrStaff($io, $token, $staff, $side);

        $io->status = $io->hasCashBuySpots()
            ? InsertionOrder::STATUS['void']
            : InsertionOrder::STATUS['declined'];
        $io->save();

        return $io->refresh();
    }

    /**
     * void -> draft. Wipe tokens + approval timestamps so the cycle can restart.
     */
    public function revive(InsertionOrder $io): InsertionOrder
    {
        $this->ensureStatus($io, [InsertionOrder::STATUS['void']]);

        $io->forceFill([
            'status'                        => InsertionOrder::STATUS['draft'],
            'customer_token'                => null,
            'affiliate_token'               => null,
            'customer_accepted_at'          => null,
            'affiliate_accepted_at'         => null,
            'customer_accepted_by_user_id'  => null,
            'affiliate_accepted_by_user_id' => null,
            'sent_at'                       => null,
            'accepted_at'                   => null,
        ])->save();

        return $io->refresh();
    }

    /**
     * accepted -> cancellation_requested. The 30-day clock runs from NOW; the scheduled job
     * flips status to 'canceled' once canceled_at passes.
     */
    public function cancel(InsertionOrder $io, ?User $staff = null): InsertionOrder
    {
        $this->ensureStatus($io, [InsertionOrder::STATUS['accepted']]);

        $now = now();
        $io->cancellation_requested_at = $now;
        $io->canceled_at               = $now->copy()->addDays(self::NOTICE_DAYS);
        $io->save();

        return $io->refresh();
    }

    /**
     * Force-flip an IO whose canceled_at has elapsed. Called by reports:expire-canceled-ios.
     */
    public function finalizeCancellation(InsertionOrder $io): InsertionOrder
    {
        if ($io->status === InsertionOrder::STATUS['canceled']) {
            return $io;
        }
        if ($io->canceled_at && $io->canceled_at->lte(now())) {
            $io->status = InsertionOrder::STATUS['canceled'];
            $io->save();
        }
        return $io->refresh();
    }

    /**
     * Move draft -> pending (used when the IO has been saved but is being prepared for sending).
     */
    public function markPending(InsertionOrder $io): InsertionOrder
    {
        $this->ensureStatus($io, [InsertionOrder::STATUS['draft']]);
        $io->status = InsertionOrder::STATUS['pending'];
        $io->save();
        return $io->refresh();
    }

    protected function finalizeIfBothAccepted(InsertionOrder $io): InsertionOrder
    {
        if ($io->customer_accepted_at && $io->affiliate_accepted_at) {
            $io->accepted_at = Carbon::parse($io->customer_accepted_at)->max($io->affiliate_accepted_at);
            $io->status      = InsertionOrder::STATUS['accepted'];
            $io->save();
        }
        return $io->refresh();
    }

    protected function verifyTokenOrStaff(InsertionOrder $io, ?string $token, ?User $staff, string $side): void
    {
        if ($token !== null) {
            $expected = $side === InsertionOrder::SIDE_CUSTOMER ? $io->customer_token : $io->affiliate_token;
            if (!$expected || !hash_equals($expected, $token)) {
                throw new \DomainException('Invalid approval token.');
            }
            return;
        }

        if ($staff === null) {
            throw new \DomainException('Approval requires either a valid token or an authenticated staff user.');
        }

        if (!$io->staffOverrideAllowed()) {
            throw new \DomainException('Cash-buy IOs cannot be approved by staff override; both parties must click Accept.');
        }
    }

    protected function ensureSent(InsertionOrder $io): void
    {
        $this->ensureStatus($io, [InsertionOrder::STATUS['sent']]);
    }

    protected function ensureStatus(InsertionOrder $io, array $allowed): void
    {
        if (!in_array($io->status, $allowed, true)) {
            throw new \DomainException("IO status '{$io->status}' does not allow this action.");
        }
    }
}
