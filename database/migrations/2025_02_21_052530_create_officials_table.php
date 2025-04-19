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
        // Tabel untuk menyimpan data utama pejabat
        Schema::create('officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->string('nik', 16)->unique(); // Nomor Induk Kependudukan (NIK)
            $table->bigInteger('nipd')->unique(); // Nomor Induk Administrasi Desa
            $table->string('nama_lengkap'); // Nama lengkap pejabat
            $table->string('gelar_depan')->nullable(); // Gelar di depan nama
            $table->string('gelar_belakang')->nullable(); // Gelar di belakang nama
            $table->string('tempat_lahir'); // Tempat lahir
            $table->date('tanggal_lahir'); // Tanggal lahir
            $table->enum('jenis_kelamin', ['L', 'P']); // Jenis kelamin
            $table->enum('agama', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'])->nullable(); // Agama
            $table->enum('status_perkawinan', ['Belum Menikah', 'Menikah', 'Cerai', 'Duda', 'Janda'])->default('Menikah'); // Status perkawinan
            $table->enum('status', ['daftar', 'proses', 'validasi', 'tolak'])->default('daftar'); // Status administrasi
            $table->foreignId('user_village_id')->nullable()->constrained('users')->onDelete('set null'); // Verifikasi oleh admin desa
            // $table->foreignId('user_district_id')->nullable()->constrained('users')->onDelete('set null'); // Verifikasi oleh admin kecamatan
            $table->foreignId('user_regency_id')->nullable()->constrained('users')->onDelete('set null'); // Verifikasi oleh admin kabupaten
            $table->timestamps();
        });

        // Tabel untuk menyimpan alamat pejabat
        Schema::create('official_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->text('alamat'); // Alamat lengkap
            $table->tinyInteger('rt')->nullable(); // Nomor RT
            $table->tinyInteger('rw')->nullable(); // Nomor RW
            $table->string('kode_pos')->nullable(); // Kode pos
            $table->string('province_code'); // Kode provinsi
            $table->string('province_name'); // Nama provinsi
            $table->string('regency_code'); // Kode kabupaten/kota
            $table->string('regency_name'); // Nama kabupaten/kota
            $table->string('district_code'); // Kode kecamatan
            $table->string('district_name'); // Nama kecamatan
            $table->string('village_code'); // Kode desa/kelurahan
            $table->string('village_name'); // Nama desa/kelurahan
            $table->timestamps();
        });

        // Tabel untuk menyimpan kontak pejabat
        Schema::create('official_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('handphone', 15)->unique(); // Nomor handphone
            $table->string('email')->nullable()->unique(); // Email (opsional)
            $table->timestamps();
        });

        // Tabel untuk menyimpan identitas tambahan pejabat
        Schema::create('official_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->enum('gol_darah', ['A', 'B', 'AB', 'O'])->nullable(); // Golongan darah
            $table->enum('pendidikan_terakhir', ['SD/MI', 'SMP/MTS', 'SMA/SMK/MA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'])->nullable(); // Pendidikan terakhir
            $table->string('bpjs_kesehatan', 20)->unique(); // Nomor BPJS Kesehatan
            $table->string('bpjs_ketenagakerjaan', 20)->unique(); // Nomor BPJS Ketenagakerjaan
            $table->string('npwp', 20)->unique(); // Nomor NPWP
            $table->timestamps();
        });

        // Tabel untuk menyimpan riwayat pendidikan pejabat
        Schema::create('study_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->foreignId('study_id')->constrained('studies')->onDelete('cascade'); // Relasi ke tabel studies
            $table->string('nama_sekolah'); // Nama sekolah/universitas
            $table->string('alamat_sekolah')->nullable(); // Alamat sekolah/universitas
            $table->string('nomor_ijazah')->nullable(); // Jurusan (jika ada)
            $table->integer('tanggal'); // Tahun masuk
            $table->string('dokumen')->nullable(); // Dokumen pendukung (scan ijazah, transkrip, dll)
            $table->timestamps();
        });

        // Tabel untuk menyimpan riwayat pekerjaan pejabat
        Schema::create('work_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('alamat')->nullable(); // Alamat perusahaan
            // Rt
            $table->string('rw')->nullable();
            // Rw
            $table->string('rw')->nullable(); // Kode provinsi
            // Kode Pos
            $table->string('kode_pos')->nullable(); // Nama provinsi
            // Desa
            $table->foreignId('village_id')->nullable()->constrained('villages')->onDelete('set null'); // Relasi ke tabel villages
            // Kecamatan
            $table->foreignId('district_id')->nullable()->constrained('districts')->onDelete('set null'); // Relasi ke tabel districts
            // Kabupaten
            $table->foreignId('regency_id')->nullable()->constrained('regencies')->onDelete('set null'); // Relasi ke tabel regencies
            // Provinsi
            $table->foreignId('province_id')->nullable()->constrained('provinces')->onDelete('set null'); // Relasi ke tabel provinces
            $table->timestamps();
        });

        // Tabel untuk menyimpan riwayat jabatan pejabat
        Schema::create('position_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('position_id')->constrained('positions')->onDelete('cascade'); // Relasi ke tabel positions
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('penetap'); // Pihak yang menetapkan (misalnya: Bupati, Camat, dll)
            $table->string('nomor_sk', 255)->unique(); // Nomor SK pengangkatan
            $table->date('tanggal_sk'); // Tanggal SK pengangkatan
            $table->string('file_sk')->nullable(); // File SK (opsional)
            $table->date('mulai'); // Tanggal mulai menjabat
            $table->date('selesai')->nullable(); // Tanggal selesai menjabat (nullable jika masih aktif)
            // Periode jabatan
            $table->integer('periode')->nullable();
            $table->text('keterangan')->nullable(); // Keterangan tambahan
            $table->timestamps();
        });

        // Tabel untuk menyimpan Data Orang Tua Kandung dari pejabat
        Schema::create('parent_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            // Bapak/Ibu
            $table->enum('hubungan', ['ayah', 'ibu'])->nullable();
            $table->string('nama'); // Nama orang tua kandung
            // Tempat Lahir
            $table->string('tempat_lahir')->nullable();
            // Tanggal Lahir
            $table->date('tanggal_lahir')->nullable();
            // Pekerjaan
            $table->string('pekerjaan')->nullable();
            // Alamat
            $table->string('alamat')->nullable();
            // Rt
            $table->string('rt')->nullable();
            // Rw
            $table->string('rw')->nullable();
            // Kode Pos
            $table->string('kode_pos')->nullable();
            // Desa
            $table->foreignId('village_id')->nullable()->constrained('villages')->onDelete('set null'); // Relasi ke tabel villages
            // Kecamatan
            $table->foreignId('district_id')->nullable()->constrained('districts')->onDelete('set null'); // Relasi ke tabel districts
            // Kabupaten
            $table->foreignId('regency_id')->nullable()->constrained('regencies')->onDelete('set null'); // Relasi ke tabel regencies
            // Provinsi
            $table->foreignId('province_id')->nullable()->constrained('provinces')->onDelete('set null'); // Relasi ke tabel provinces
            // No Telepon
            $table->string('no_telepon')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan pasangan pejabat
        Schema::create('spouse_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            // Pasangan Jika pejabat menikah dan laki-laki maka istri jika perempuan maka suami
            $table->enum('hubungan', ['suami', 'istri'])->nullable();
            $table->string('nama'); // Nama pasangan pejabat
            // Tempat Lahir
            $table->string('tempat_lahir')->nullable();
            // Tanggal Lahir
            $table->date('tanggal_lahir')->nullable();
            // Tanggal Menikah
            $table->date('tanggal_nikah')->nullable();
            // Pendidikan Umum
            $table->enum('pendidikan_umum', ['SD/MI', 'SMP/MTS', 'SMA/SMK/MA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'])->nullable(); // Pendidikan terakhir
            // Pekerjaan
            $table->string('pekerjaan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan anak pejabat
        Schema::create('child_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('nama'); // Nama anak pejabat
            // Tempat Lahir
            $table->string('tempat_lahir')->nullable();
            // Tanggal Lahir
            $table->date('tanggal_lahir')->nullable();
            // Status
            $table->enum('status', ['anak_kandung', 'anak_tiri', 'anak_angkat'])->nullable();
            // Pendidikan Umum
            $table->enum('pendidikan_umum', ['SD/MI', 'SMP/MTS', 'SMA/SMK/MA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'])->nullable(); // Pendidikan terakhir
            // Pekerjaan
            $table->string('pekerjaan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk mencatat perubahan status pada tabel officials
        Schema::create('official_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->enum('status_sebelumnya', ['daftar', 'proses', 'validasi', 'tolak'])->nullable(); // Status sebelumnya
            $table->enum('status_baru', ['daftar', 'proses', 'validasi', 'tolak']); // Status baru
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // User yang melakukan perubahan
            $table->text('keterangan')->nullable(); // Keterangan perubahan (opsional)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Menghapus tabel secara berurutan untuk menghindari error foreign key constraint
        Schema::dropIfExists('official_status_logs');
        Schema::dropIfExists('position_officials');
        Schema::dropIfExists('study_officials');
        Schema::dropIfExists('official_identities');
        Schema::dropIfExists('official_contacts');
        Schema::dropIfExists('official_addresses');
        Schema::dropIfExists('officials');
    }
};
