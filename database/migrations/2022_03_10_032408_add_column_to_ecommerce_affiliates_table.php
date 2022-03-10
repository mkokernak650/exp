<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnToEcommerceAffiliatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ecommerce_affiliates', function (Blueprint $table) {
            $table->foreignId('campaign_id')->nullable()->after('id')->constrained();
            $table->foreignId('customer_id')->nullable()->after('affiliate_id')->constrained();
            $table->string('affiliate_fee')->nullable()->after('coupon_code');
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
            $table->dropForeign(['campaign_id']);
            $table->dropForeign(['customer_id']);
            $table->dropColumn('campaign_id');
            $table->dropColumn('customer_id');
            $table->dropColumn('affiliate_fee');
        });
    }
}
