<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->decimal('origin_latitude', 10, 7)
                ->nullable()
                ->after('origin');

            $table->decimal('origin_longitude', 10, 7)
                ->nullable()
                ->after('origin_latitude');

            $table->decimal('destination_latitude', 10, 7)
                ->nullable()
                ->after('destination');

            $table->decimal('destination_longitude', 10, 7)
                ->nullable()
                ->after('destination_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->dropColumn([
                'origin_latitude',
                'origin_longitude',
                'destination_latitude',
                'destination_longitude',
            ]);
        });
    }
};