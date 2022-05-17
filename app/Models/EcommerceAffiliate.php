<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EcommerceAffiliate extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'affiliate_id',
        'order_type',
        'coupon_code',
        'dialed',
        'revenue',
        'affiliate_fee',
        'percentage',
        'status',
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

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EcommerceCampaign::class);
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
