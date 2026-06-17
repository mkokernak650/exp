<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Phase 2B: corp contact for single-recipient IO approval flow.
return new class extends Migration
{
    private const TABLES = ['broadcast_group_names', 'mso_names', 'network_names'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('contact_name')->nullable();
                $t->string('contact_title')->nullable();
                $t->string('contact_email')->nullable();
                $t->text('contact_address')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn(['contact_name', 'contact_title', 'contact_email', 'contact_address']);
            });
        }
    }
};
