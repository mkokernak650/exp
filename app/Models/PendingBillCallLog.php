<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingBillCallLog extends Model
{
    use HasFactory;
    protected $guarded = array();

    public function getTableColumn()
    {
       return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }

    public function annotation()
    {
        return $this->belongsTo(Annotation::class);
    }
}
