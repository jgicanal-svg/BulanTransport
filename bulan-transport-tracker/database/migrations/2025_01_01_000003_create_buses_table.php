<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->unique();
            $table->string('plate_number')->unique();
            $table->string('device_code')->unique();
            $table->string('model')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};