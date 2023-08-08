<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsertionOrderDetail extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['insertion_order_id', 'ecommerce_affiliate_id', 'gross_price'];

    public function insertionOrder(): BelongsTo
    {
        return $this->belongsTo(insertionOrder::class);
    }

    public function ecommerceAffiliate(): BelongsTo
    {
        return $this->belongsTo(EcommerceAffiliate::class);
    }
}
