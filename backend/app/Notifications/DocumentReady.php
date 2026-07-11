<?php

namespace App\Notifications;

use App\Models\GeneratedDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

/**
 * Sent to the employee when their PDF is generated — the email carries
 * the document itself as an attachment (document email delivery).
 */
class DocumentReady extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly GeneratedDocument $document)
    {
    }

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $type = $this->document->documentRequest->documentType->name;

        $mail = (new MailMessage)
            ->subject("Your {$type} is ready — {$this->document->document_number}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your {$type} ({$this->document->document_number}) has been generated and is attached to this email.")
            ->line("It is valid until {$this->document->expires_at?->format('F j, Y')} and can be verified anytime via the QR code printed on it.")
            ->action('Download from HRFlow', config('app.frontend_url').'/requests');

        // attach the PDF from the private disk
        if (Storage::disk('local')->exists($this->document->file_path)) {
            $mail->attachData(
                Storage::disk('local')->get($this->document->file_path),
                "{$this->document->document_number}.pdf",
                ['mime' => 'application/pdf'],
            );
        }

        return $mail;
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Your document is ready',
            'message' => sprintf(
                '%s (%s) is ready for download.',
                $this->document->documentRequest->documentType->name,
                $this->document->document_number,
            ),
            'request_id' => $this->document->document_request_id,
            'link' => '/requests',
        ];
    }
}
