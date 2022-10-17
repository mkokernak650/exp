<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TVHouseholds extends Model
{
    use HasFactory, LogsActivity;
    protected $guarded = array();


    public function getActivitylogOptions(): LogOptions
    {
        $userFullName = auth()->user()->firstname . ' ' . auth()->user()->lastname;
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => "An Item has been {$eventName} by {$userFullName}")
            ->useLogName('TV Households Report');
    }
}
