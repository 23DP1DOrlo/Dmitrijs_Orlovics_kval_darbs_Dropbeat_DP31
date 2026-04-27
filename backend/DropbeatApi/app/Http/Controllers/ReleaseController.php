<?php

namespace App\Http\Controllers;

use App\Models\Release;
use App\Models\ReleaseComment;
use App\Models\ReleaseRating;
use App\Models\ReleaseStat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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

        $query = Release::query()
            ->with(['artist', 'artists', 'genre', 'stats'])
            ->withCount('ratings')
            ->withCount('comments')
            ->withAvg('ratings as avg_rhymes_images', 'rhymes_images')
            ->withAvg('ratings as avg_structure_rhythm', 'structure_rhythm')
            ->withAvg('ratings as avg_style_execution', 'style_execution')
            ->withAvg('ratings as avg_individuality_charisma', 'individuality_charisma');

        if ($request->user()?->role === 'listener') {
            $listenerId = $request->user()->id;
            $query->withExists(['ratings as has_user_rated' => fn ($q) => $q->where('user_id', $listenerId)]);
        }

        if (! empty($validated['q'])) {
            $term = $validated['q'];
            $query->where(function ($subQuery) use ($term) {
                $subQuery
                    ->where('title', 'like', "%{$term}%")
                    ->orWhereHas('artist', fn ($artistQuery) => $artistQuery->where('stage_name', 'like', "%{$term}%"))
                    ->orWhereHas('artists', fn ($artistQuery) => $artistQuery->where('stage_name', 'like', "%{$term}%"))
                    ->orWhereHas('genre', fn ($genreQuery) => $genreQuery->where('name', 'like', "%{$term}%"));
            });
        }

        $query
            ->when(isset($validated['genre_id']), fn ($q) => $q->where('genre_id', $validated['genre_id']))
            ->when(isset($validated['artist_id']), fn ($q) => $q->where(function ($artistQuery) use ($validated) {
                $artistQuery
                    ->where('artist_id', $validated['artist_id'])
                    ->orWhereHas('artists', fn ($q) => $q->where('artists.id', $validated['artist_id']));
            }))
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
            'genre_id' => ['required', 'exists:genres,id'],
            'custom_genre_name' => ['nullable', 'string', 'max:60'],
            'title' => ['required', 'string', 'min:2', 'max:150'],
            'release_date' => ['required', 'date'],
            'type' => ['required', 'in:single,ep,album'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cover_url' => ['required', 'url'],
            'duration_seconds' => ['nullable', 'integer', 'min:30', 'max:86400'],
            'is_published' => ['boolean'],
            'artist_ids' => ['nullable', 'array', 'min:1', 'max:7'],
            'artist_ids.*' => ['integer', 'distinct', Rule::exists('artists', 'id')],
        ]);

        $artist = $request->user()?->artist;
        if (! $artist && $request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Relizi var pievienot tikai makslinieks vai administrators.'], Response::HTTP_FORBIDDEN);
        }

        $artistIds = $this->resolveArtistIds($request, $artist?->id);
        $validated['artist_id'] = $artistIds[0] ?? $artist?->id ?? $request->integer('artist_id');
        $validated['custom_genre_name'] = isset($validated['custom_genre_name']) ? trim($validated['custom_genre_name']) : null;
        // For pgsql + pooler setups, force boolean literal to avoid integer binding (1/0) mismatch.
        $validated['is_published'] = $request->boolean('is_published') ? 'true' : 'false';

        unset($validated['artist_ids']);

        return DB::transaction(function () use ($validated, $artistIds) {
            $release = Release::create($validated);
            $this->syncReleaseArtists($release, $artistIds);

            return response()->json(
                $release->fresh()->load(['artist', 'artists', 'genre'])->loadCount('ratings'),
                201
            );
        });
    }

    public function show(Release $release)
    {
        $release->load([
            'artist.profile',
            'artists.profile',
            'genre',
            'stats',
            'comments' => fn ($q) => $q->latest(),
            'comments.user:id,name',
        ])
            ->loadCount('ratings')
            ->loadAvg('ratings as avg_rhymes_images', 'rhymes_images')
            ->loadAvg('ratings as avg_structure_rhythm', 'structure_rhythm')
            ->loadAvg('ratings as avg_style_execution', 'style_execution')
            ->loadAvg('ratings as avg_individuality_charisma', 'individuality_charisma');

        $user = request()->user();
        if ($user?->role === 'listener') {
            $hasRated = ReleaseRating::where('release_id', $release->id)
                ->where('user_id', $user->id)
                ->exists();
            $hasCommented = ReleaseComment::where('release_id', $release->id)
                ->where('user_id', $user->id)
                ->exists();
            $release->setAttribute('has_user_rated', $hasRated);
            $release->setAttribute('has_user_commented', $hasCommented);
        }

        return $release
            ;
    }

    public function update(Request $request, Release $release)
    {
        if (! $this->canManageRelease($request, $release)) {
            return response()->json(['message' => 'Nav tiesibu rediget so relizi.'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'genre_id' => ['sometimes', 'exists:genres,id'],
            'custom_genre_name' => ['nullable', 'string', 'max:60'],
            'title' => ['sometimes', 'string', 'min:2', 'max:150'],
            'release_date' => ['sometimes', 'date'],
            'type' => ['sometimes', 'in:single,ep,album'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cover_url' => ['sometimes', 'url'],
            'duration_seconds' => ['nullable', 'integer', 'min:30', 'max:86400'],
            'is_published' => ['boolean'],
            'artist_ids' => ['sometimes', 'array', 'min:1', 'max:7'],
            'artist_ids.*' => ['integer', 'distinct', Rule::exists('artists', 'id')],
        ]);

        unset($validated['artist_id']);
        if (! array_key_exists('cover_url', $validated)) {
            $validated['cover_url'] = $release->cover_url;
        }
        if (array_key_exists('custom_genre_name', $validated)) {
            $validated['custom_genre_name'] = trim((string) $validated['custom_genre_name']) ?: null;
        }
        if (array_key_exists('is_published', $validated)) {
            $validated['is_published'] = $request->boolean('is_published') ? 'true' : 'false';
        }
        $artistIds = null;
        if ($request->has('artist_ids')) {
            $artistIds = $this->resolveArtistIds($request);
            $validated['artist_id'] = $artistIds[0];
        }

        unset($validated['artist_ids']);

        DB::transaction(function () use ($release, $validated, $artistIds) {
            $release->update($validated);

            if (is_array($artistIds)) {
                $this->syncReleaseArtists($release, $artistIds);
            }
        });

        return $release->fresh()->load(['artist', 'artists', 'genre']);
    }

    public function destroy(Release $release)
    {
        if (! $this->canManageRelease(request(), $release)) {
            return response()->json(['message' => 'Nav tiesibu dzest so relizi.'], Response::HTTP_FORBIDDEN);
        }

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

    public function statsOverview()
    {
        $totals = [
            'releases' => Release::count(),
            'users' => User::count(),
            'comments' => ReleaseComment::count(),
            'ratings' => ReleaseRating::count(),
            'streams' => (int) ReleaseStat::sum('stream_count'),
            'likes' => (int) ReleaseStat::sum('like_count'),
            'shares' => (int) ReleaseStat::sum('share_count'),
        ];

        $topUsers = User::query()
            ->withCount('releaseComments')
            ->withCount('releaseRatings')
            ->orderByDesc('release_comments_count')
            ->orderByDesc('release_ratings_count')
            ->limit(8)
            ->get(['id', 'name', 'email', 'role']);

        return response()->json([
            'totals' => $totals,
            'top_users' => $topUsers,
        ]);
    }

    public function rate(Request $request, Release $release)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'listener') {
            return response()->json(['message' => 'Vertet var tikai klausitajs.'], Response::HTTP_FORBIDDEN);
        }

        $alreadyRated = ReleaseRating::where('release_id', $release->id)
            ->where('user_id', $user->id)
            ->exists();
        if ($alreadyRated) {
            return response()->json(['message' => 'Tu jau noverteji so relizi.'], Response::HTTP_CONFLICT);
        }

        $validated = $request->validate([
            'rhymes_images' => ['required', 'integer', 'between:1,10'],
            'structure_rhythm' => ['required', 'integer', 'between:1,10'],
            'style_execution' => ['required', 'integer', 'between:1,10'],
            'individuality_charisma' => ['required', 'integer', 'between:1,10'],
        ]);

        $rating = ReleaseRating::create([
            'release_id' => $release->id,
            'user_id' => $user->id,
            ...$validated,
        ]);

        return response()->json($rating, 201);
    }

    public function comment(Request $request, Release $release)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'listener') {
            return response()->json(['message' => 'Komentet var tikai klausitajs.'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'comment' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $comment = ReleaseComment::create([
            'release_id' => $release->id,
            'user_id' => $user->id,
            'comment' => $validated['comment'],
        ]);

        return response()->json($comment->load('user:id,name'), 201);
    }

    public function submitFeedback(Request $request, Release $release)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'listener') {
            return response()->json(['message' => 'Vertet un komentet var tikai klausitajs.'], Response::HTTP_FORBIDDEN);
        }

        $alreadyRated = ReleaseRating::where('release_id', $release->id)
            ->where('user_id', $user->id)
            ->exists();
        $alreadyCommented = ReleaseComment::where('release_id', $release->id)
            ->where('user_id', $user->id)
            ->exists();
        if ($alreadyRated || $alreadyCommented) {
            return response()->json(['message' => 'Tu jau atstaji novertejumu un/vai komentaru sim relizam.'], Response::HTTP_CONFLICT);
        }

        $validated = $request->validate([
            'rhymes_images' => ['required', 'integer', 'between:1,10'],
            'structure_rhythm' => ['required', 'integer', 'between:1,10'],
            'style_execution' => ['required', 'integer', 'between:1,10'],
            'individuality_charisma' => ['required', 'integer', 'between:1,10'],
            'comment' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        DB::transaction(function () use ($release, $user, $validated) {
            ReleaseRating::create([
                'release_id' => $release->id,
                'user_id' => $user->id,
                'rhymes_images' => $validated['rhymes_images'],
                'structure_rhythm' => $validated['structure_rhythm'],
                'style_execution' => $validated['style_execution'],
                'individuality_charisma' => $validated['individuality_charisma'],
            ]);

            ReleaseComment::create([
                'release_id' => $release->id,
                'user_id' => $user->id,
                'comment' => $validated['comment'],
            ]);
        });

        return response()->json(['message' => 'Novertejums un komentars saglabati.'], 201);
    }

    public function uploadCover(Request $request)
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['artist', 'admin'], true)) {
            return response()->json(['message' => 'Oblozku var augshupladet tikai makslinieks vai administrators.'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'cover' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $path = $validated['cover']->store('covers', 'public');
        $publicPath = Storage::url($path);

        return response()->json([
            // Build URL from current request host to avoid APP_URL mismatch (e.g. localhost:80).
            'cover_url' => $request->getSchemeAndHttpHost().$publicPath,
        ], 201);
    }

    private function canManageRelease(Request $request, Release $release): bool
    {
        $user = $request->user();
        if (! $user) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        return $release->artists()
            ->where('artists.id', $user->artist?->id)
            ->exists();
    }

    private function resolveArtistIds(Request $request, ?int $fallbackArtistId = null): array
    {
        $artistIds = $request->input('artist_ids');

        if (is_array($artistIds) && ! empty($artistIds)) {
            return array_values(array_map('intval', $artistIds));
        }

        if ($fallbackArtistId) {
            return [$fallbackArtistId];
        }

        $artistId = $request->integer('artist_id');
        if ($artistId) {
            return [$artistId];
        }

        throw ValidationException::withMessages([
            'artist_ids' => ['Janonorada vismaz viens makslinieks.'],
        ]);
    }

    private function syncReleaseArtists(Release $release, array $artistIds): void
    {
        $artistIds = array_values(array_unique(array_map('intval', $artistIds)));

        $syncPayload = [];
        foreach ($artistIds as $index => $artistId) {
            $syncPayload[$artistId] = [
                'is_primary' => $index === 0 ? 'true' : 'false',
                'credit_order' => $index + 1,
            ];
        }

        $release->artists()->sync($syncPayload);
    }
}
