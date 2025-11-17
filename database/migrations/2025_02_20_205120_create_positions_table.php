<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str; // Untuk menghasilkan slug

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
            $table->string('slug')->unique(); // Tambahkan kolom slug
            $table->string('description');
            $table->integer('min')->default(0);
            $table->integer('max')->default(1);
            $table->integer('level')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Insert data to positions table || Susunan Perangkat Desa
        $positions = [
            ['name' => 'Lainnya', 'description' => 'Lainnya', 'min' => 0, 'max' => 99, 'level' => 99, 'parent_id' => null],

            // Level 1: Kepala Desa
            ['name' => 'Kepala Desa', 'description' => 'Kepala Desa', 'min' => 1, 'max' => 1, 'level' => 1, 'parent_id' => null],

            // Level 2: Jabatan di bawah Kepala Desa
            ['name' => 'Sekretaris Desa', 'description' => 'Sekretaris Desa', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Urusan Tata Usaha dan Umum', 'description' => 'Kepala Urusan Tata Usaha dan Umum', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Urusan Keuangan', 'description' => 'Kepala Urusan Keuangan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Urusan Perencanaan', 'description' => 'Kepala Urusan Perencanaan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Urusan Umum dan Perencanaan', 'description' => 'Kepala Urusan Umum dan Perencanaan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Seksi Pemerintahan', 'description' => 'Kepala Seksi Pemerintahan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Seksi Kesejahteraan', 'description' => 'Kepala Seksi Kesejahteraan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Seksi Pelayanan', 'description' => 'Kepala Seksi Pelayanan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Seksi Kesejahteraan dan Pelayanan', 'description' => 'Kepala Seksi Kesejahteraan dan Pelayanan', 'min' => 1, 'max' => 1, 'level' => 2, 'parent_id' => 2],
            ['name' => 'Kepala Dusun', 'description' => 'Kepala Dusun', 'min' => 1, 'max' => 99, 'level' => 2, 'parent_id' => 2],

            // Level 3: Jabatan Desa BPD
            ['name' => 'Ketua BPD', 'description' => 'Ketua Badan Permusyawaratan Desa', 'min' => 1, 'max' => 1, 'level' => 3, 'parent_id' => 2],
            ['name' => 'Wakil Ketua BPD', 'description' => 'Wakil Ketua Badan Permusyawaratan Desa', 'min' => 1, 'max' => 1, 'level' => 3, 'parent_id' => 2],
            ['name' => 'Sekretaris BPD', 'description' => 'Sekretaris Badan Permusyawaratan Desa', 'min' => 1, 'max' => 1, 'level' => 3, 'parent_id' => 2],
            ['name' => 'Anggota BPD', 'description' => 'Anggota Badan Permusyawaratan Desa', 'min' => 1, 'max' => 99, 'level' => 3, 'parent_id' => 2],
        ];

        // Tambahkan kolom slug sebelum insert
        foreach ($positions as &$position) {
            $position['slug'] = Str::slug($position['name']); // Generate slug dari nama
        }

        // Insert data ke tabel positions
        DB::table('positions')->insert($positions);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
