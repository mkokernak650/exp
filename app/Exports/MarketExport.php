<?php

namespace App\Exports;

use App\Models\Market;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\FromCollection;

class MarketExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Market::all();
    }

    public function headings(): array
    {
        return [
            'Market name'
        ];
    }

    public function map($market): array
    {
        // echo '<pre>';
        // var_dump($market);
        // echo '</pre>';
        return [
            $market->market_name
        ];
    }
}
