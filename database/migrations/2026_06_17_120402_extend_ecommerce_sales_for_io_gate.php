<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Phase 2G: hook sales rows to the IO that authorized them + add ZERO_CALL record kind
// + denorm zero_call_date for the one-per-ANI-per-day dedup query.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE ecommerce_sales MODIFY record_kind ENUM('SALE','RETURN','ZERO_CALL') DEFAULT 'SALE'");

        Schema::table('ecommerce_sales', function (Blueprint $t) {
            $t->foreignId('insertion_order_id')->nullable()->after('campaign_id')
                ->constrained('insertion_orders')->nullOnDelete();
            $t->date('zero_call_date')->nullable()->after('record_kind');
            $t->index(['ani', 'zero_call_date', 'customer_id'], 'ecsale_zero_dedup_idx');
        });
    }

    public function down(): void
    {
        Schema::table('ecommerce_sales', function (Blueprint $t) {
            $t->dropIndex('ecsale_zero_dedup_idx');
            $t->dropForeign(['insertion_order_id']);
            $t->dropColumn(['insertion_order_id', 'zero_call_date']);
        });

        DB::statement("ALTER TABLE ecommerce_sales MODIFY record_kind ENUM('SALE','RETURN') DEFAULT 'SALE'");
    }
};
