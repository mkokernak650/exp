<?php

namespace App\Exports;

use App\Http\Controllers\Controller;
use App\Models\ZipCodeData;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ZipcodeDataExport extends Controller implements FromCollection, WithHeadings, WithMapping
{
    protected $filterByState;
    protected $filterByTimeZone;
    protected $filterBySearchBoxValue;

    public function __construct($filterByState, $filterByTimeZone, $filterBySearchBoxValue)
    {
        $this->filterByState          = $filterByState;
        $this->filterByTimeZone       = $filterByTimeZone;
        $this->filterBySearchBoxValue = $filterBySearchBoxValue;
    }

    public function collection()
    {
        $zipDataQuery = ZipCodeData::query();

        if (!empty($this->filterByState)) {
            $filterByState = explode(',', $this->filterByState);
            $zipDataQuery->whereIn('State', $filterByState);
        }

        if (!empty($this->filterByTimeZone)) {
            $filterByTimeZone = explode(',', $this->filterByTimeZone);
            $zipDataQuery->whereIn('TimeZone', $filterByTimeZone);
        }

        $filterBySearchBoxValue = json_decode($this->filterBySearchBoxValue);

        if (!empty($filterBySearchBoxValue->county)) {
            $zipDataQuery->where('County', 'LIKE', "%{$filterBySearchBoxValue->county}%");
        }

        if (!empty($filterBySearchBoxValue->city)) {
            $zipDataQuery->where('City', 'LIKE', "%{$filterBySearchBoxValue->city}%");
        }

        if (!empty($filterBySearchBoxValue->zipCode)) {
            $zipDataQuery->where('ZipCode', 'LIKE', "%{$filterBySearchBoxValue->zipCode}%");
        }

        if (!empty($filterBySearchBoxValue->npa)) {
            $zipDataQuery->where('NPA', 'LIKE', "%{$filterBySearchBoxValue->npa}%");
        }

        if (!empty($filterBySearchBoxValue->nxx)) {
            $zipDataQuery->where('NXX', 'LIKE', "%{$filterBySearchBoxValue->nxx}%");
        }

        return $zipDataQuery->get();
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
