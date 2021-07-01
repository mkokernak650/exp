<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RingbaAuthDetails extends Model
{
    use HasFactory;
    protected $fillable = ['user_info','auth_details'];
    // protected $table = 'ringba_auth_details';

}
