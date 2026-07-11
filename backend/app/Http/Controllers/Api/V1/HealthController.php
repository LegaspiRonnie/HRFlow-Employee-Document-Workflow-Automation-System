<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * GET /api/v1/health
     *
     * Public liveness probe. Reports the app identity and whether the
     * database is reachable, so the frontend (and later, Docker
     * healthchecks) can verify the full stack without authentication.
     */
    public function __invoke(): JsonResponse
    {
        // A failed DB connection must not take the endpoint down —
        // the whole point is to report that failure as data.
        try {
            DB::connection()->getPdo();
            $database = 'connected';
        } catch (\Throwable) {
            $database = 'disconnected';
        }

        return response()->json([
            'app' => config('app.name'),
            'status' => 'ok',
            'database' => $database,
            'time' => now()->toIso8601String(),
        ]);
    }
}
