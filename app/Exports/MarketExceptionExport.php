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

    public function headings(): array
    {
        return [
            'ID',
            'Customer',
            'MarketName',
            'CallType',
            'StartDate',
        ];
    }

    public function map($marketExcptions): array
    {
        $callTypeString = "";
        if ($marketExcptions->call_type === 1) {
            $callTypeString = "Landline";
        } else if ($marketExcptions->call_type === 2) {
            $callTypeString = "Wireless";
        } else if ($marketExcptions->call_type === 3) {
            $callTypeString = "Both";
        }

        return [
            $marketExcptions->id,
            $marketExcptions->customer_id,
            $marketExcptions->market_id,
            $callTypeString,
            $marketExcptions->start_date,
        ];
    }
}
