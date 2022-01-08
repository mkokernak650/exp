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
}
