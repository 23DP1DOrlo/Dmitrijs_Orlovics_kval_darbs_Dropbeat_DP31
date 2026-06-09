<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $query = mb_strtolower(trim($request->string('query')->toString()));
        $pattern = "%{$query}%";

        return User::query()
            ->when($query !== '', function ($builder) use ($pattern) {
                $builder->where(function ($inner) use ($pattern) {
                    $inner->whereRaw('LOWER(name) LIKE ?', [$pattern])
                        ->orWhereHas('artist', function ($artistQuery) use ($pattern) {
                            $artistQuery
                                ->whereRaw('LOWER(stage_name) LIKE ?', [$pattern])
                                ->orWhereHas('user', fn ($userQuery) => $userQuery->whereRaw('LOWER(name) LIKE ?', [$pattern]));
                        });
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
            return response()->json(['message' => 'Admins nevar dzēst pats sevi.'], 422);
        }

        $user->delete();
        return response()->json([], 204);
    }

    public function destroyArtistAvatar(Request $request, Artist $artist)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $profile = ArtistProfile::firstWhere('artist_id', $artist->id);
        if (! $profile || ! $profile->avatar_url) {
            return response()->json(['message' => 'Avatar nav atrasts.'], 404);
        }

        $path = parse_url((string) $profile->avatar_url, PHP_URL_PATH) ?: '';
        if (str_starts_with($path, '/storage/')) {
            Storage::disk('public')->delete(substr($path, strlen('/storage/')));
        }

        $profile->update(['avatar_url' => null]);

        return response()->json(['message' => 'Avatars dzēsts.']);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Pieeja tikai administratoram.'], 403);
        }

        return null;
    }
}
