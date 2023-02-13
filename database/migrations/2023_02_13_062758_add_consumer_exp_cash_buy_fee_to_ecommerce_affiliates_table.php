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
        Schema::table('ecommerce_affiliates', function (Blueprint $table) {
            $table->float('consumerEXP_cash_buy_fee')->nullable()->after('cash_buy');
            $table->tinyInteger('consumerEXP_cash_buy_fee_type')->nullable()->after('consumerEXP_cash_buy_fee');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('ecommerce_affiliates', function (Blueprint $table) {
            $table->dropColumn(['consumerEXP_cash_buy_fee', 'consumerEXP_cash_buy_fee_type']);
        });
    }
};
