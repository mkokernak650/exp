<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class TableDetails extends Model
{
    use HasFactory;

    protected $fillable = ['column_details', 'user_id'];

    protected static function booted(): void
    {
        static::addGlobalScope('userScope', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('user_id', Auth::id());
            }
        });

        static::creating(function (self $tableDetails) {
            if (Auth::check() && $tableDetails->user_id === null) {
                $tableDetails->user_id = Auth::id();
            }
        });
    }
}
