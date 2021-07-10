<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCountryByMarketReportsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('country_by_market_reports', function (Blueprint $table) {
            $table->id();
            $table->string('County')->nullable();
            $table->string('Fips')->nullable();
            $table->string('Market')->nullable();
            $table->string('State')->nullable();
            $table->string('Households_2007_2011')->nullable();
            $table->string('Housing_unit_estimates_2011')->nullable();
            $table->string('County_Households_2008_2012')->nullable();
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
        Schema::dropIfExists('country_by_market_reports');
    }
}
