<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\DocumentRequestController;
use App\Http\Controllers\Api\V1\DocumentTypeController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\PositionController;
use App\Http\Controllers\Api\V1\ProfileController;
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

        // ── Own profile (Feature 4) — any authenticated role ──
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        // ── Document catalog (Feature 5) — all roles, for the request form ──
        Route::get('/document-types', [DocumentTypeController::class, 'index']);

        // ── Own document requests (Feature 6) — any authenticated role ──
        Route::get('/requests', [DocumentRequestController::class, 'index']);
        Route::post('/requests', [DocumentRequestController::class, 'store']);
        Route::get('/requests/{documentRequest}', [DocumentRequestController::class, 'show']);

        // ── HR-admin-only management (Features 3-4) ──
        Route::middleware('role:hr_admin')->group(function () {
            Route::apiResource('departments', DepartmentController::class);
            Route::apiResource('positions', PositionController::class);
            Route::get('/employees/managers', [EmployeeController::class, 'managers']);
            Route::apiResource('employees', EmployeeController::class);
            Route::get('/document-templates', [DocumentTypeController::class, 'templates']);
            Route::put('/document-templates/{template}', [DocumentTypeController::class, 'updateTemplate']);
        });
    });
});
