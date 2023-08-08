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
        Schema::create('insertion_orders', function (Blueprint $table) {
            $table->id();
            $table->string('io_no');
            $table->foreignId('customer_id')->nullable()->constrained();
            $table->foreignId('affiliate_id')->nullable()->constrained();
            $table->string('io_link');
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
        Schema::dropIfExists('insertion_orders');
    }
};
