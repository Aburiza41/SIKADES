<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->integer('min')->default(0);
            $table->integer('level')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->timestamps();
        });

        // Insert data to positions table || Susunan Perangkat Desa
        DB::table('positions')->insert([
            // Level 1: Kepala Desa
            ['name' => 'Kepala Desa', 'description' => 'Kepala Desa', 'min' => 1, 'level' => 1, 'parent_id' => null],

            // Level 2: Jabatan di bawah Kepala Desa
            ['name' => 'Sekretaris Desa', 'description' => 'Sekretaris Desa', 'min' => 1, 'level' => 2, 'parent_id' => 1],
            ['name' => 'Kepala Urusan Keuangan', 'description' => 'Kepala Urusan Keuangan', 'min' => 1, 'level' => 2, 'parent_id' => 1],
            ['name' => 'Kepala Urusan Perencanaan', 'description' => 'Kepala Urusan Perencanaan', 'min' => 1, 'level' => 2, 'parent_id' => 1],
            ['name' => 'Kepala Urusan Kepegawaian', 'description' => 'Kepala Urusan Kepegawaian', 'min' => 1, 'level' => 2, 'parent_id' => 1],
            ['name' => 'Kepala Urusan Pemerintahan', 'description' => 'Kepala Urusan Pemerintahan', 'min' => 1, 'level' => 2, 'parent_id' => 1],
            ['name' => 'Kepala Urusan Pembangunan', 'description' => 'Kepala Urusan Pembangunan', 'min' => 1, 'level' => 2, 'parent_id' => 1],
            ['name' => 'Kepala Urusan Kesra', 'description' => 'Kepala Urusan Kesra', 'min' => 1, 'level' => 2, 'parent_id' => 1],

            // Level 3: Kepala Dusun (di bawah Kepala Desa)
            ['name' => 'Kepala Dusun', 'description' => 'Kepala Dusun', 'min' => 1, 'level' => 3, 'parent_id' => 1],

            // Level 4: Jabatan di bawah Kepala Dusun
            ['name' => 'Sekretaris Dusun', 'description' => 'Sekretaris Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
            ['name' => 'Kepala Urusan Keuangan Dusun', 'description' => 'Kepala Urusan Keuangan Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
            ['name' => 'Kepala Urusan Perencanaan Dusun', 'description' => 'Kepala Urusan Perencanaan Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
            ['name' => 'Kepala Urusan Kepegawaian Dusun', 'description' => 'Kepala Urusan Kepegawaian Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
            ['name' => 'Kepala Urusan Pemerintahan Dusun', 'description' => 'Kepala Urusan Pemerintahan Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
            ['name' => 'Kepala Urusan Pembangunan Dusun', 'description' => 'Kepala Urusan Pembangunan Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
            ['name' => 'Kepala Urusan Kesra Dusun', 'description' => 'Kepala Urusan Kesra Dusun', 'min' => 1, 'level' => 4, 'parent_id' => 9],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
