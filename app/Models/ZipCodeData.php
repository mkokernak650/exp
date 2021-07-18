<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZipCodeData extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function getTableColumn()
    {
        // return self::getConnection()->getSchemaBuilder()->getColumnListing(self::getTable());
        return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
}
