<?php

namespace App\Console\Commands;

use App\Models\GeneratedDocument;
use App\Notifications\DocumentExpiring;
use Illuminate\Console\Command;

/**
 * Daily scheduled task (see routes/console.php): notify employees whose
 * generated documents expire within 14 days. reminded_at guarantees each
 * document only ever produces one reminder.
 */
class SendExpirationReminders extends Command
{
    protected $signature = 'documents:send-expiration-reminders';

    protected $description = 'Notify employees about generated documents expiring within 14 days';

    public function handle(): int
    {
        $expiring = GeneratedDocument::whereNull('reminded_at')
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now(), now()->addDays(14)])
            ->with('documentRequest.employee.user')
            ->get();

        foreach ($expiring as $document) {
            $document->documentRequest->employee->user->notify(new DocumentExpiring($document));
            $document->update(['reminded_at' => now()]);
        }

        $this->info("Sent {$expiring->count()} expiration reminder(s).");

        return self::SUCCESS;
    }
}
