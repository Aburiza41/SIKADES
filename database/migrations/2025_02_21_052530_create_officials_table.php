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
            $table->foreignId('village_id')->nullable()->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            // $table->string('nik')->unique()->nullable(); // Nomor Induk Kependudukan (NIK)
            // $table->string('code_ident')->unique()->nullable(); // Nomor Induk Kependudukan (NIK)
            // $table->string('nipd')->unique()->nullable(); // Nomor Induk Administrasi Desa
            $table->string('nik')->nullable(); // Nomor Induk Kependudukan (NIK)
            $table->string('code_ident')->unique()->nullable(); // Nomor Induk Kependudukan (NIK)
            $table->string('nipd')->nullable(); // Nomor Induk Administrasi Desa
            $table->string('nama_lengkap')->nullable(); // Nama lengkap pejabat
            $table->string('gelar_depan')->nullable(); // Gelar di depan nama
            $table->string('gelar_belakang')->nullable(); // Gelar di belakang nama
            $table->string('tempat_lahir')->nullable(); // Tempat lahir
            $table->date('tanggal_lahir')->nullable(); // Tanggal lahir
            $table->enum('jenis_kelamin', ['L', 'P', 'Lainnya'])->default('Lainnya')->nullable(); // Jenis kelamin
            $table->enum('agama', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'])->default('Lainnya')->nullable(); // Agama
            $table->enum('status_perkawinan', ['Belum Kawin', 'Kawin', 'Duda', 'Janda', 'Lainnya'])->default('Lainnya')->nullable(); // Status perkawinan
            $table->enum('status', ['daftar', 'proses', 'validasi', 'tolak'])->default('daftar')->nullable(); // Status administrasi
            $table->foreignId('user_village_id')->nullable()->constrained('users')->onDelete('set null'); // Verifikasi oleh admin desa
            // $table->foreignId('user_district_id')->nullable()->constrained('users')->onDelete('set null'); // Verifikasi oleh admin kecamatan
            $table->foreignId('user_regency_id')->nullable()->constrained('users')->onDelete('set null'); // Verifikasi oleh admin kabupaten
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan alamat pejabat
        Schema::create('official_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->longText('alamat')->nullable(); // Alamat lengkap
            $table->integer('rt')->nullable(); // Nomor RT
            $table->integer('rw')->nullable(); // Nomor RW
            $table->string('kode_pos')->nullable(); // Kode pos
            $table->string('province_code'); // Kode provinsi
            $table->string('province_name'); // Nama provinsi
            $table->string('regency_code'); // Kode kabupaten/kota
            $table->string('regency_name'); // Nama kabupaten/kota
            $table->string('district_code'); // Kode kecamatan
            $table->string('district_name'); // Nama kecamatan
            $table->string('village_code'); // Kode desa/kelurahan
            $table->string('village_name'); // Nama desa/kelurahan
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan kontak pejabat
        Schema::create('official_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('handphone')->nullable(); // Nomor handphone
            $table->string('email')->nullable(); // Email (opsional)
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan identitas tambahan pejabat
        Schema::create('official_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->enum('gol_darah', ['A', 'B', 'AB', 'O', 'Lainnya'])->default('Lainnya')->nullable(); // Golongan darah
            $table->enum('pendidikan_terakhir', ['SD/MI', 'SMP/MTS/SLTP', 'SMA/SMK/MA/SLTA/SMU', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'])->default('Lainnya')->nullable(); // Pendidikan terakhir
            $table->string('bpjs_kesehatan')->nullable(); // Nomor BPJS Kesehatan
            $table->string('bpjs_ketenagakerjaan')->nullable(); // Nomor BPJS Ketenagakerjaan
            $table->string('npwp')->nullable(); // Nomor NPWP
            $table->longText('foto')->nullable(); // Dokumen pendukung (scan KTP, KK, dll)
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan riwayat pendidikan pejabat
        Schema::create('study_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            // $table->foreignId('study_id')->constrained('studies')->onDelete('cascade'); // Relasi ke tabel studies
            $table->enum('pendidikan_umum', ['SD/MI', 'SMP/MTS/SLTP', 'SMA/SMK/MA/SLTA/SMU', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'])->default('Lainnya')->nullable();
            $table->string('nama_sekolah')->nullable(); // Nama sekolah/universitas
            $table->string('alamat_sekolah')->nullable(); // Alamat sekolah/universitas
            $table->string('nomor_ijazah')->nullable(); // Jurusan (jika ada)
            $table->date('tanggal')->nullable(); // Tahun masuk
            $table->string('dokumen')->nullable(); // Dokumen pendukung (scan ijazah, transkrip, dll)
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan riwayat pekerjaan pejabat
        Schema::create('work_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->longText('alamat')->nullable(); // Alamat lengkap
            $table->integer('rt')->nullable(); // Nomor RT
            $table->integer('rw')->nullable(); // Nomor RW
            $table->string('kode_pos')->nullable(); // Kode pos
            $table->boolean('village_status')->default(true); // Kode pos
            $table->longText('village_name')->nullable(); // Kode pos
            // Desa
            $table->foreignId('village_id')->nullable()->constrained('villages')->onDelete('set null'); // Relasi ke tabel villages
            // Kecamatan
            $table->foreignId('district_id')->nullable()->constrained('districts')->onDelete('set null'); // Relasi ke tabel districts
            // Kabupaten
            $table->foreignId('regency_id')->nullable()->constrained('regencies')->onDelete('set null'); // Relasi ke tabel regencies
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan relasi antara pejabat dan pelatihan
        // Schema::create('official_trainings', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
        //     $table->string('nama')->nullable(); // Nama peserta pelatihan
        //     $table->string('alamat')->nullable(); // Jabatan peserta
        //     $table->string('pelatihan')->nullable(); // Alamat peserta
        //     $table->string('penyelenggara')->nullable(); // Jabatan peserta
        //     $table->string('nomor_sertifikat')->nullable(); // Nomor sertifikat
        //     $table->string('tanggal_sertifikat')->nullable(); // Nomor ijazah
        //     $table->text('keterangan')->nullable(); // Keterangan tambahan
        //     $table->longText('doc_scan')->nullable(); // Dokumen pendukung (sertifikat, dll)
        //     $table->timestamps(); // Kolom created_at dan updated_at
        //     $table->longText('keterangan')->nullable();
        // });

        // Tabel untuk menyimpan riwayat jabatan pejabat
        Schema::create('position_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('position_id')->constrained('positions')->onDelete('cascade'); // Relasi ke tabel positions
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('penetap')->nullable(); // Pihak yang menetapkan (misalnya: Bupati, Camat, dll)
            $table->string('nomor_sk', 255)->nullable(); // Nomor SK pengangkatan
            $table->date('tanggal_sk')->nullable(); // Tanggal SK pengangkatan
            $table->string('file_sk')->nullable(); // File SK (opsional)
            $table->date('tmt_jabatan')->nullable(); // Tanggal mulai menjabat
            // $table->date('selesai')->nullable(); // Tanggal selesai menjabat (nullable jika masih aktif)
            // Periode jabatan
            $table->string('periode')->nullable();
            $table->text('keterangan')->nullable(); // Keterangan tambahan
            $table->boolean('status')->default(false); // Status jabatan (aktif/tidak aktif)
            $table->timestamps();
        });

        // Tabel untuk menyimpan Data Orang Tua Kandung dari pejabat
        Schema::create('parent_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            // Bapak/Ibu
            $table->enum('hubungan', ['Ayah', 'Ibu'])->nullable();
            $table->string('nama'); // Nama orang tua kandung
            // Tempat Lahir
            $table->string('tempat_lahir')->nullable();
            // Tanggal Lahir
            $table->date('tanggal_lahir')->nullable();
            // Pekerjaan
            $table->string('pekerjaan')->nullable();
            $table->longText('alamat')->nullable(); // Alamat lengkap
            $table->integer('rt')->nullable(); // Nomor RT
            $table->integer('rw')->nullable(); // Nomor RW
            $table->string('kode_pos')->nullable(); // Kode pos
            $table->string('province_code')->nullable(); // Kode provinsi
            $table->string('province_name')->nullable(); // Nama provinsi
            $table->string('regency_code')->nullable(); // Kode kabupaten/kota
            $table->string('regency_name')->nullable(); // Nama kabupaten/kota
            $table->string('district_code')->nullable(); // Kode kecamatan
            $table->string('district_name')->nullable(); // Nama kecamatan
            $table->string('village_code')->nullable(); // Kode desa/kelurahan
            $table->string('village_name')->nullable(); // Nama desa/kelurahan
            // No Telepon
            $table->string('no_telepon')->nullable();
            $table->longText('keterangan')->nullable();
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
            $table->enum('pendidikan_umum', ['SD/MI', 'SMP/MTS/SLTP', 'SMA/SMK/MA/SLTA/SMU', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'])->default('Lainnya')->nullable();  // Pendidikan terakhir
            // Pekerjaan
            $table->string('pekerjaan')->nullable();
            $table->longText('keterangan')->nullable();
            $table->timestamps();
        });

        // Tabel untuk menyimpan anak pejabat
        Schema::create('child_officials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->string('nama'); // Nama anak pejabat
            $table->enum('jenis_kelamin', ['L', 'P', 'Lainnya'])->default('Lainnya')->nullable(); // Jenis kelamin
            // Tempat Lahir
            $table->string('tempat_lahir')->nullable();
            // Tanggal Lahir
            $table->date('tanggal_lahir')->nullable();

            // Status
            $table->enum('status', ['Anak Kandung', 'Anak Tiri', 'Anak Angkat'])->nullable();
            // Pendidikan Umum
            $table->enum('pendidikan_umum', ['SD/MI', 'SMP/MTS/SLTP', 'SMA/SMK/MA/SLTA/SMU', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'])->default('Lainnya')->nullable();  // Pendidikan terakhir
            // Pekerjaan
            $table->string('pekerjaan')->nullable();
            $table->longText('keterangan')->nullable();
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
        Schema::dropIfExists('spouse_officials');
        Schema::dropIfExists('child_officials');
        Schema::dropIfExists('parent_officials');
        Schema::dropIfExists('position_officials');
        Schema::dropIfExists('study_officials');
        Schema::dropIfExists('official_identities');
        Schema::dropIfExists('official_contacts');
        Schema::dropIfExists('official_addresses');
        Schema::dropIfExists('officials');
    }
};
