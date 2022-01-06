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

    public function marketExceptions(): HasMany
    {
        return $this->hasMany(MarketExcptions::class);
    }

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }
}
