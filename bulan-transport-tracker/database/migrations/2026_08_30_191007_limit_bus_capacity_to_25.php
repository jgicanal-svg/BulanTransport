<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Normalize existing data before changing the column.
         *
         * Null capacities become 25.
         * Existing values above 25 are reduced to 25.
         */
        DB::table('buses')
            ->whereNull('capacity')
            ->update([
                'capacity' => 25,
            ]);

        DB::table('buses')
            ->where('capacity', '>', 25)
            ->update([
                'capacity' => 25,
            ]);

        Schema::table('buses', function (Blueprint $table) {
            $table
                ->unsignedTinyInteger('capacity')
                ->default(25)
                ->nullable(false)
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table
                ->unsignedInteger('capacity')
                ->nullable()
                ->default(null)
                ->change();
        });
    }
};