<?php

namespace App\Exports;

use App\Http\Controllers\Controller;
use App\Models\ZipCodeData;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ZipcodeDataExport extends Controller implements FromCollection, WithHeadings, WithMapping
{
    protected $filterValue;

    public function __construct($filterValue)
    {
        $this->filterValue = $filterValue;
    }

    public function collection()
    {
        $zipDataQuery = ZipCodeData::query();
        $conditions = json_decode($this->filterValue);
        $firstCond = $conditions->items[0];
        $this->makeConditionQuery($zipDataQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);
        for ($i = 1; $i < count($conditions->items); $i++) {
            $cond = $conditions->items[$i];
            $this->makeConditionQuery($zipDataQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
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
