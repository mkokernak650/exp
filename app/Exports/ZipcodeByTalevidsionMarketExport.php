<?php

namespace App\Exports;

use App\Models\ZipcodeByTelevisionMarket;
use Maatwebsite\Excel\Concerns\FromCollection;

class ZipcodeByTalevidsionMarketExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return ZipcodeByTelevisionMarket::all();
    }
}
