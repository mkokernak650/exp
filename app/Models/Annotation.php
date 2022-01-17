<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'annotation_name',
        'campaign_id',
        'status'
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function callLogs()
    {
        return $this->hasMany(RingbaCallLog::class);
    }

    public function pendingCallLogs()
    {
        return $this->hasMany(PendingBillCallLog::class);
    }

    public function billedCallLogs()
    {
        return $this->hasMany(BilledCallLog::class);
    }
}
