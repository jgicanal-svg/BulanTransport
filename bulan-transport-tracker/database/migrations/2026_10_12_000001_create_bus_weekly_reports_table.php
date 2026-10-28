<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bus_weekly_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained('buses')->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->unsignedSmallInteger('iso_year');
            $table->unsignedTinyInteger('iso_week');
            $table->string('reason', 100);
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['bus_id', 'driver_id', 'iso_year', 'iso_week'], 'bus_weekly_report_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bus_weekly_reports');
    }
};
