<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/login
     * Verifies credentials and issues a Sanctum personal access token.
     * The route is throttled (5/min) against brute-force attempts.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        // Same error whether the email or the password is wrong —
        // never reveal which accounts exist.
        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $token = $user->createToken('hrflow-spa')->plainTextToken;
        AuditLogger::log('auth.login', $user);

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    /**
     * POST /api/v1/auth/logout
     * Revokes only the token used for this request, so a logout on one
     * device does not kill sessions on other devices.
     */
    public function logout(Request $request): JsonResponse
    {
        AuditLogger::log('auth.logout', $request->user());
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * GET /api/v1/auth/me
     * Returns the authenticated user — the SPA calls this on page refresh
     * to restore the session from a stored token.
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
