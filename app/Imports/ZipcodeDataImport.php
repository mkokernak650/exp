<?php

namespace App\Imports;

use App\Models\ZipCodeData;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ZipcodeDataImport implements ToModel, WithHeadingRow
{
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        return new ZipCodeData([
            'NPA'               => $row['npa'],
            'NXX'               => $row['nxx'],
            'CountyPop'         => $row['countypop'],
            'ZipCodeCount'      => $row['zipcodecount'],
            'ZipCodeFreq'       => $row['zipcodefreq'],
            'Latitude'          => $row['latitude'],
            'Longitude'         => $row['longitude'],
            'State'             => $row['state'],
            'City'              => $row['city'],
            'County'            => $row['county'],
            'TimeZone'          => $row['timezone'],
            'ObservesDST'       => $row['observesdst'],
            'NXXUseType'        => $row['nxxusetype'],
            'NXXIntroVersion'   => $row['nxxintroversion'],
            'ZipCode'           => $row['zipcode'],
            'NPANew'            => $row['npanew'],
            'FIPS'              => $row['fips'],
            'LATA'              => $row['lata'],
            'Overlay'           => $row['overlay'],
            'RateCenter'        => $row['ratecenter'],
            'SwitchCLLI'        => $row['switchclli'],
            'MSA_CBSA'          => $row['msa_cbsa'],
            'MSA_CBSA_CODE'     => $row['msa_cbsa_code'],
            'OCN'               => $row['ocn'],
            'Company'           => $row['company'],
            'CoverageAreaName'  => $row['coverageareaname'],
            'NPANXX'            => $row['npanxx'],
            'Flags'             => $row['flags'],
            'Status'            => $row['status'],
            'WeightedLat'       => $row['weightedlat'],
            'WeightedLon'       => $row['weightedlon'],
        ]);
    }
}
