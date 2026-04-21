<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('release_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('release_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rhymes_images');
            $table->unsignedTinyInteger('structure_rhythm');
            $table->unsignedTinyInteger('style_execution');
            $table->unsignedTinyInteger('individuality_charisma');
            $table->timestamps();

            $table->unique(['release_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('release_ratings');
    }
};
