<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("latest_vehicle_locations", function (Blueprint $table) {
            $table->foreignId("bus_id")
                ->primary()
                ->constrained("buses")
                ->cascadeOnDelete();

            $table->foreignId("trip_id")
                ->nullable()
                ->constrained("trips")
                ->nullOnDelete();

            $table->foreignId("driver_id")
                ->nullable()
                ->constrained("drivers")
                ->nullOnDelete();

            $table->decimal("latitude", 10, 7);
            $table->decimal("longitude", 10, 7);

            $table->decimal("accuracy", 8, 2)->nullable();
            $table->decimal("speed", 8, 2)->nullable();
            $table->decimal("heading", 6, 2)->nullable();

            $table->timestamp("recorded_at")->nullable();
            $table->timestamp("received_at")->useCurrent();
            $table->timestamp("updated_at")->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("latest_vehicle_locations");
    }
};