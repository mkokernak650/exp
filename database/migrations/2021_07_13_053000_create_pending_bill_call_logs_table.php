<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePendingBillCallLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pending_bill_call_logs', function (Blueprint $table) {
            $table->id();
            $table->string('SN')->nullable();
            $table->string('Call_Date')->nullable();
            $table->string('Call_Date_Time')->nullable();
            $table->string('Duplicate_Call')->nullable();
            $table->string('Affiliate')->nullable();
            $table->string('Campaign')->nullable();
            $table->string('Inbound_Id')->nullable();
            $table->string('Inbound')->nullable();
            $table->string('Dialed')->nullable();
            $table->string('Type')->nullable();
            $table->string('Target')->nullable();
            $table->string('Source_Hangup')->nullable();
            $table->string('Conn_Duration')->nullable();
            $table->string('Time_To_Call')->nullable();
            $table->string('call_Length_In_Seconds')->nullable();
            $table->string('Revenue')->nullable();
            $table->string('payout')->nullable();
            $table->string('Total_Cost')->nullable();
            $table->string('Profit')->nullable();
            $table->string('call_Logs_status')->nullable();
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
        Schema::dropIfExists('pending_bill_call_logs');
    }
}
