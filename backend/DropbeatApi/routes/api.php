<?php

use App\Http\Controllers\ArtistController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\ReleaseController;
use App\Http\Controllers\UserInsightController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/releases', [ReleaseController::class, 'index']);
Route::get('/releases/{release}', [ReleaseController::class, 'show']);
Route::get('/artists/{artist}', [ArtistController::class, 'publicProfile']);
Route::get('/stats/genres', [ReleaseController::class, 'statsSummary']);
Route::get('/stats/overview', [ReleaseController::class, 'statsOverview']);
Route::get('/genres', [GenreController::class, 'index']);
Route::get('/users/search-comments', [UserInsightController::class, 'searchComments']);
Route::get('/users/{user}/comments', [UserInsightController::class, 'commentsByUser']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me/profile', [AuthController::class, 'me']);
    Route::put('/me/profile', [AuthController::class, 'updateMe']);
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::get('/admin/users/{user}', [AdminUserController::class, 'show']);
    Route::put('/admin/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);
    Route::apiResource('artists', ArtistController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('releases', ReleaseController::class)->except(['index', 'show', 'create', 'edit']);
    Route::post('/releases/upload-cover', [ReleaseController::class, 'uploadCover']);
    Route::post('/releases/{release}/stats', [ReleaseController::class, 'storeStats']);
    Route::post('/releases/{release}/feedback', [ReleaseController::class, 'submitFeedback']);
    Route::post('/releases/{release}/rate', [ReleaseController::class, 'rate']);
    Route::post('/releases/{release}/comments', [ReleaseController::class, 'comment']);
    Route::get('/me/artist-profile', [ArtistController::class, 'myProfile']);
    Route::put('/me/artist-profile', [ArtistController::class, 'updateMyProfile']);
    Route::post('/me/artist-profile/upload-avatar', [ArtistController::class, 'uploadMyAvatar']);
});
