<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Tracks that the expiration reminder was already sent (send once). */
    public function up(): void
    {
        Schema::table('generated_documents', function (Blueprint $table) {
            $table->timestamp('reminded_at')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('generated_documents', function (Blueprint $table) {
            $table->dropColumn('reminded_at');
        });
    }
};
