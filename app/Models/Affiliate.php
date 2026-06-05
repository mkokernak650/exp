<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Spatie\Activitylog\Contracts\Activity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Affiliate extends Model
{
    use HasFactory, LogsActivity;

    protected $guarded = [];

    protected static $recordEvents = ['created'];

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
            ->useLogName('Affiliate');
    }

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }

    public function ecommerceAffiliates(): HasMany
    {
        return $this->hasMany(EcommerceAffiliate::class);
    }

    public function broadcastGroups(): MorphToMany
    {
        return $this->morphedByMany(BroadcastGroupName::class, 'corporationable', 'affiliate_corporation');
    }

    public function msos(): MorphToMany
    {
        return $this->morphedByMany(MsoName::class, 'corporationable', 'affiliate_corporation');
    }

    public function networks(): MorphToMany
    {
        return $this->morphedByMany(NetworkName::class, 'corporationable', 'affiliate_corporation');
    }
}
