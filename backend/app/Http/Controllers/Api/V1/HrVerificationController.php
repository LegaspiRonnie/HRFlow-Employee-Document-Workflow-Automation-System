<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\DecisionRequest;
use App\Http\Resources\DocumentRequestResource;
use App\Models\DocumentRequest;
use App\Notifications\DocumentReady;
use App\Notifications\RequestStageUpdated;
use App\Services\AuditLogger;
use App\Services\DocumentGeneratorService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * HR verification — the second and final approval stage. HR sees every
 * manager-approved request company-wide (no team scoping).
 * Verifying completes the request; Feature 9 hooks PDF generation here.
 */
class HrVerificationController extends Controller
{
    private const RELATIONS = ['documentType', 'employee.user', 'employee.department', 'employee.position', 'approvals.approver', 'generatedDocument'];

    public function __construct(private readonly DocumentGeneratorService $generator)
    {
    }

    /** GET /hr/verifications — manager-approved requests awaiting HR. */
    public function queue(): AnonymousResourceCollection
    {
        return DocumentRequestResource::collection(
            DocumentRequest::where('status', RequestStatus::PendingHr)
                ->with(self::RELATIONS)
                ->oldest()
                ->get(),
        );
    }

    /** GET /hr/requests — company-wide request monitor, newest first. */
    public function history(): AnonymousResourceCollection
    {
        return DocumentRequestResource::collection(
            DocumentRequest::with(self::RELATIONS)->latest()->get(),
        );
    }

    /** POST /hr/requests/{documentRequest}/decision — verify or reject. */
    public function decide(DecisionRequest $request, DocumentRequest $documentRequest): DocumentRequestResource
    {
        abort_unless(
            $documentRequest->status === RequestStatus::PendingHr,
            409,
            'This request is not awaiting HR verification.',
        );

        $verify = $request->validated('action') === 'approve';

        // Decision, status flip, AND PDF generation are one atomic unit:
        // a request is never "completed" without its document existing.
        $generated = DB::transaction(function () use ($request, $documentRequest, $verify) {
            $documentRequest->approvals()->create([
                'approver_id' => $request->user()->id,
                'stage' => 'hr',
                'action' => $verify ? 'approved' : 'rejected',
                'comments' => $request->validated('comments'),
            ]);

            $documentRequest->update([
                'status' => $verify ? RequestStatus::Completed : RequestStatus::HrRejected,
            ]);

            return $verify ? $this->generator->generate($documentRequest, $request->user()) : null;
        });

        AuditLogger::log(
            $verify ? 'request.hr_verified' : 'request.hr_rejected',
            $documentRequest,
            ['comments' => $request->validated('comments')],
        );

        // notify the employee: stage update always, plus the PDF itself on verify
        $owner = $documentRequest->employee->user;
        $owner->notify(new RequestStageUpdated(
            $documentRequest->loadMissing('documentType'),
            'hr',
            $verify ? 'approved' : 'rejected',
            $request->validated('comments'),
        ));
        if ($generated) {
            $owner->notify(new DocumentReady($generated->load('documentRequest.documentType')));
        }

        return new DocumentRequestResource($documentRequest->fresh(self::RELATIONS));
    }

    /**
     * POST /hr/requests/{documentRequest}/regenerate — new PDF version
     * (e.g. after a template fix). Keeps the document number, bumps the
     * version; old files remain on disk as the version history.
     */
    public function regenerate(\Illuminate\Http\Request $request, DocumentRequest $documentRequest): DocumentRequestResource
    {
        abort_unless(
            $documentRequest->status === RequestStatus::Completed,
            409,
            'Only completed requests can be regenerated.',
        );

        $generated = $this->generator->generate($documentRequest, $request->user());
        AuditLogger::log('document.regenerated', $generated, ['version' => $generated->version]);

        return new DocumentRequestResource($documentRequest->fresh(self::RELATIONS));
    }
}
