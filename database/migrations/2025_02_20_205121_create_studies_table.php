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
        Schema::create('studies', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama jenjang pendidikan (contoh: SD, SMP, SMA, S1, S2, dll.)
            $table->string('description')->nullable(); // Deskripsi singkat (opsional)
            $table->integer('level')->default(0); // Level hierarki (opsional, untuk urutan jenjang)
            $table->foreignId('parent_id')->nullable()->constrained('studies')->nullOnDelete(); // Parent jenjang (opsional, untuk hierarki)
            $table->timestamps();
        });

        DB::table('studies')->insert([
            ['name' => 'SD/MI', 'description' => 'Sekolah Dasar/Madrasah Ibtidaiyah', 'level' => 1, 'parent_id' => null],
            ['name' => 'SMP/MTS', 'description' => 'Sekolah Menengah Pertama/Madrasah Tsanawiyah', 'level' => 2, 'parent_id' => null],
            ['name' => 'SMA/SMK/MA', 'description' => 'Sekolah Menengah Atas/Kejuruan/Madrasah Aliyah', 'level' => 3, 'parent_id' => null],
            ['name' => 'D1', 'description' => 'Diploma 1', 'level' => 4, 'parent_id' => null],
            ['name' => 'D2', 'description' => 'Diploma 2', 'level' => 5, 'parent_id' => null],
            ['name' => 'D3', 'description' => 'Diploma 3', 'level' => 6, 'parent_id' => null],
            ['name' => 'D4/S1', 'description' => 'Diploma 3/Sarjana', 'level' => 7, 'parent_id' => null],
            ['name' => 'S2', 'description' => 'Magister', 'level' => 8, 'parent_id' => 7], // S2 memiliki parent S1
            ['name' => 'S3', 'description' => 'Doktor', 'level' => 9, 'parent_id' => 8], // S3 memiliki parent S2
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('studies');
    }
};
