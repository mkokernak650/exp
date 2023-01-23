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
            $table->tinyInteger('affiliate_fee_type')->after('revenue');
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
            $table->dropColumn('affiliate_fee_type');
        });
    }
};
