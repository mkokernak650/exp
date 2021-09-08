<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportGeneratorsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('report_generators', function (Blueprint $table) {
            $table->id();
            $table->string('Call_Date')->nullable();
            $table->string('Call_Time')->nullable();
            $table->string('Campaign')->nullable();
            $table->string('Dialed')->nullable();
            $table->string('Target')->nullable();
            $table->string('Affiliate')->nullable();
            $table->string('City')->nullable();
            $table->string('Market')->nullable();
            $table->string('State')->nullable();
            $table->string('Type')->nullable();
            $table->string('Annotation_Tag')->nullable();
            $table->string('Conn_Duration')->nullable();
            $table->string('Duplicate_Call')->nullable();
            $table->string('Source_Hangup')->nullable();
            $table->string('Revenue')->nullable();
            $table->string('call_Logs_status')->nullable();
            $table->string('Zipcode')->nullable();
            $table->string('Target_Description')->nullable();
            $table->string('payout')->nullable();
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
        Schema::dropIfExists('report_generators');
    }
}
