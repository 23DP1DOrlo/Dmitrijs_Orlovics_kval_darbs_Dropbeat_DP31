<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\Release;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ArtistController extends Controller
{
    public function index()
    {
        return Artist::with(['profile', 'user'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id', 'unique:artists,user_id'],
            'stage_name' => ['required', 'string', 'min:2', 'max:120'],
            'country' => ['nullable', 'string', 'size:2'],
            'is_verified' => ['boolean'],
        ]);

        return response()->json(Artist::create($validated), 201);
    }

    /**
     * Public artist page: published releases (primary or featured) and aggregate audience score.
     */
    public function publicProfile(Artist $artist)
    {
        $artist->load('profile');

        $pivotReleaseIds = DB::table('release_artists')
            ->where('artist_id', $artist->id)
            ->pluck('release_id')
            ->unique()
            ->values()
            ->all();

        $releases = Release::query()
            ->whereIsPublished(true)
            ->where(function ($query) use ($artist, $pivotReleaseIds) {
                $query->where('artist_id', $artist->id);
                if ($pivotReleaseIds !== []) {
                    $query->orWhereIn('id', $pivotReleaseIds);
                }
            })
            ->with(['genre', 'artist', 'artists'])
            ->withCount('ratings')
            ->withAvg('ratings as avg_rhymes_images', 'rhymes_images')
            ->withAvg('ratings as avg_structure_rhythm', 'structure_rhythm')
            ->withAvg('ratings as avg_style_execution', 'style_execution')
            ->withAvg('ratings as avg_individuality_charisma', 'individuality_charisma')
            ->orderByDesc('release_date')
            ->get();

        $composites = [];
        foreach ($releases as $release) {
            if (($release->ratings_count ?? 0) < 1) {
                continue;
            }
            $composites[] = (
                (float) ($release->avg_rhymes_images ?? 0)
                + (float) ($release->avg_structure_rhythm ?? 0)
                + (float) ($release->avg_style_execution ?? 0)
                + (float) ($release->avg_individuality_charisma ?? 0)
            ) / 4;
        }

        $ratedCount = count($composites);
        $averageComposite = $ratedCount > 0 ? round(array_sum($composites) / $ratedCount, 2) : null;

        return response()->json([
            'id' => $artist->id,
            'stage_name' => $artist->stage_name,
            'country' => $artist->country,
            'is_verified' => (bool) $artist->is_verified,
            'profile' => $artist->profile,
            'releases' => $releases,
            'stats' => [
                'published_releases_count' => $releases->count(),
                'rated_releases_count' => $ratedCount,
                'average_composite_score' => $averageComposite,
            ],
        ]);
    }

    public function update(Request $request, Artist $artist)
    {
        $validated = $request->validate([
            'stage_name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'country' => ['nullable', 'string', 'size:2'],
            'is_verified' => ['boolean'],
            'user_id' => ['sometimes', 'exists:users,id', Rule::unique('artists', 'user_id')->ignore($artist->id)],
        ]);

        $artist->update($validated);
        return $artist->fresh()->load(['profile', 'user']);
    }

    public function destroy(Artist $artist)
    {
        $artist->delete();
        return response()->json([], 204);
    }

    public function myProfile(Request $request)
    {
        $artist = Artist::with('profile')->where('user_id', $request->user()->id)->first();

        if (! $artist) {
            return response()->json(['message' => 'Makslinieka profils nav atrasts'], 404);
        }

        return $artist;
    }

    public function updateMyProfile(Request $request)
    {
        $artist = Artist::firstWhere('user_id', $request->user()->id);

        if (! $artist) {
            return response()->json(['message' => 'Makslinieka profils nav atrasts'], 404);
        }

        $validated = $request->validate([
            'stage_name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'country' => ['nullable', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:100'],
            'label_name' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1200'],
            'instagram_url' => ['nullable', 'url'],
            'youtube_url' => ['nullable', 'url'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
        ]);

        $artist->update([
            'stage_name' => $validated['stage_name'] ?? $artist->stage_name,
            'country' => $validated['country'] ?? $artist->country,
        ]);

        ArtistProfile::updateOrCreate(
            ['artist_id' => $artist->id],
            [
                'city' => $validated['city'] ?? null,
                'label_name' => $validated['label_name'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'instagram_url' => $validated['instagram_url'] ?? null,
                'youtube_url' => $validated['youtube_url'] ?? null,
                'avatar_url' => $validated['avatar_url'] ?? null,
            ]
        );

        return $artist->fresh()->load('profile');
    }

    public function uploadMyAvatar(Request $request)
    {
        $artist = Artist::firstWhere('user_id', $request->user()->id);
        if (! $artist) {
            return response()->json(['message' => 'Makslinieka profils nav atrasts'], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $path = $validated['avatar']->store('avatars', 'public');
        $avatarUrl = $request->getSchemeAndHttpHost().Storage::url($path);

        ArtistProfile::updateOrCreate(
            ['artist_id' => $artist->id],
            ['avatar_url' => $avatarUrl]
        );

        return response()->json([
            'avatar_url' => $avatarUrl,
        ], 201);
    }
}
