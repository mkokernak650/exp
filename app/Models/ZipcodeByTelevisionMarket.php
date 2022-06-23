<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZipcodeByTelevisionMarket extends Model
{
    use HasFactory;

    protected $table = 'zipcode_by_television_markets';
    
    protected $fillable = [
        'market',
        'state',
        'county',
        'city',
        'population',
        'zip_code',
        'fips',
        'median_household_income_2007_2011',
        'race_americanindian',
        'race_asian',
        'race_white',
        'race_black',
        'race_hawaiian',
        'race_hispanic',
        'race_other'
    ];
}
