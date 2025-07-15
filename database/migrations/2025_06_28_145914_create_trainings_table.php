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
    public function up()
    {
        // Tabel untuk menyimpan organisasi
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique(); // Judul organisasi
            $table->text('description')->nullable(); // Deskripsi organisasi
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        // Menambahkan data default untuk tabel trainings
        DB::table('trainings')->insert([
            // Parpol
            ['title' => 'LAINNYA', 'description' => 'Lainnya', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tabel untuk menyimpan relasi antara pejabat dan organisasi
        Schema::create('official_trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->foreignId('training_id')->constrained('trainings')->onDelete('cascade'); // Relasi ke tabel trainings
            $table->string('nama')->nullable(); // Nama peserta pelatihan
            $table->string('alamat')->nullable(); // Jabatan peserta
            // $table->string('pelatihan')->nullable(); // Alamat peserta
            $table->string('penyelenggara')->nullable(); // Jabatan peserta
            $table->string('nomor_sertifikat')->nullable(); // Nomor sertifikat
            $table->string('tanggal_sertifikat')->nullable(); // Nomor ijazah
            $table->text('keterangan')->nullable(); // Keterangan tambahan
            $table->longText('doc_scan')->nullable(); // Dokumen pendukung (sertifikat, dll)
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Menghapus tabel secara berurutan untuk menghindari error foreign key constraint
        Schema::dropIfExists('official_trainings');
        Schema::dropIfExists('trainings');
    }
};
