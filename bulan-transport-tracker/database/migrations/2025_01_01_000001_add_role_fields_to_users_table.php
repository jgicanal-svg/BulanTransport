<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->string("first_name")->after("id");
            $table->string("middle_name")->nullable()->after("first_name");
            $table->string("last_name")->after("middle_name");
            $table->string("contact_number", 11)->nullable()->unique()->after("email");
            $table->string("role")->default("DRIVER")->after("contact_number");
            $table->boolean("is_active")->default(true)->after("role");
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table("users", function (Blueprint $table) {
            $table->dropColumn(["first_name", "middle_name", "last_name", "contact_number", "role", "is_active"]);
            $table->dropSoftDeletes();
        });
    }
};
