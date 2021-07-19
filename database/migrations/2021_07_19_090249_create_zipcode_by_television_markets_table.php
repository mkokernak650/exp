<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateZipcodeByTelevisionMarketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('zipcode_by_television_markets', function (Blueprint $table) {
            $table->id();
            $table->text('market')->nullable();
            $table->string('state')->nullable();
            $table->string('county')->nullable();
            $table->string('city')->nullable();
            $table->string('population')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('fips')->nullable();
            $table->string('median_household_income_2007_2011')->nullable();
            $table->string('race_americanindian')->nullable();
            $table->string('race_asian')->nullable();
            $table->string('race_white')->nullable();
            $table->string('race_black')->nullable();
            $table->string('race_hawaiian')->nullable();
            $table->string('race_hispanic')->nullable();
            $table->string('race_other')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('zipcode_by_television_markets');
    }
}
