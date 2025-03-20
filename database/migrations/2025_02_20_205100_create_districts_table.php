<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('districts', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('regency_id')->constrained('regencies')->onDelete('cascade');
            $table->string('code_bps')->unique();
            $table->string('name_bps');
            $table->string('code_dagri')->unique();
            $table->string('name_dagri');
            // $table->string('logo_path')->nullable(); // Store file path instead of longText
            // $table->longText('description')->nullable();
            // $table->string('website')->nullable();
            $table->timestamps();
        });

        // Belongs to One
        // Schema::create('user_districts', function (Blueprint $table) {
        //     $table->id(); // Primary key
        //     $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        //     $table->foreignId('district_id')->constrained('districts')->onDelete('cascade');
        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('districts');
        // Schema::dropIfExists('user_districts');
    }
};
