<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOwnershipFieldsToAffiliatesTable extends Migration
{
    public function up()
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->string('ownership_type')->nullable()->after('affiliate_name');
            $table->string('ownership_name')->nullable()->after('ownership_type');
        });
    }

    public function down()
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->dropColumn(['ownership_type', 'ownership_name']);
        });
    }
}
