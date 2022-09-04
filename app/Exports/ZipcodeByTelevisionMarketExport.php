<?php

namespace App\Exports;

use App\Http\Controllers\Controller;
use App\Models\ZipcodeByTelevisionMarket;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ZipcodeByTelevisionMarketExport extends Controller implements FromCollection, WithHeadings, WithMapping
{
    protected $filterValue;

    public function __construct($filterValue)
    {
        $this->filterValue = $filterValue;
    }

    public function collection()
    {
        $zipDataQuery = ZipcodeByTelevisionMarket::query();
        $conditions = json_decode($this->filterValue);
        $firstCond = $conditions->items[0];
        $this->makeConditionQuery($zipDataQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);
        for ($i = 1; $i < count($conditions->items); $i++) {
            $cond = $conditions->items[$i];
            $this->makeConditionQuery($zipDataQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
        }

        return $zipDataQuery->get();
    //     $array = [];
    //     $zipDataQuery->chunk(1000, function ($test) use (&$array) {
    //         array_push($array, $test);
    //     });
    //    return $array;

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
            'Race AmericanIndian',
            'Race Asian',
            'Race White',
            'Race Black',
            'Race Hawaiian',
            'Race Hispanic',
            'Race Other'
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
