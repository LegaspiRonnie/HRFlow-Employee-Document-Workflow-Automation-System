<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — all endpoints live under /api/v1
|--------------------------------------------------------------------------
| Laravel automatically prefixes this file with /api; the v1 group below
| gives us room to ship breaking changes as /api/v2 later without touching
| existing clients. Every feature registers its routes inside this group.
*/

Route::prefix('v1')->group(function () {
    // Public — no auth required
    Route::get('/health', HealthController::class);

    // Auth (Feature 1) — login is throttled to 5 attempts/min per IP
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    // Everything below requires a valid Sanctum Bearer token
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });
});
