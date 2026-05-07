<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $query = $request->string('query')->toString();

        return User::query()
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where('name', 'like', "%{$query}%")
                    ->orWhereHas('artist', function ($artistQuery) use ($query) {
                        $artistQuery->where('stage_name', 'like', "%{$query}%");
                    });
            })
            ->with('artist.profile')
            ->orderByDesc('id')
            ->paginate(20);
    }

    public function show(Request $request, User $user)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        return $user->load('artist.profile');
    }

    public function update(Request $request, User $user)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', 'in:admin,artist,listener'],
            'stage_name' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:100'],
            'label_name' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1200'],
            'instagram_url' => ['nullable', 'url'],
            'youtube_url' => ['nullable', 'url'],
        ]);

        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'role' => $validated['role'] ?? $user->role,
        ]);

        if ($user->role === 'artist') {
            $artist = Artist::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'stage_name' => $validated['stage_name'] ?? $user->name,
                    'country' => $validated['country'] ?? null,
                ]
            );

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
        }

        return $user->fresh()->load('artist.profile');
    }

    public function destroy(Request $request, User $user)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Admin nevar dzest pats sevi.'], 422);
        }

        $user->delete();
        return response()->json([], 204);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Pieeja tikai administratoram.'], 403);
        }

        return null;
    }
}
