<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InsertionOrder extends Model
{
    use HasFactory;

    public const STATUS = [
        'draft'     => 'draft',
        'pending'   => 'pending',
        'sent'      => 'sent',
        'accepted'  => 'accepted',
        'declined'  => 'declined',
        'void'      => 'void',
        'canceled'  => 'canceled',
    ];

    public const EDITABLE_STATUSES = ['draft', 'pending'];

    public const SIDE_CUSTOMER  = 'customer';
    public const SIDE_AFFILIATE = 'affiliate';

    protected $fillable = [
        'io_no',
        'customer_id',
        'affiliate_id',
        'io_link',
        'status',
        'customer_accepted_at',
        'affiliate_accepted_at',
        'customer_accepted_by_user_id',
        'affiliate_accepted_by_user_id',
        'sent_at',
        'accepted_at',
        'cancellation_requested_at',
        'canceled_at',
        'customer_token',
        'affiliate_token',
        'corporation_type',
        'corporation_id',
    ];

    protected $casts = [
        'customer_accepted_at'        => 'datetime',
        'affiliate_accepted_at'       => 'datetime',
        'sent_at'                     => 'datetime',
        'accepted_at'                 => 'datetime',
        'cancellation_requested_at'   => 'datetime',
        'canceled_at'                 => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function attachedAffiliates(): BelongsToMany
    {
        return $this->belongsToMany(Affiliate::class, 'insertion_order_affiliate');
    }

    public function cashBuySpots(): HasMany
    {
        return $this->hasMany(CashBuySpot::class);
    }

    public function scopeEditable($query)
    {
        return $query->whereIn('status', self::EDITABLE_STATUSES);
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', self::STATUS['accepted']);
    }

    public function scopeActiveWindow($query)
    {
        return $query->whereIn('status', [self::STATUS['accepted']])
            ->where(function ($q) {
                $q->whereNull('canceled_at')->orWhere('canceled_at', '>=', now());
            });
    }

    public function isEditable(): bool
    {
        return in_array($this->status, self::EDITABLE_STATUSES, true);
    }

    public function hasCashBuySpots(): bool
    {
        return $this->cashBuySpots()->exists();
    }

    public function staffOverrideAllowed(): bool
    {
        return !$this->hasCashBuySpots();
    }

    /**
     * Resolve the polymorphic corporation row if corporation_type+id are set.
     */
    public function corporation()
    {
        if (!$this->corporation_type || !$this->corporation_id) {
            return null;
        }

        $modelClass = \App\Services\CorporationService::TYPE_TO_MODEL[$this->corporation_type] ?? null;
        if (!$modelClass) {
            return null;
        }
        return $modelClass::find($this->corporation_id);
    }
}
