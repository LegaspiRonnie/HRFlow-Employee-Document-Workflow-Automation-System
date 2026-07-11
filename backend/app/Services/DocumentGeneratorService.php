<?php

namespace App\Services;

use App\Models\DocumentRequest;
use App\Models\GeneratedDocument;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * Turns a verified DocumentRequest into an official, QR-verifiable PDF:
 *
 *  1. substitute {{placeholders}} in the type's HTML template
 *  2. wrap it in the letterhead Blade layout with QR code + signature
 *  3. store the PDF on the private disk (never web-accessible directly)
 *  4. record it in generated_documents (number, version, token, hash)
 *
 * Re-generating the same request bumps the version but keeps the
 * document number, giving a full version history.
 */
class DocumentGeneratorService
{
    /** Certificates stay verifiable for 6 months by default. */
    private const VALIDITY_MONTHS = 6;

    public function generate(DocumentRequest $request, User $signedBy): GeneratedDocument
    {
        $request->loadMissing(['employee.user', 'employee.department', 'employee.position', 'documentType.template']);

        $previous = GeneratedDocument::where('document_request_id', $request->id)
            ->orderByDesc('version')->first();

        // versioning: keep the number, bump the version
        $documentNumber = $previous?->document_number ?? GeneratedDocument::nextNumber();
        $version = ($previous?->version ?? 0) + 1;

        $token = (string) Str::uuid();
        $issuedAt = now();

        // tamper-evident digital signature: anyone re-computing this hash
        // needs the server's APP_KEY, so it cannot be forged offline
        $signatureHash = hash_hmac('sha256', implode('|', [
            $documentNumber,
            $version,
            $request->employee->employee_code,
            $issuedAt->toDateString(),
        ]), config('app.key'));

        $html = $this->renderBody($request, $documentNumber);

        // QR encodes the public verification URL on the SPA. Embedded as a
        // base64 data URI — DomPDF chokes on inline SVG's XML prologue.
        $verifyUrl = rtrim(config('app.frontend_url'), '/')."/verify/{$token}";
        $qrDataUri = 'data:image/svg+xml;base64,'
            .base64_encode(QrCode::format('svg')->size(110)->margin(0)->generate($verifyUrl));

        $pdf = Pdf::loadView('pdf.document', [
            'title' => $request->documentType->name,
            'body' => $html,
            'documentNumber' => $documentNumber,
            'version' => $version,
            'qrDataUri' => $qrDataUri,
            'verifyUrl' => $verifyUrl,
            'signedBy' => $signedBy->name,
            'signatureHash' => $signatureHash,
            'issuedAt' => $issuedAt,
            'expiresAt' => $issuedAt->copy()->addMonths(self::VALIDITY_MONTHS),
        ])->setPaper('a4');

        // private disk: storage/app/private — served only via the
        // authorized download endpoint
        $filePath = sprintf('documents/%s-v%d-%s.pdf', $documentNumber, $version, Str::random(8));
        Storage::disk('local')->put($filePath, $pdf->output());

        $record = GeneratedDocument::create([
            'document_request_id' => $request->id,
            'document_number' => $documentNumber,
            'version' => $version,
            'file_path' => $filePath,
            'verification_token' => $token,
            'signature_hash' => $signatureHash,
            'signed_by' => $signedBy->name,
            'expires_at' => $issuedAt->copy()->addMonths(self::VALIDITY_MONTHS),
        ]);

        AuditLogger::log('document.generated', $record, [
            'number' => $documentNumber,
            'version' => $version,
        ]);

        return $record;
    }

    /** Fill the type's HTML template with this employee's real data. */
    private function renderBody(DocumentRequest $request, string $documentNumber): string
    {
        $employee = $request->employee;
        $template = $request->documentType->template;

        abort_if($template === null, 422, 'No template configured for this document type.');

        $values = [
            '{{employee_name}}' => e($employee->user->name),
            '{{employee_code}}' => e($employee->employee_code),
            '{{position}}' => e($employee->position->title),
            '{{department}}' => e($employee->department->name),
            '{{date_hired}}' => $employee->date_hired->format('F j, Y'),
            '{{salary}}' => $employee->salary !== null ? number_format((float) $employee->salary, 2) : 'N/A',
            '{{purpose}}' => e($request->purpose),
            '{{current_date}}' => now()->format('F j, Y'),
            '{{company_name}}' => config('app.company_name'),
            '{{document_number}}' => $documentNumber,
        ];

        return strtr($template->body, $values);
    }
}
