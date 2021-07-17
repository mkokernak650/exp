<?php

namespace App\Imports;

use App\Models\Market;
use Maatwebsite\Excel\Concerns\ToModel;

class MarketImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Market([
            'creater_id' => $row[0],
            'market_name' => $row[1]
        ]);
    }
}
