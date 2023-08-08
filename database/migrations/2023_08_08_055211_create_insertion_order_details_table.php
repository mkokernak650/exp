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
        Schema::create('insertion_order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insertion_order_id')->constrained()->cascadeOnDelete();
            $table->string('io_no');
            $table->foreignId('ecommerce_affiliate_id')->constrained()->cascadeOnDelete();
            $table->float('gross_price')->nullable();
            $table->string('term')->nullable();
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
        Schema::dropIfExists('insertion_order_details');
    }
};
