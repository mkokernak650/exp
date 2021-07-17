<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RingbaAuthDetails extends Model
{
    use HasFactory;
    protected $fillable = ['user_info','auth_details'];


    public function getTableColumn()
    {
       return $this->getConnection()->getSchemaBuilder()->getColumnListing($this->getTable());
    }
    

}
