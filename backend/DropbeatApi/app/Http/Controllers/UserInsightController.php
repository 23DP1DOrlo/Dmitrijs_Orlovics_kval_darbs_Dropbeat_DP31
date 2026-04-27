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
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->with('artist:id,user_id,stage_name')
            ->withCount('releaseComments')
            ->withCount('releaseRatings')
            ->orderByDesc('release_comments_count')
            ->limit(20)
            ->get(['id', 'name', 'email', 'role']);

        return $users;
    }

    public function commentsByUser(User $user)
    {
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
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'comment_count' => $comments->count(),
            'comments' => $comments,
            'rating_count' => $ratings->count(),
            'ratings' => $ratings,
        ]);
    }
}
