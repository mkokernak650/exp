<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMsoNamesTable extends Migration
{
    public function up()
    {
        Schema::create('mso_names', function (Blueprint $table) {
            $table->id();
            $table->string('mso_name')->nullable();
            $table->boolean('status')->default(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mso_names');
    }
}
