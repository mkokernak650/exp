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
        Schema::table('ecommerce_sales', function (Blueprint $table) {
            $table->string('vendor_code')->nullable()->after('order_at');
            $table->string('product_code')->nullable()->after('vendor_code');
            $table->string('ani')->nullable()->after('product_code');
            $table->string('call_length')->nullable()->after('ani');
            $table->string('payment_type')->nullable()->after('call_length');
            $table->string('r1')->nullable()->after('payment_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('ecommerce_sales', function (Blueprint $table) {
            $table->dropColumn(['vendor_code', 'product_code', 'ani', 'call_length', 'payment_type', 'r1']);
        });
    }
};
