<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Phase 2C: per-spot cash buy schedule on an IO. Recurrence expanded at save time.
// Uniqueness on (date, time, affiliate) within the same IO is enforced here; cross-IO
// uniqueness against active (sent/accepted) IOs is checked in the controller.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insertion_order_cash_buy_spots', function (Blueprint $t) {
            $t->id();
            $t->foreignId('insertion_order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('affiliate_id')->constrained('affiliates')->cascadeOnDelete();
            $t->date('spot_date');
            $t->time('spot_time');
            $t->string('day_of_week', 9);
            $t->string('time_zone', 8);
            $t->decimal('amount', 12, 2);
            $t->decimal('affiliate_payout', 12, 2)->nullable();
            $t->timestamps();

            $t->unique(['insertion_order_id', 'affiliate_id', 'spot_date', 'spot_time'], 'io_cashbuy_uq');
            $t->index(['spot_date', 'spot_time', 'affiliate_id'], 'io_cashbuy_slot_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insertion_order_cash_buy_spots');
    }
};
