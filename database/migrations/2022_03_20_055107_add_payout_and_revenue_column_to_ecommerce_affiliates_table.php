<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPayoutAndRevenueColumnToEcommerceAffiliatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ecommerce_affiliates', function (Blueprint $table) {
            $table->after('customer_id', function ($table) {
                $table->boolean('based_on_percentage')->default(0);
                $table->string('payout')->nullable();
                $table->string('revenue')->nullable();
            });
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
            $table->dropColumn('based_on_percentage');
            $table->dropColumn('payout');
            $table->dropColumn('revenue');
        });
    }
}
