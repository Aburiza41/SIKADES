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
            ['title' => 'Pelatihan Manajemen Stres', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen stres', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Keuangan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen keuangan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen SDM', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen SDM', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Produksi', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen produksi', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Pemasaran', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen pemasaran', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Operasional', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen operasional', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Strategi', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen strategi', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Inovasi', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen inovasi', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Risiko', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen risiko', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kualitas', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kualitas', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Lingkungan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen lingkungan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Keamanan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen keamanan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Teknologi', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen teknologi', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Informasi', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen informasi', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Komunikasi', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen komunikasi', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Hubungan Masyarakat', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen hubungan masyarakat', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Pelayanan Publik', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen pelayanan publik', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kearsipan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kearsipan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Arsip', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen arsip', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Dokumen', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen dokumen', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Rekam Medis', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen rekam medis', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kepegawaian', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kepegawaian', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Pendidikan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen pendidikan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Pelatihan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen pelatihan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Pengembangan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen pengembangan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Penelitian', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen penelitian', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Pengabdian', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen pengabdian', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesehatan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesehatan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kebersihan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kebersihan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Keamanan Pangan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen keamanan pangan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan Sosial', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan sosial', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan Anak', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan anak', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan Lansia', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan lansia', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan Keluarga', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan keluarga', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan Masyarakat', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan masyarakat', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Pelatihan Manajemen Kesejahteraan Desa', 'description' => 'Pelatihan untuk meningkatkan kemampuan manajemen kesejahteraan desa', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tabel untuk menyimpan relasi antara pejabat dan pelatihan
        Schema::create('official_trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->foreignId('training_id')->constrained('trainings')->onDelete('cascade'); // Relasi ke tabel trainings
            $table->string('nama'); // Nama peserta pelatihan
            $table->text('keterangan')->nullable(); // Keterangan tambahan
            $table->date('mulai'); // Tanggal mulai pelatihan
            $table->date('selesai'); // Tanggal selesai pelatihan
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