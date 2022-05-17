<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EcommerceCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_name',
        'status',
    ];

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }

    public function affiliates(): HasMany
    {
        return $this->hasMany(EcommerceAffiliate::class);
    }
}
