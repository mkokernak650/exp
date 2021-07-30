<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateZipCodeDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('zip_code_data', function (Blueprint $table) {
            $table->id();
            $table->string('NPA')->nullable();
            $table->string('NXX')->nullable();
            $table->string('NPANXX')->nullable();
            $table->string('ZipCode')->nullable();
            $table->string('State')->nullable();
            $table->string('City')->nullable();
            $table->string('County')->nullable();
            $table->string('CountyPop')->nullable();
            $table->bigInteger('ZipCodeCount')->nullable();
            $table->string('ZipCodeFreq')->nullable();
            $table->string('Latitude')->nullable();
            $table->string('Longitude')->nullable();
            $table->string('TimeZone')->nullable();
            $table->string('ObservesDST')->nullable();
            $table->string('NXXUseType')->nullable();
            $table->string('NXXIntroVersion')->nullable();
            $table->string('NPANew')->nullable();
            $table->string('FIPS')->nullable();
            $table->string('Status')->nullable();
            $table->string('LATA')->nullable();
            $table->string('Overlay')->nullable();
            $table->string('RateCenter')->nullable();
            $table->string('SwitchCLLI')->nullable();
            $table->string('MSA_CBSA')->nullable();
            $table->string('MSA_CBSA_CODE')->nullable();
            $table->string('OCN')->nullable();
            $table->string('Company')->nullable();
            $table->string('CoverageAreaName')->nullable();
            $table->string('Flags')->nullable();
            $table->string('WeightedLat')->nullable();
            $table->string('WeightedLon')->nullable();
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
        Schema::dropIfExists('zip_code_data');
    }
}
