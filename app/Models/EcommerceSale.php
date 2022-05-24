<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcommerceSale extends Model
{
    use HasFactory;

    const ORDER_TYPE = [
        'e-commerce' => 1,
        'phone'      => 2,
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
    ];

    public $casts = [
        'order_at' => 'datetime',
    ];

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
