<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('release_stats', function (Blueprint $table) {
            $table->id();
            // Keep portable across DBs where migration order can differ.
            $table->foreignId('release_id');
            $table->unsignedBigInteger('stream_count')->default(0);
            $table->unsignedBigInteger('like_count')->default(0);
            $table->unsignedBigInteger('share_count')->default(0);
            $table->date('stat_date');
            $table->timestamps();
            $table->unique(['release_id', 'stat_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('release_stats');
    }
};
