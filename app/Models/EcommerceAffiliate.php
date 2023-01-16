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

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'affiliate_id',
        'order_type',
        'coupon_code',
        'dialed',
        'affiliate_fee_type',
        'revenue',
        'affiliate_fee',
        'percentage',
        'status',
        'cash_buy',
    ];

    protected static function booted()
    {
        static::creating(function ($item) {
            $item->percentage = $item->revenue - $item->affiliate_fee;
        });

        static::updating(function ($item) {
            $item->percentage = $item->revenue - $item->affiliate_fee;
        });
    }

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
