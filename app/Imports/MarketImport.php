<?php

namespace App\Imports;

use App\Models\Market;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\ToModel;

class MarketImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // create row name with row name
        return new Market([
            'creater_id' => $row['creater_id'],
            'market_name' => $row['market_name']
        ]);
    }
}
