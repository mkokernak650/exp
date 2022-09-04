<?php

namespace App\Exports;

use App\Http\Controllers\Controller;
use App\Models\TVHouseholds;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TvHouseholdsExport extends Controller implements FromCollection, WithHeadings, WithMapping
{
    protected $filterValue;

    public function __construct($filterValue)
    {
        $this->filterValue = $filterValue;
    }

    public function collection()
    {
        $householdsDataQuery = TVHouseholds::query();
        $conditions = json_decode($this->filterValue);
        $firstCond = $conditions->items[0];
        $this->makeConditionQuery($householdsDataQuery, 'where', $firstCond->field, $firstCond->operator, $firstCond->value);

        for ($i = 1; $i < count($conditions->items); $i++) {
            $cond = $conditions->items[$i];
            $this->makeConditionQuery($householdsDataQuery, $conditions->groupName, $cond->field, $cond->operator, $cond->value);
        }
        return $householdsDataQuery->get();
    }

    public function headings() : array
    {
        return [
            'Market',
            'State',
            'TV Households',
            'Created AT',

        ];
    }

    public function map($customer) : array
    {
        return [
            $customer->market,
            $customer->state,
            $customer->tv_households,
            $customer->created_at,
        ];
    }
}
