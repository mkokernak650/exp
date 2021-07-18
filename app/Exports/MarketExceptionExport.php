<?php

namespace App\Exports;

use App\Models\MarketExcptions;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\FromCollection;

class MarketExceptionExport implements FromCollection,  WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return MarketExcptions::all();
    }

    public function headings() : array
    {
        return [
            'ID',
            'Market name'
        ];
    }

    public function map($marketExcptions) : array
    {
        return [
            $marketExcptions->id,
            $marketExcptions->market_name
        ];
    }
}
