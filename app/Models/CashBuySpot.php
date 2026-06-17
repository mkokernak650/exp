<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashBuySpot extends Model
{
    use HasFactory;

    protected $table = 'insertion_order_cash_buy_spots';

    protected $fillable = [
        'insertion_order_id',
        'affiliate_id',
        'spot_date',
        'spot_time',
        'day_of_week',
        'time_zone',
        'amount',
        'affiliate_payout',
    ];

    protected $casts = [
        'spot_date' => 'date',
        'amount'    => 'decimal:2',
    ];

    public function insertionOrder(): BelongsTo
    {
        return $this->belongsTo(InsertionOrder::class);
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }
}
