<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('releases')
            ->select(['id', 'is_published'])
            ->orderBy('id')
            ->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('releases')
                        ->where('id', $row->id)
                        ->update([
                            'is_published' => $this->normalizeBooleanValue($row->is_published),
                        ]);
                }
            });

        DB::table('release_artists')
            ->select(['id', 'is_primary'])
            ->orderBy('id')
            ->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('release_artists')
                        ->where('id', $row->id)
                        ->update([
                            'is_primary' => $this->normalizeBooleanValue($row->is_primary),
                        ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty because this is a data normalization migration.
    }

    private function normalizeBooleanValue(mixed $value): bool
    {
        $normalized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        if ($normalized !== null) {
            return $normalized;
        }

        return (bool) $value;
    }
};
