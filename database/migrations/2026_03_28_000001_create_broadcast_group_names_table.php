<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBroadcastGroupNamesTable extends Migration
{
    public function up()
    {
        Schema::create('broadcast_group_names', function (Blueprint $table) {
            $table->id();
            $table->string('broadcast_group_name')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('broadcast_group_names');
    }
}
