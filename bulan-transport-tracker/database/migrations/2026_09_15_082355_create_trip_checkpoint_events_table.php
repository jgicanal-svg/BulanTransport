<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_checkpoint_events', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trip_id')
                ->constrained('trips')
                ->cascadeOnDelete();

            $table->foreignId('bus_id')
                ->constrained('buses')
                ->cascadeOnDelete();

            $table->string('checkpoint_name', 100);

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->timestamp('entered_at');

            $table->timestamps();

            /*
             * Prevent:
             *
             * "BTC-350 entered Irosin"
             * every 5 seconds 😂
             */
            $table->unique([
                'trip_id',
                'checkpoint_name',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_checkpoint_events');
    }
};