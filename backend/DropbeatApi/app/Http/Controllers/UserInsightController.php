<?php

namespace App\Http\Controllers;

use App\Models\ReleaseComment;
use App\Models\ReleaseRating;
use App\Models\User;
use Illuminate\Http\Request;

class UserInsightController extends Controller
{
    public function searchComments(Request $request)
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:100'],
        ]);

        $query = $validated['query'] ?? '';

        $users = User::query()
            ->where(function ($inner) use ($query) {
                $inner
                    ->where('name', 'like', "%{$query}%")
                    ->orWhereHas('artist', function ($artistQuery) use ($query) {
                        $artistQuery->where('stage_name', 'like', "%{$query}%");
                    });
            })
            ->with('artist:id,user_id,stage_name')
            ->withCount('releaseComments')
            ->withCount('releaseRatings')
            ->orderByDesc('release_comments_count')
            ->limit(20)
            ->get(['id', 'name', 'role']);

        return $users;
    }

    public function commentsByUser(User $user)
    {
        $user->load('artist:id,user_id,stage_name');

        $comments = ReleaseComment::query()
            ->where('user_id', $user->id)
            ->with(['release:id,title,cover_url,artist_id', 'release.artist:id,stage_name'])
            ->latest()
            ->get();

        $ratings = ReleaseRating::query()
            ->where('user_id', $user->id)
            ->with(['release:id,title,cover_url,artist_id', 'release.artist:id,stage_name'])
            ->latest()
            ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'artist' => $user->artist ? [
                    'id' => $user->artist->id,
                    'stage_name' => $user->artist->stage_name,
                ] : null,
            ],
            'comment_count' => $comments->count(),
            'comments' => $comments,
            'rating_count' => $ratings->count(),
            'ratings' => $ratings,
        ]);
    }
}
