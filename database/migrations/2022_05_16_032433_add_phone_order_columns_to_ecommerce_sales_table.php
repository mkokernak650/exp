<?php

use App\Models\EcommerceSale;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPhoneOrderColumnsToEcommerceSalesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ecommerce_sales', function (Blueprint $table) {
            $table->after('id', function ($table) {
                $table->foreignId('campaign_id')->nullable()->constrained('ecommerce_campaigns')->nullOnDelete();
                $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
                $table->tinyInteger('order_type')->default(EcommerceSale::ORDER_TYPE['e-commerce']);
            });
            $table->after('user_ip', function ($table) {
                $table->string('dialed')->nullable();
                $table->string('inbound')->nullable();
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
        Schema::table('ecommerce_sales', function (Blueprint $table) {
            $table->dropForeign(['campaign_id']);
            $table->dropForeign(['customer_id']);
            $table->dropColumn([
                'campaign_id',
                'customer_id',
                'order_type',
                'dialed',
                'inbound'
            ]);
        });
    }
}
