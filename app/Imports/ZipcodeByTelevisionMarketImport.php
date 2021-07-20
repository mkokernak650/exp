<?php

namespace App\Imports;

use App\Models\ZipcodeByTelevisionMarket;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ZipcodeByTelevisionMarketImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new ZipcodeByTelevisionMarket([
            'market'        => $row['market'],
            'state'         => $row['state'],
            'county'        => $row['county'],
            'city'          => $row['city'],
            'population'    => $row['population'],
            'zip_code'      => $row['zip_code'],
            'fips'          => $row['fips'],
            'median_household_income_2007_2011' => $row['median_household_income_2007_2011'],
            'race_americanindian' => $row['race_americanindian'],
            'race_asian'    => $row['race_asian'],
            'race_white'    => $row['race_white'],
            'race_black'    => $row['race_black'],
            'race_hawaiian' => $row['race_hawaiian'],
            'race_hispanic' => $row['race_hispanic'],
            'race_other'    => $row['race_other']
        ]);
    }
}
