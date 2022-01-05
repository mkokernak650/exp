<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExceptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('exceptions', function (Blueprint $table) {
            $table->id();
            $table->string('SN')->nullable();
            $table->string('Call_Date_Time')->nullable();
            $table->string('Call_Date')->nullable();
            $table->string('Has_Annotation')->nullable();
            $table->string('Annotation_Tag')->nullable();
            $table->text('Recording_Url')->nullable();
            $table->string('call_Logs_status')->nullable();
            $table->string('call_time')->nullable();
            $table->string('Duplicate_Call')->nullable();
            $table->string('Affiliate')->nullable();
            $table->string('Affiliate_Id')->nullable();
            $table->string('Market')->nullable();
            $table->string('Campaign')->nullable();
            $table->string('Campaign_Id')->nullable();
            $table->string('Inbound')->nullable();
            $table->string('Inbound_Id')->nullable();
            $table->string('Dialed')->nullable();
            $table->string('Type')->nullable();
            $table->string('Customer')->nullable();
            $table->string('Target')->nullable();
            $table->string('Target_Number')->nullable();
            $table->string('Target_Description')->nullable();
            $table->string('Source_Hangup')->nullable();
            $table->string('Conn_Duration')->nullable();
            $table->string('Time_To_Call')->nullable();
            $table->string('Account_Id')->nullable();
            $table->string('call_Length_In_Seconds')->nullable();
            $table->string('Revenue')->nullable();
            $table->string('payoutAmount')->nullable();
            $table->string('Total_Cost')->nullable();
            $table->string('Profit')->nullable();
            $table->string('City')->nullable();
            $table->string('State')->nullable();
            $table->string('Zipcode')->nullable();
            $table->string('Call_Qualification')->nullable();
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
        Schema::dropIfExists('exceptions');
    }
}
