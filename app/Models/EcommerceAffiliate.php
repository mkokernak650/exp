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
        'affiliate_id',
        'coupon_code',
        'percentage',
        'field_map',
        'status',
    ];

    protected $casts = [
        'field_map' => 'array'
    ];

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(EcommerceSale::class);
    }
}
