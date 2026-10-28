<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("trips", function (Blueprint $table) {
            $table->id();
            $table->foreignId("bus_assignment_id")->constrained("bus_assignments")->cascadeOnDelete();
            $table->timestamp("started_at")->nullable();
            $table->timestamp("ended_at")->nullable();
            $table->string("status")->default("PENDING"); // PENDING, ACTIVE, COMPLETED, CANCELLED
            $table->decimal("start_latitude", 10, 7)->nullable();
            $table->decimal("start_longitude", 10, 7)->nullable();
            $table->decimal("end_latitude", 10, 7)->nullable();
            $table->decimal("end_longitude", 10, 7)->nullable();
            $table->timestamp("last_location_at")->nullable();
            $table->timestamps();

            $table->index(["status"]);
            $table->index(["bus_assignment_id", "status"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("trips");
    }
};
