<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\ArtistProfile;
use Illuminate\Http\Request;
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

    public function show(Artist $artist)
    {
        return $artist->load(['profile', 'user', 'releases.genre']);
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
            ]
        );

        return $artist->fresh()->load('profile');
    }
}
