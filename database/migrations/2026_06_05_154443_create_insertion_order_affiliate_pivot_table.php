<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pivot for the affiliates the user explicitly attached to an IO at create-time.
 * Lets the IO list show "covers stations A, B, C" even for customer-mode IOs that
 * historically only stored a customer_id.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::create('insertion_order_affiliate', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insertion_order_id')->constrained('insertion_orders')->cascadeOnDelete();
            $table->foreignId('affiliate_id')->constrained('affiliates')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['insertion_order_id', 'affiliate_id'], 'io_affiliate_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('insertion_order_affiliate');
    }
};
