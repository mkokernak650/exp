<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Polymorphic many-to-many between affiliates and the three corporation tables:
 * broadcast_group_names, mso_names, network_names.
 *
 * corporationable_type stores the model FQCN (e.g. "App\Models\BroadcastGroupName"),
 * so Laravel's morphedByMany works directly.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::create('affiliate_corporation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained('affiliates')->cascadeOnDelete();
            $table->string('corporationable_type');
            $table->unsignedBigInteger('corporationable_id');
            $table->timestamps();

            $table->index(['corporationable_type', 'corporationable_id'], 'affiliate_corp_morph_idx');
            $table->unique(
                ['affiliate_id', 'corporationable_type', 'corporationable_id'],
                'affiliate_corp_unique'
            );
        });
    }

    public function down()
    {
        Schema::dropIfExists('affiliate_corporation');
    }
};
