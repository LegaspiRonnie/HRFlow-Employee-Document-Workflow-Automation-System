<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\DecisionRequest;
use App\Http\Resources\DocumentRequestResource;
use App\Models\DocumentRequest;
use App\Notifications\RequestStageUpdated;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * Manager review stage. "Team" = employees whose manager_id is the
 * signed-in user, so a manager only ever sees their own reports'
 * requests (HR admins get the same scoping when acting as managers).
 */
class ManagerApprovalController extends Controller
{
    private const RELATIONS = ['documentType', 'employee.user', 'employee.department', 'employee.position', 'approvals.approver'];

    /** Scope: requests belonging to the signed-in user's direct reports. */
    private function teamRequests(Request $request)
    {
        return DocumentRequest::whereHas(
            'employee',
            fn ($q) => $q->where('manager_id', $request->user()->id),
        )->with(self::RELATIONS);
    }

    /** GET /manager/queue — team requests awaiting this manager. */
    public function queue(Request $request): AnonymousResourceCollection
    {
        return DocumentRequestResource::collection(
            $this->teamRequests($request)
                ->where('status', RequestStatus::PendingManager)
                ->oldest() // first in, first reviewed
                ->get(),
        );
    }

    /** GET /manager/history — every team request, newest first. */
    public function history(Request $request): AnonymousResourceCollection
    {
        return DocumentRequestResource::collection(
            $this->teamRequests($request)->latest()->get(),
        );
    }

    /** POST /manager/requests/{documentRequest}/decision — approve/reject. */
    public function decide(DecisionRequest $request, DocumentRequest $documentRequest): DocumentRequestResource
    {
        // must be MY team's request…
        abort_unless(
            $documentRequest->employee()->where('manager_id', $request->user()->id)->exists(),
            403,
            'This request does not belong to your team.',
        );
        // …and still awaiting manager review (no double decisions)
        abort_unless(
            $documentRequest->status === RequestStatus::PendingManager,
            409,
            'This request has already been decided.',
        );

        $approve = $request->validated('action') === 'approve';

        // decision + status flip must land together
        DB::transaction(function () use ($request, $documentRequest, $approve) {
            $documentRequest->approvals()->create([
                'approver_id' => $request->user()->id,
                'stage' => 'manager',
                'action' => $approve ? 'approved' : 'rejected',
                'comments' => $request->validated('comments'),
            ]);

            $documentRequest->update([
                'status' => $approve ? RequestStatus::PendingHr : RequestStatus::ManagerRejected,
            ]);
        });

        AuditLogger::log(
            $approve ? 'request.manager_approved' : 'request.manager_rejected',
            $documentRequest,
            ['comments' => $request->validated('comments')],
        );

        // tell the employee their request moved (or bounced)
        $documentRequest->employee->user->notify(new RequestStageUpdated(
            $documentRequest->loadMissing('documentType'),
            'manager',
            $approve ? 'approved' : 'rejected',
            $request->validated('comments'),
        ));

        return new DocumentRequestResource($documentRequest->fresh(self::RELATIONS));
    }
}
