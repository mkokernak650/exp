<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnToAffiliateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->tinyInteger('status')->default(1); // active => 1 and inactive 0
            $table->string('email')->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('address')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->dropColumn('address');
            $table->dropColumn('telephone');
            $table->dropColumn('email');
        });
    }
}
