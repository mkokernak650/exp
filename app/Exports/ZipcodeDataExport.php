<?php

namespace App\Exports;

use App\Models\ZipCodeData;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ZipcodeDataExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return ZipCodeData::all();
    }

    public function headings(): array
    {
        return [
            'NPA',
            'NXX',
            'CountyPop',
            'ZipCodeCount',
            'ZipCodeFreq',
            'Latitude',
            'Longitude',
            'State',
            'City',
            'County',
            'TimeZone',
            'ObservesDST',
            'NXXUseType',
            'NXXIntroVersion',
            'ZipCode',
            'NPANew',
            'FIPS',
            'LATA',
            'Overlay',
            'RateCenter',
            'SwitchCLLI',
            'MSA_CBSA',
            'MSA_CBSA_CODE',
            'OCN',
            'Company',
            'CoverageAreaName',
            'NPANXX',
            'Flags',
            'Status',
            'WeightedLat',
            'WeightedLon'
        ];
    }

    public function map($zipcodeData): array
    {
        return [
            $zipcodeData->NPA,
            $zipcodeData->NXX,
            $zipcodeData->CountyPop,
            $zipcodeData->ZipCodeCount,
            $zipcodeData->ZipCodeFreq,
            $zipcodeData->Latitude,
            $zipcodeData->Longitude,
            $zipcodeData->State,
            $zipcodeData->City,
            $zipcodeData->County,
            $zipcodeData->TimeZone,
            $zipcodeData->ObservesDST,
            $zipcodeData->NXXUseType,
            $zipcodeData->NXXIntroVersion,
            $zipcodeData->ZipCode,
            $zipcodeData->NPANew,
            $zipcodeData->FIPS,
            $zipcodeData->LATA,
            $zipcodeData->Overlay,
            $zipcodeData->RateCenter,
            $zipcodeData->SwitchCLLI,
            $zipcodeData->MSA_CBSA,
            $zipcodeData->MSA_CBSA_CODE,
            $zipcodeData->OCN,
            $zipcodeData->Company,
            $zipcodeData->CoverageAreaName,
            $zipcodeData->NPANXX,
            $zipcodeData->Flags,
            $zipcodeData->Status,
            $zipcodeData->WeightedLat,
            $zipcodeData->WeightedLon
        ];
    }
}
