<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRingbaCallLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ringba_call_logs', function (Blueprint $table) {
            $table->id();
            $table->string('sk');
            $table->time('call_date');
            $table->string('has_annotation', 100);
            $table->string('annotation_tag', 100);
            $table->string('call_status', 100);
            $table->string('recording_url');
            $table->time('time');
            $table->string('duplicate_call');
            $table->string('affiliate');
            $table->string('market');
            $table->string('campaign');
            $table->string('inbound');
            $table->string('dialed', 100);
            $table->string('type', 100);
            $table->string('customer');
            $table->string('target');
            $table->string('target_description');
            $table->string('conn_duration');
            $table->string('time_to_call');
            $table->string('call_length_in_seconds');
            $table->string('revenue');
            $table->string('payout');
            $table->string('total_cost');
            $table->string('profit');
            $table->string('city');
            $table->string('state');
            $table->string('zipcode');
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
        Schema::dropIfExists('ring_call_logs');
    }
}
