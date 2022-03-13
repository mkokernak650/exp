<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BroadCastWeeks extends Model
{
    use HasFactory;

    protected $guarded = array();

    public function scopeActive($query)
    {
        return $query->whereStatus(1);
    }
}
