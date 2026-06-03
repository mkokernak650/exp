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
    const RECORD_KIND = [
        'SALE'   => 'SALE',
        'RETURN' => 'RETURN',
    ];

    protected $fillable = [
        'campaign_id',
        'customer_id',
        'order_type',
        'record_kind',
        'order_no',
        'coupon_code',
        'tracking_url',
        'user_ip',
        'dialed',
        'inbound',
        'shipping_city',
        'shipping_state',
        'ship_country',
        'shipping_zip',
        'billing_zip',
        'quantity',
        'subtotal',
        'shipping_cost',
        'total',
        'vendor_fee',
        'consumerexp_fee',
        'import_hash',
        'order_at',
        'vendor_code',
        'telemarketing_co',
        'product_code',
        'isci',
        'order_description',
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

    public function scopeSales($query)
    {
        return $query->where('record_kind', self::RECORD_KIND['SALE']);
    }

    public function scopeReturns($query)
    {
        return $query->where('record_kind', self::RECORD_KIND['RETURN']);
    }

    public function isReturn(): bool
    {
        return $this->record_kind === self::RECORD_KIND['RETURN'];
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
