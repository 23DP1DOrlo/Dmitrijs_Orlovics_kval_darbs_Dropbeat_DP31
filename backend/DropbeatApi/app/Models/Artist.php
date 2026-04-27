<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['user_id', 'stage_name', 'country', 'is_verified'])]
class Artist extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(ArtistProfile::class);
    }

    public function releases(): HasMany
    {
        return $this->hasMany(Release::class);
    }

    public function collaborativeReleases(): BelongsToMany
    {
        return $this->belongsToMany(Release::class, 'release_artists')
            ->withPivot(['is_primary', 'credit_order'])
            ->withTimestamps();
    }
}
