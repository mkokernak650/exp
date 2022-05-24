<?php

use App\Models\EcommerceSale;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPhoneOrderColumnsToEcommerceAffiliatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ecommerce_affiliates', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->change();
            $table->tinyInteger('order_type')->default(EcommerceSale::ORDER_TYPE['e-commerce'])->after('id');
            $table->string('dialed')->nullable()->after('coupon_code');
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
            $table->string('coupon_code')->nullable(false)->change();
            $table->dropColumn([
                'order_type',
                'dialed',
            ]);
        });
    }
}
