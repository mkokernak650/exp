<?php

namespace App\Exports;

use App\Models\MarketExcptions;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MarketExceptionExport implements FromCollection, WithHeadings, WithMapping
{
    protected $campaignId;

    public function __construct($campaignId = null)
    {
        $this->campaignId = $campaignId;
    }

    public function collection()
    {
        return MarketExcptions::when($this->campaignId != 'null', function ($query) {
            $query->where('campaign_id', $this->campaignId);
        })->with('campaign:id,campaign_name')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Campaign',
            'MarketName',
            'CallType',
            'StartDate',
        ];
    }

    public function map($marketExcptions): array
    {
        return [
            $marketExcptions->id,
            $marketExcptions->campaign->campaign_name,
            $marketExcptions->market_id,
            $marketExcptions->call_type,
            $marketExcptions->start_date,
        ];
    }
}
