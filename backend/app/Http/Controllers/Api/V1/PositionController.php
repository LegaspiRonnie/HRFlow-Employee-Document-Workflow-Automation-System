<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Org\PositionRequest;
use App\Http\Resources\PositionResource;
use App\Models\Position;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** HR-admin-only CRUD for positions (gated in routes/api.php). */
class PositionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PositionResource::collection(
            Position::with('department')->orderBy('title')->get(),
        );
    }

    public function store(PositionRequest $request): JsonResponse
    {
        $position = Position::create($request->validated())->load('department');

        return (new PositionResource($position))->response()->setStatusCode(201);
    }

    public function show(Position $position): PositionResource
    {
        return new PositionResource($position->load('department'));
    }

    public function update(PositionRequest $request, Position $position): PositionResource
    {
        $position->update($request->validated());

        return new PositionResource($position->load('department'));
    }

    public function destroy(Position $position): JsonResponse
    {
        try {
            $position->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'Cannot delete: employees are still assigned to this position.',
            ], 409);
        }

        return response()->json(['message' => 'Position deleted.']);
    }
}
