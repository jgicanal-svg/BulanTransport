<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("bus_assignments", function (Blueprint $table) {
            $table->id();
            $table->foreignId("driver_id")->constrained("drivers")->cascadeOnDelete();
            $table->foreignId("bus_id")->constrained("buses")->cascadeOnDelete();
            $table->foreignId("route_id")->constrained("routes")->cascadeOnDelete();
            $table->timestamp("assigned_at");
            $table->timestamp("ended_at")->nullable();
            $table->boolean("is_active")->default(true);
            $table->timestamps();

            $table->index(["driver_id", "is_active"]);
            $table->index(["bus_id", "is_active"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("bus_assignments");
    }
};
