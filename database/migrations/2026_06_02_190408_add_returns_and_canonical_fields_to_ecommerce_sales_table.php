<?php

use App\Models\EcommerceSale;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('ecommerce_sales', function (Blueprint $table) {
            $table->string('record_kind', 8)
                ->default(EcommerceSale::RECORD_KIND['SALE'])
                ->after('order_type')
                ->index();

            $table->string('tracking_url')->nullable()->after('coupon_code');
            $table->string('telemarketing_co')->nullable()->after('vendor_code');
            $table->string('isci')->nullable()->after('product_code');
            $table->text('order_description')->nullable()->after('product_code');
            $table->string('ship_country', 8)->nullable()->after('shipping_state');

            $table->decimal('vendor_fee', 12, 4)->nullable()->after('total');
            $table->decimal('consumerexp_fee', 12, 4)->nullable()->after('vendor_fee');

            $table->string('import_hash', 40)->nullable()->after('consumerexp_fee')->index();
        });
    }

    public function down()
    {
        Schema::table('ecommerce_sales', function (Blueprint $table) {
            $table->dropIndex(['record_kind']);
            $table->dropIndex(['import_hash']);
            $table->dropColumn([
                'record_kind',
                'tracking_url',
                'telemarketing_co',
                'isci',
                'order_description',
                'ship_country',
                'vendor_fee',
                'consumerexp_fee',
                'import_hash',
            ]);
        });
    }
};
