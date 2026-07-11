<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generated_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_request_id')->constrained()->cascadeOnDelete();
            $table->string('document_number', 30); // HRF-2026-000123 (stable across versions)
            $table->unsignedInteger('version')->default(1);
            $table->string('file_path'); // relative to the private local disk
            $table->uuid('verification_token')->unique(); // what the QR encodes
            $table->string('signature_hash', 64); // sha256 digital signature
            $table->string('signed_by'); // HR admin who verified
            $table->date('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['document_request_id', 'version']);
            $table->index('document_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_documents');
    }
};
