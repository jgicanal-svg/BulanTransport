<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("vehicle_locations", function (Blueprint $table) {
            $table->id();

            $table->foreignId("trip_id")
                ->constrained("trips")
                ->cascadeOnDelete();

            $table->foreignId("bus_id")
                ->constrained("buses")
                ->cascadeOnDelete();

            $table->foreignId("driver_id")
                ->constrained("drivers")
                ->cascadeOnDelete();

            $table->decimal("latitude", 10, 7);
            $table->decimal("longitude", 10, 7);

            $table->decimal("accuracy", 8, 2)->nullable();
            $table->decimal("speed", 8, 2)->nullable();
            $table->decimal("heading", 6, 2)->nullable();
            $table->decimal("altitude", 8, 2)->nullable();

            $table->timestamp("recorded_at")->nullable();
            $table->timestamp("received_at")->useCurrent();

            $table->timestamps();

            $table->index(["trip_id", "recorded_at"]);
            $table->index(["bus_id", "recorded_at"]);
            $table->index(["driver_id", "recorded_at"]);
            $table->index(["recorded_at"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("vehicle_locations");
    }
};