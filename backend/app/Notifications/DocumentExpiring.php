<?php

namespace App\Notifications;

use App\Models\GeneratedDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Scheduled reminder: a generated document expires within 14 days. */
class DocumentExpiring extends Notification implements ShouldQueue
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

        return (new MailMessage)
            ->subject("Reminder: your {$type} expires soon")
            ->greeting("Hello {$notifiable->name},")
            ->line(sprintf(
                'Your %s (%s) expires on %s.',
                $type,
                $this->document->document_number,
                $this->document->expires_at?->format('F j, Y'),
            ))
            ->line('If you still need a valid copy after that date, please submit a new request.')
            ->action('Request a new document', config('app.frontend_url').'/requests/new');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Document expiring soon',
            'message' => sprintf(
                '%s (%s) expires on %s.',
                $this->document->documentRequest->documentType->name,
                $this->document->document_number,
                $this->document->expires_at?->toDateString(),
            ),
            'request_id' => $this->document->document_request_id,
            'link' => '/requests',
        ];
    }
}
