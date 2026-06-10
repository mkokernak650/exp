<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Contracts\Activity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class EcommerceAffiliate extends Model
{
    use HasFactory, LogsActivity;

    const FEE_MODE = [
        'payout_per_order' => 1,
        'cash_buy'         => 2,
        'fixed_pct'        => 3,
        'tiered'           => 4,
    ];

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'affiliate_id',
        'product_code',
        'order_type',
        'coupon_code',
        'tracking_url',
        'dialed',
        'pay_on_multiple_orders',
        'lengths',
        'affiliate_fee_type',
        'revenue',
        'affiliate_fee',
        'percentage',
        'status',
        'description',
        'video_url',
        'cash_buy',
        'consumerEXP_cash_buy_fee',
        'consumerEXP_cash_buy_fee_type'
    ];

    public function tapActivity(Activity $activity)
    {
        $subjectId = $this->id;
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail = auth()->user()->email;

        $activity->properties = ['name' => $userFullName, 'email' => $userEmail, 'ids' => $subjectId];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => "An Item has been {$eventName}")
            ->useLogName('Ecommerce Affiliate');
    }

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }

    /**
     * IO line-item title for a spot length. Numeric/time lengths get a "sec"
     * suffix; named lengths (e.g. "Block Programming", "Various") do not.
     */
    public static function lengthTitle($length, $campaignName)
    {
        $length = trim((string) $length);
        $suffix = preg_match('/[a-zA-Z]/', $length) ? ' - ' : ' sec- ';

        return $length . $suffix . $campaignName;
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EcommerceCampaign::class, 'campaign_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(EcommerceSale::class);
    }
}
