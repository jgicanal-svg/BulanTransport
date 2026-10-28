<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bus_no_travel_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bus_id')
                ->constrained('buses')
                ->cascadeOnDelete();

            $table->foreignId('driver_id')
                ->constrained('drivers')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('month');

            $table->unsignedSmallInteger('year');

            $table->string('reason', 100);

            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->unique([
                'bus_id',
                'month',
                'year',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'bus_no_travel_reports'
        );
    }
};