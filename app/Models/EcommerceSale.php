<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcommerceSale extends Model
{
    use HasFactory;

    const ORDER_TYPE = [
        'e-commerce'         => 1,
        'phone'              => 2,
        'phone_ecommerce'    => 3,
    ];
    const AFFILIATE_FEE_TYPE = [
        'payout_per_order' => 1,
        'cash_buy'         => 2,
    ];

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'order_type',
        'order_no',
        'coupon_code',
        'user_ip',
        'dialed',
        'inbound',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'billing_zip',
        'quantity',
        'subtotal',
        'shipping_cost',
        'total',
        'order_at',
        'vendor_code',
        'product_code',
        'ani',
        'call_length',
        'payment_type',
        'r1',
        'station',
    ];

    public $casts = [
        'order_at' => 'datetime',
    ];

    public function setShippingZipAttribute($value)
    {
        if (strlen($value) < 5 && strlen($value) != 0) {
            $updatedZipCode = str_pad($value, 5, '0', STR_PAD_LEFT);
            $this->attributes['shipping_zip'] = $updatedZipCode;
        } else {
            $this->attributes['shipping_zip'] = $value;
        }
    }

    public function ecommerceAffiliate(): BelongsTo
    {
        return $this->belongsTo(EcommerceAffiliate::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(EcommerceCampaign::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
