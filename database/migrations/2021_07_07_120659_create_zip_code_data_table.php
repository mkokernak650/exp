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
            $table->string('NPA');
            $table->string('NXX');
            $table->string('NPANXX');
            $table->string('ZipCode');
            $table->string('State');
            $table->string('City');
            $table->string('County');
            $table->string('CountyPop');
            $table->string('ZipCodeCount');
            $table->string('ZipCodeFreq');
            $table->string('Latitude');
            $table->string('Longitude');
            $table->string('TimeZone');
            $table->string('ObservesDST');
            $table->string('NXXUseType');
            $table->string('NXXIntroVersion');
            $table->string('NPANew');
            $table->string('FIPS');
            $table->string('Status');
            $table->string('LATA');
            $table->string('Overlay');
            $table->string('RateCenter');
            $table->string('SwitchCLLI');
            $table->string('MSA_CBSA');
            $table->string('MSA_CBSA_CODE');
            $table->string('OCN');
            $table->string('Company');
            $table->string('CoverageAreaName');
            $table->string('Flags');
            $table->string('WeightedLat');
            $table->string('WeightedLon');
            $table->string('_ID');
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
