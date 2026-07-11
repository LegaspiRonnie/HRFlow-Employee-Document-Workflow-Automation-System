<?php

namespace App\Notifications;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Sent to the employee's manager when a new request lands in their queue. */
class RequestSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly DocumentRequest $documentRequest)
    {
    }

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $employee = $this->documentRequest->employee->user->name;
        $type = $this->documentRequest->documentType->name;

        return (new MailMessage)
            ->subject("New document request from {$employee}")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$employee} has requested a {$type}.")
            ->line("Purpose: {$this->documentRequest->purpose}")
            ->action('Review in HRFlow', config('app.frontend_url').'/manager/queue')
            ->line('Please approve or reject this request at your earliest convenience.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New request awaiting your review',
            'message' => sprintf(
                '%s requested a %s.',
                $this->documentRequest->employee->user->name,
                $this->documentRequest->documentType->name,
            ),
            'request_id' => $this->documentRequest->id,
            'link' => '/manager/queue',
        ];
    }
}
