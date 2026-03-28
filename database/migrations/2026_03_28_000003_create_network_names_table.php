<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNetworkNamesTable extends Migration
{
    public function up()
    {
        Schema::create('network_names', function (Blueprint $table) {
            $table->id();
            $table->string('network_name')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('network_names');
    }
}
