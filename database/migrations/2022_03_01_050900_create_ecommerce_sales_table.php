<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEcommerceSalesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ecommerce_sales', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->nullable();
            $table->string('coupon_code')->nullable();
            $table->string('user_ip')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_zip')->nullable();
            $table->string('billing_zip')->nullable();
            $table->string('quantity')->nullable();
            $table->string('subtotal')->nullable();
            $table->string('shipping_cost')->nullable();
            $table->string('total')->nullable();
            $table->timestamp('order_at')->nullable();
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
        Schema::dropIfExists('ecommerce_sales');
    }
}
