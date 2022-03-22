<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRevenueToEcommerceAffiliatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ecommerce_affiliates', function (Blueprint $table) {
            $table->string('revenue')->nullable()->after('coupon_code');
            $table->dropUnique(['coupon_code']);
            $table->string('percentage')->nullable()->change();
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
            $table->dropColumn('revenue');
            $table->unique(['coupon_code']);
            $table->string('percentage')->nullable(false)->change();
        });
    }
}
