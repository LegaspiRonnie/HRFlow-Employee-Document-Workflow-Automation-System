<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GeneratedDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GeneratedDocumentController extends Controller
{
    /**
     * GET /documents/{generatedDocument}/download
     * Streams the PDF from the private disk. Only the owning employee
     * or an HR admin may download — managers see metadata, not files.
     */
    public function download(Request $request, GeneratedDocument $generatedDocument): StreamedResponse
    {
        $user = $request->user();
        $ownerUserId = $generatedDocument->documentRequest->employee->user_id;

        abort_unless($user->isHrAdmin() || $user->id === $ownerUserId, 403);
        abort_unless(Storage::disk('local')->exists($generatedDocument->file_path), 404, 'File missing from storage.');

        $filename = sprintf(
            '%s-v%d.pdf',
            $generatedDocument->document_number,
            $generatedDocument->version,
        );

        return Storage::disk('local')->download($generatedDocument->file_path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * GET /verify/{token} — PUBLIC endpoint behind the QR code.
     * Confirms authenticity without exposing the document itself.
     */
    public function verify(string $token): JsonResponse
    {
        $document = GeneratedDocument::where('verification_token', $token)
            ->with('documentRequest.employee.user', 'documentRequest.documentType')
            ->first();

        if (! $document) {
            return response()->json(['valid' => false], 404);
        }

        return response()->json([
            'valid' => ! $document->isExpired(),
            'expired' => $document->isExpired(),
            'document_number' => $document->document_number,
            'version' => $document->version,
            'document_type' => $document->documentRequest->documentType->name,
            'employee_name' => $document->documentRequest->employee->user->name,
            'signed_by' => $document->signed_by,
            'issued_at' => $document->created_at->toDateString(),
            'expires_at' => $document->expires_at?->toDateString(),
        ]);
    }
}
