<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("route_stops", function (Blueprint $table) {
            $table->id();
            $table->foreignId("route_id")->constrained("routes")->cascadeOnDelete();
            $table->string("name");
            $table->decimal("latitude", 10, 7);
            $table->decimal("longitude", 10, 7);
            $table->unsignedInteger("stop_order");
            $table->timestamps();
            $table->unique(["route_id", "stop_order"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("route_stops");
    }
};
