<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcommerceSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_no',
        'coupon_code',
        'user_ip',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'billing_zip',
        'quantity',
        'subtotal',
        'shipping_cost',
        'total',
        'order_at',
    ];

    public $casts = [
        'order_at' => 'datetime',
    ];

    public function ecommerceAffiliate(): BelongsTo
    {
        return $this->belongsTo(EcommerceAffiliate::class, 'coupon_code');
    }
}
