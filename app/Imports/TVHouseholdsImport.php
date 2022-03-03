<?php

namespace App\Imports;

use App\Models\TVHouseholds;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TVHouseholdsImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $existData = TVHouseholds::where('market', $row['market'])->where('state', $row['state'])->count();

        if ($row['market'] !==null && $row['state'] !==null && $existData<1) {
            return new TVHouseholds([
                'market' => $row['market'],
                'state' => $row['state'],
                'tv_households' => $row['tv_households'],
            ]);
        }
    }
}
