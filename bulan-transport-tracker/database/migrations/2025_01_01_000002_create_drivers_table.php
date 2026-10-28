<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("drivers", function (Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->unique()->constrained("users")->cascadeOnDelete();
            $table->string("employee_code")->nullable()->unique();
            $table->string("license_number")->nullable()->unique();
            $table->date("license_expiry")->nullable();
            $table->string("status")->default("ACTIVE");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("drivers");
    }
};
