<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreDocumentRequestRequest;
use App\Http\Resources\DocumentRequestResource;
use App\Models\DocumentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Employee-side requests: submit and track OWN requests only.
 * Manager/HR review flows live in their own controllers.
 */
class DocumentRequestController extends Controller
{
    /** Relations shipped to the tracking page. */
    private const RELATIONS = ['documentType', 'approvals.approver', 'generatedDocument'];

    /** GET /requests — the signed-in user's own requests, newest first. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $employee = $request->user()->employee()->firstOrFail();

        return DocumentRequestResource::collection(
            DocumentRequest::where('employee_id', $employee->id)
                ->with(self::RELATIONS)
                ->latest()
                ->get(),
        );
    }

    /** POST /requests — submit; lands in the manager's queue. */
    public function store(StoreDocumentRequestRequest $request): JsonResponse
    {
        $employee = $request->user()->employee()->first();

        if (! $employee) {
            return response()->json([
                'message' => 'Your account has no employee record yet — contact HR.',
            ], 422);
        }

        $documentRequest = DocumentRequest::create([
            'employee_id' => $employee->id,
            'document_type_id' => $request->validated('document_type_id'),
            'purpose' => $request->validated('purpose'),
            // set explicitly (not via DB default) so the created model
            // serializes correctly in the 201 response
            'status' => RequestStatus::PendingManager,
        ]);

        return (new DocumentRequestResource($documentRequest->load('documentType')))
            ->response()->setStatusCode(201);
    }

    /** GET /requests/{documentRequest} — own requests only. */
    public function show(Request $request, DocumentRequest $documentRequest): DocumentRequestResource
    {
        $employee = $request->user()->employee()->firstOrFail();

        // ownership check — never leak another employee's request
        abort_unless($documentRequest->employee_id === $employee->id, 403);

        return new DocumentRequestResource($documentRequest->load(self::RELATIONS));
    }
}
