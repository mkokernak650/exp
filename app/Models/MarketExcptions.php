<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Contracts\Activity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class MarketExcptions extends Model
{
    use LogsActivity;

    protected $guarded = [];

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
            ->useLogName('Market Exceptions');
    }

    public function getTableColumn()
    {
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
