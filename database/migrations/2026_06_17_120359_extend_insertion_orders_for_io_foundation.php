<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Phase 2A: extend insertion_orders with status state machine + dual-approval timestamps
// + token-link auth + corp ref. Existing status values preserved; three new states added.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE insertion_orders MODIFY status ENUM(
            'draft','pending','sent','accepted','declined','void','canceled'
        ) DEFAULT 'draft'");

        Schema::table('insertion_orders', function (Blueprint $table) {
            $table->timestamp('customer_accepted_at')->nullable()->after('status');
            $table->timestamp('affiliate_accepted_at')->nullable()->after('customer_accepted_at');
            $table->unsignedBigInteger('customer_accepted_by_user_id')->nullable()->after('affiliate_accepted_at');
            $table->unsignedBigInteger('affiliate_accepted_by_user_id')->nullable()->after('customer_accepted_by_user_id');

            $table->timestamp('sent_at')->nullable()->after('affiliate_accepted_by_user_id');
            $table->timestamp('accepted_at')->nullable()->after('sent_at');
            $table->timestamp('cancellation_requested_at')->nullable()->after('accepted_at');
            $table->timestamp('canceled_at')->nullable()->after('cancellation_requested_at');

            $table->char('customer_token', 40)->nullable()->after('canceled_at');
            $table->char('affiliate_token', 40)->nullable()->after('customer_token');

            $table->string('corporation_type')->nullable()->after('affiliate_token');
            $table->unsignedBigInteger('corporation_id')->nullable()->after('corporation_type');

            $table->index('status', 'insertion_orders_status_idx');
            $table->index('accepted_at', 'insertion_orders_accepted_at_idx');
            $table->index('canceled_at', 'insertion_orders_canceled_at_idx');
            $table->index(['corporation_type', 'corporation_id'], 'insertion_orders_corp_idx');
        });
    }

    public function down(): void
    {
        Schema::table('insertion_orders', function (Blueprint $table) {
            $table->dropIndex('insertion_orders_status_idx');
            $table->dropIndex('insertion_orders_accepted_at_idx');
            $table->dropIndex('insertion_orders_canceled_at_idx');
            $table->dropIndex('insertion_orders_corp_idx');

            $table->dropColumn([
                'customer_accepted_at',
                'affiliate_accepted_at',
                'customer_accepted_by_user_id',
                'affiliate_accepted_by_user_id',
                'sent_at',
                'accepted_at',
                'cancellation_requested_at',
                'canceled_at',
                'customer_token',
                'affiliate_token',
                'corporation_type',
                'corporation_id',
            ]);
        });

        DB::statement("ALTER TABLE insertion_orders MODIFY status ENUM('pending', 'accepted', 'declined', 'canceled') DEFAULT 'pending'");
    }
};
