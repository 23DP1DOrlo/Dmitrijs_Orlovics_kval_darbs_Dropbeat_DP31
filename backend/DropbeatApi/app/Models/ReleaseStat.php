<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['release_id', 'stream_count', 'like_count', 'share_count', 'stat_date'])]
class ReleaseStat extends Model
{
    public function release(): BelongsTo
    {
        return $this->belongsTo(Release::class);
    }
}
