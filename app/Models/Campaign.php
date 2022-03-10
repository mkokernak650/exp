<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_name',
        'connection_duration',
        'status',
    ];

    public function ecommerceAffiliates(): HasMany
    {
        return $this->hasMany(EcommerceAffiliate::class);
    }

    public function marketExceptions(): HasMany
    {
        return $this->hasMany(MarketExcptions::class);
    }

    public function annotations(): HasMany
    {
        return $this->hasMany(Annotation::class);
    }

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }
}
