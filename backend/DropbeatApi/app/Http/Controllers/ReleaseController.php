<?php

namespace App\Http\Controllers;

use App\Models\Release;
use App\Models\ReleaseStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReleaseController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'genre_id' => ['nullable', 'integer', 'exists:genres,id'],
            'artist_id' => ['nullable', 'integer', 'exists:artists,id'],
            'type' => ['nullable', 'in:single,ep,album'],
            'published' => ['nullable', 'boolean'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date'],
            'sort_by' => ['nullable', 'in:title,release_date,created_at'],
            'sort_dir' => ['nullable', 'in:asc,desc'],
        ]);

        $query = Release::query()->with(['artist', 'genre', 'stats']);

        if (! empty($validated['q'])) {
            $term = $validated['q'];
            $query->where(function ($subQuery) use ($term) {
                $subQuery
                    ->where('title', 'like', "%{$term}%")
                    ->orWhereHas('artist', fn ($artistQuery) => $artistQuery->where('stage_name', 'like', "%{$term}%"))
                    ->orWhereHas('genre', fn ($genreQuery) => $genreQuery->where('name', 'like', "%{$term}%"));
            });
        }

        $query
            ->when(isset($validated['genre_id']), fn ($q) => $q->where('genre_id', $validated['genre_id']))
            ->when(isset($validated['artist_id']), fn ($q) => $q->where('artist_id', $validated['artist_id']))
            ->when(isset($validated['type']), fn ($q) => $q->where('type', $validated['type']))
            ->when(isset($validated['published']), fn ($q) => $q->where('is_published', $validated['published']))
            ->when(isset($validated['from_date']), fn ($q) => $q->whereDate('release_date', '>=', $validated['from_date']))
            ->when(isset($validated['to_date']), fn ($q) => $q->whereDate('release_date', '<=', $validated['to_date']));

        $sortBy = $validated['sort_by'] ?? 'release_date';
        $sortDir = $validated['sort_dir'] ?? 'desc';

        return $query->orderBy($sortBy, $sortDir)->paginate(12);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'artist_id' => ['required', 'exists:artists,id'],
            'genre_id' => ['required', 'exists:genres,id'],
            'title' => ['required', 'string', 'min:2', 'max:150'],
            'release_date' => ['required', 'date'],
            'type' => ['required', 'in:single,ep,album'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cover_url' => ['nullable', 'url'],
            'duration_seconds' => ['nullable', 'integer', 'min:30', 'max:7200'],
            'is_published' => ['boolean'],
        ]);

        return response()->json(Release::create($validated)->load(['artist', 'genre']), 201);
    }

    public function show(Release $release)
    {
        return $release->load(['artist.profile', 'genre', 'stats']);
    }

    public function update(Request $request, Release $release)
    {
        $validated = $request->validate([
            'artist_id' => ['sometimes', 'exists:artists,id'],
            'genre_id' => ['sometimes', 'exists:genres,id'],
            'title' => ['sometimes', 'string', 'min:2', 'max:150'],
            'release_date' => ['sometimes', 'date'],
            'type' => ['sometimes', 'in:single,ep,album'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cover_url' => ['nullable', 'url'],
            'duration_seconds' => ['nullable', 'integer', 'min:30', 'max:7200'],
            'is_published' => ['boolean'],
        ]);

        $release->update($validated);
        return $release->fresh()->load(['artist', 'genre']);
    }

    public function destroy(Release $release)
    {
        $release->delete();
        return response()->json([], 204);
    }

    public function storeStats(Request $request, Release $release)
    {
        $validated = $request->validate([
            'stat_date' => ['required', 'date'],
            'stream_count' => ['required', 'integer', 'min:0'],
            'like_count' => ['required', 'integer', 'min:0'],
            'share_count' => ['required', 'integer', 'min:0'],
        ]);

        $stats = ReleaseStat::updateOrCreate(
            ['release_id' => $release->id, 'stat_date' => $validated['stat_date']],
            $validated
        );

        return response()->json($stats, 201);
    }

    public function statsSummary()
    {
        $summary = DB::table('release_stats')
            ->join('releases', 'release_stats.release_id', '=', 'releases.id')
            ->join('genres', 'releases.genre_id', '=', 'genres.id')
            ->select(
                'genres.name as genre',
                DB::raw('SUM(release_stats.stream_count) as total_streams'),
                DB::raw('SUM(release_stats.like_count) as total_likes'),
                DB::raw('COUNT(DISTINCT releases.id) as release_count')
            )
            ->groupBy('genres.name')
            ->orderByDesc('total_streams')
            ->get();

        return response()->json($summary);
    }
}
