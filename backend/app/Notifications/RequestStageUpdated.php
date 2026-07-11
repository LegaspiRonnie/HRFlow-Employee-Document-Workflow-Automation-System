<?php

namespace App\Notifications;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent to the requesting employee at every workflow transition:
 * manager approved/rejected, HR verified/rejected.
 */
class RequestStageUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly DocumentRequest $documentRequest,
        private readonly string $stage,   // 'manager' | 'hr'
        private readonly string $action,  // 'approved' | 'rejected'
        private readonly ?string $comments,
    ) {
    }

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    private function headline(): string
    {
        $type = $this->documentRequest->documentType->name;

        return match ([$this->stage, $this->action]) {
            ['manager', 'approved'] => "Your {$type} request was approved by your manager and forwarded to HR.",
            ['manager', 'rejected'] => "Your {$type} request was rejected by your manager.",
            ['hr', 'approved'] => "Your {$type} request passed HR verification.",
            default => "Your {$type} request was rejected by HR.",
        };
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Update on your document request')
            ->greeting("Hello {$notifiable->name},")
            ->line($this->headline());

        if ($this->comments) {
            $mail->line("Comments: “{$this->comments}”");
        }

        return $mail
            ->action('Track your request', config('app.frontend_url').'/requests')
            ->line('Thank you for using HRFlow.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->action === 'approved' ? 'Request moved forward' : 'Request rejected',
            'message' => $this->headline().($this->comments ? " Comments: {$this->comments}" : ''),
            'request_id' => $this->documentRequest->id,
            'link' => '/requests',
        ];
    }
}
