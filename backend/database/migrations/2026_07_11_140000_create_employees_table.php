<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            // 1:1 with the login account; deleting the user removes the record
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('employee_code')->unique(); // EMP-0001, printed on documents
            $table->foreignId('department_id')->constrained()->restrictOnDelete();
            $table->foreignId('position_id')->constrained()->restrictOnDelete();
            // the USER who approves this employee's requests (nullable for top of chain)
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('date_hired');
            $table->string('phone', 30)->nullable();
            $table->string('address')->nullable();
            $table->decimal('salary', 12, 2)->nullable(); // for compensation certificates
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
