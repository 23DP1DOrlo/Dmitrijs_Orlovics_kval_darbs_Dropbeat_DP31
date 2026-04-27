<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('release_artists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('release_id')->constrained()->cascadeOnDelete();
            $table->foreignId('artist_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->unsignedTinyInteger('credit_order');
            $table->timestamps();

            $table->unique(['release_id', 'artist_id']);
            $table->unique(['release_id', 'credit_order']);
        });

        DB::table('releases')
            ->select(['id', 'artist_id', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->chunkById(200, function ($releases) {
                $rows = [];

                foreach ($releases as $release) {
                    $rows[] = [
                        'release_id' => $release->id,
                        'artist_id' => $release->artist_id,
                        'is_primary' => 'true',
                        'credit_order' => 1,
                        'created_at' => $release->created_at,
                        'updated_at' => $release->updated_at,
                    ];
                }

                if (! empty($rows)) {
                    DB::table('release_artists')->insert($rows);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('release_artists');
    }
};
