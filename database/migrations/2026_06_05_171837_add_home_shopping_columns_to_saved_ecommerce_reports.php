<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Extends saved_ecommerce_reports so it can also serve the Home Shopping report:
 *   - report_for          distinguishes ecommerce vs home_shopping saved reports
 *   - recurrence_frequency null/weekly/monthly auto-email schedule
 *   - recipients          json list of emails to send the auto-email to
 *   - last_emailed_at     timestamp of the last successful auto-email
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_ecommerce_reports', function (Blueprint $table) {
            $table->string('report_for', 32)->default('ecommerce')->after('name')->index();
            $table->string('recurrence_frequency', 16)->nullable()->after('last_generated_at');
            $table->json('recipients')->nullable()->after('recurrence_frequency');
            $table->timestamp('last_emailed_at')->nullable()->after('recipients');
        });
    }

    public function down(): void
    {
        Schema::table('saved_ecommerce_reports', function (Blueprint $table) {
            $table->dropIndex(['report_for']);
            $table->dropColumn(['report_for', 'recurrence_frequency', 'recipients', 'last_emailed_at']);
        });
    }
};
