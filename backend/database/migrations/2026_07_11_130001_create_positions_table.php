<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            // restrictOnDelete: a department with positions cannot be deleted —
            // the controller turns the FK violation into a friendly 409.
            $table->foreignId('department_id')->constrained()->restrictOnDelete();
            $table->string('description')->nullable();
            $table->timestamps();

            $table->unique(['title', 'department_id']); // same title ok across departments
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
