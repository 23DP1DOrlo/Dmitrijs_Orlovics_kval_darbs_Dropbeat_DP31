<?php

use App\Http\Controllers\ArtistController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\ReleaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/releases', [ReleaseController::class, 'index']);
Route::get('/releases/{release}', [ReleaseController::class, 'show']);
Route::get('/stats/genres', [ReleaseController::class, 'statsSummary']);
Route::get('/genres', [GenreController::class, 'index']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::apiResource('artists', ArtistController::class)->except(['create', 'edit']);
    Route::apiResource('releases', ReleaseController::class)->except(['index', 'show', 'create', 'edit']);
    Route::post('/releases/{release}/stats', [ReleaseController::class, 'storeStats']);
    Route::get('/me/artist-profile', [ArtistController::class, 'myProfile']);
    Route::put('/me/artist-profile', [ArtistController::class, 'updateMyProfile']);
});
