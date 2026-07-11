<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();      // "Employment Certificate"
            $table->string('code', 20)->unique();  // "EMP_CERT" — stable key used in code
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // One editable template per type. body is HTML with {{placeholder}}
        // variables substituted at PDF-generation time (Feature 9).
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_type_id')->unique()->constrained()->cascadeOnDelete();
            $table->longText('body');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
        Schema::dropIfExists('document_types');
    }
};
