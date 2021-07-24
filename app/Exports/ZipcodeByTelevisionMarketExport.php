<?php

namespace App\Exports;

use App\Models\ZipcodeByTelevisionMarket;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ZipcodeByTelevisionMarketExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return ZipcodeByTelevisionMarket::all();
    }

    public function headings() : array
    {
        return [
            'Market',
            'State',
            'County',
            'City',
            'Population',
            'Zip code',
            'Fips',
            'Median household income, 2007-2011',
            'Race_AmericanIndian',
            'Race_Asian',
            'Race_White',
            'Race_Black',
            'Race_Hawaiian',
            'Race_Hispanic',
            'Race_Other'
        ];
    }

    public function map($zipcode_television_market) : array
    {
        return [
            $zipcode_television_market->market,     
            $zipcode_television_market->state,    
            $zipcode_television_market->county,    
            $zipcode_television_market->city,      
            $zipcode_television_market->population,  
            $zipcode_television_market->zip_code,   
            $zipcode_television_market->fips,         
            $zipcode_television_market->median_household_income_2007_2011,
            $zipcode_television_market->race_americanindian,
            $zipcode_television_market->race_asian,
            $zipcode_television_market->race_white,
            $zipcode_television_market->race_black,
            $zipcode_television_market->race_hawaiian,
            $zipcode_television_market->race_hispanic,
            $zipcode_television_market->race_other
        ];
    }
}
