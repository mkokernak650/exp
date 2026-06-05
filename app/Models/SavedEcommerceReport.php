<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedEcommerceReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'report_for',
        'filters',
        'is_active',
        'last_generated_at',
        'recurrence_frequency',
        'recipients',
        'last_emailed_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'recipients' => 'array',
        'is_active' => 'boolean',
        'last_generated_at' => 'datetime',
        'last_emailed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
