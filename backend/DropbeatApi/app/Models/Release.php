<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'artist_id',
    'genre_id',
    'custom_genre_name',
    'title',
    'release_date',
    'type',
    'description',
    'cover_url',
    'duration_seconds',
    'is_published',
])]
class Release extends Model
{
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function artist(): BelongsTo
    {
        return $this->belongsTo(Artist::class);
    }

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function stats(): HasMany
    {
        return $this->hasMany(ReleaseStat::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(ReleaseRating::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ReleaseComment::class);
    }
}
