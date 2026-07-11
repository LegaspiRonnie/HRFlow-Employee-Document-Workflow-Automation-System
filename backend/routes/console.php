<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Feature 10: daily reminder for documents expiring within 14 days.
// Runs via `php artisan schedule:work` in dev / cron in production.
Schedule::command('documents:send-expiration-reminders')->dailyAt('08:00');
