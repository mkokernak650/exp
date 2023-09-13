<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        Schema::table('insertion_orders', function (Blueprint $table) {
            DB::statement("ALTER TABLE insertion_orders MODIFY status ENUM('pending', 'accepted', 'declined', 'canceled') DEFAULT 'pending'");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('insertion_orders', function (Blueprint $table) {
            DB::statement("ALTER TABLE insertion_orders MODIFY status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending'");
        });
    }
};
