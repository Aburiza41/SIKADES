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
        // Tabel untuk menyimpan data pelatihan
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul pelatihan
            $table->text('description')->nullable(); // Deskripsi pelatihan
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        // Menambahkan data default untuk tabel trainings
        DB::table('trainings')->insert([
            ['title' => 'Pelatihan Karyawan Baru', 'description' => 'Pelatihan untuk karyawan baru yang baru saja bergabung', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Kepemimpinan', 'description' => 'Pelatihan untuk meningkatkan kemampuan kepemimpinan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Waktu', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen waktu', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Proyek', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen proyek', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Konflik', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen konflik', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tabel untuk menyimpan relasi antara pejabat dan pelatihan
        Schema::create('official_trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->foreignId('training_id')->constrained('trainings')->onDelete('cascade'); // Relasi ke tabel trainings
            $table->string('nama'); // Nama peserta pelatihan
            $table->string('alamat'); // Jabatan peserta
            $table->string('pelatihan'); // Alamat peserta
            $table->string('penyelenggara'); // Jabatan peserta
            $table->string('nomor_sertifikat')->nullable(); // Nomor sertifikat
            $table->string('tanggal_sertifikat')->nullable(); // Nomor ijazah
            $table->text('keterangan')->nullable(); // Keterangan tambahan
            $table->longText('doc_scan')->nullable(); // Dokumen pendukung (sertifikat, dll)
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Menghapus tabel secara berurutan untuk menghindari error foreign key constraint
        Schema::dropIfExists('official_trainings');
        Schema::dropIfExists('trainings');
    }
};
