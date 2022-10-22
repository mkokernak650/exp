<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Contracts\Activity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class WebForm extends Model
{
    use HasFactory, LogsActivity;
    protected $guarded = [];

    public function tapActivity(Activity $activity)
    {
        $subjectId = $this->id;
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        $userEmail = auth()->user()->email;

        $activity->properties = ['name' => $userFullName, 'email' => $userEmail, 'ids' => $subjectId];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => "An Item has been {$eventName}")
            ->useLogName('Webforms Reports');
    }
}
