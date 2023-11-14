<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ringba_insertion_orders', function (Blueprint $table) {
            $table->id();
            $table->string('io_no');
            $table->string('campaign_id');
            $table->string('customer_id')->nullable();
            $table->string('affiliate_id')->nullable();
            $table->string('phone');
            $table->string('order_type')->nullable();
            $table->string('term')->nullable();
            $table->string('payout')->nullable();
            $table->string('revenue')->nullable();
            $table->string('call_length')->nullable();
            $table->string('io_for');
            $table->string('io_link');
            $table->enum('status', ['pending', 'accepted', 'declined', 'canceled'])->default('pending');
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
        Schema::dropIfExists('ringba_insertion_orders');
    }
};
