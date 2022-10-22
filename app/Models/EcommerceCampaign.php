<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Contracts\Activity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class EcommerceCampaign extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'campaign_name',
        'status',
    ];

    public function tapActivity(Activity $activity)
    {
        $subjectId    = $this->id;
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail    = auth()->user()->email;

        $activity->properties = ['name' => $userFullName, 'email' => $userEmail, 'ids' => $subjectId];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => "An Item has been {$eventName}")
            ->useLogName('Ecommerce Campaign');
    }

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }

    public function affiliates(): HasMany
    {
        return $this->hasMany(EcommerceAffiliate::class, 'campaign_id');
    }
}
