<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            // restrict: request history must survive; employees are set
            // inactive rather than deleted once they have requests
            $table->foreignId('employee_id')->constrained()->restrictOnDelete();
            $table->foreignId('document_type_id')->constrained()->restrictOnDelete();
            $table->string('purpose', 500);
            $table->enum('status', [
                'pending_manager', 'manager_rejected',
                'pending_hr', 'hr_rejected', 'completed',
            ])->default('pending_manager')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
