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
        Schema::create('villages', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('district_id')->constrained('districts')->onDelete('cascade');
            $table->string('code_bps')->unique();
            $table->string('name_bps');
            $table->string('code_dagri')->unique();
            $table->string('name_dagri');
            $table->string('logo_path')->nullable(); // Store file path instead of longText
            $table->longText('description')->nullable();
            $table->string('website')->nullable();
            $table->timestamps();
        });

        Schema::create('user_villages', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('village_demographics', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('jumlah_penduduk')->nullable(); // Total penduduk
            $table->integer('jumlah_laki_laki')->nullable(); // Jumlah penduduk laki-laki
            $table->integer('jumlah_perempuan')->nullable(); // Jumlah penduduk perempuan
            $table->integer('jumlah_kepala_keluarga')->nullable(); // Jumlah kepala keluarga (KK)
            $table->integer('jumlah_anak_anak')->nullable(); // Jumlah penduduk anak-anak
            $table->integer('jumlah_remaja')->nullable(); // Jumlah penduduk remaja
            $table->integer('jumlah_dewasa')->nullable(); // Jumlah penduduk dewasa
            $table->integer('jumlah_lansia')->nullable(); // Jumlah penduduk lansia
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_economies', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('jumlah_keluarga_miskin')->nullable(); // Jumlah keluarga miskin
            $table->integer('tingkat_pengangguran')->nullable(); // Tingkat pengangguran (%)
            $table->string('mata_pencaharian_utama')->nullable(); // Jenis mata pencaharian utama
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_infrastructures', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('rumah_tangga_listrik')->nullable(); // Jumlah rumah tangga dengan akses listrik
            $table->integer('rumah_tangga_air_bersih')->nullable(); // Jumlah rumah tangga dengan akses air bersih
            $table->string('kondisi_jalan')->nullable(); // Kondisi jalan (baik, sedang, rusak)
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_educations', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('jumlah_penduduk_sd')->nullable(); // Jumlah penduduk dengan pendidikan SD
            $table->integer('jumlah_penduduk_smp')->nullable(); // Jumlah penduduk dengan pendidikan SMP
            $table->integer('jumlah_penduduk_sma')->nullable(); // Jumlah penduduk dengan pendidikan SMA
            $table->integer('jumlah_penduduk_pt')->nullable(); // Jumlah penduduk dengan pendidikan Perguruan Tinggi
            $table->integer('jumlah_fasilitas_pendidikan')->nullable(); // Jumlah fasilitas pendidikan
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_healths', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('jumlah_fasilitas_kesehatan')->nullable(); // Jumlah fasilitas kesehatan
            $table->integer('jumlah_tenaga_kesehatan')->nullable(); // Jumlah tenaga kesehatan
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_environments', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->decimal('luas_wilayah', 10, 2)->nullable(); // Luas wilayah desa (dalam hektar)
            $table->string('jenis_penggunaan_lahan')->nullable(); // Jenis penggunaan lahan
            $table->string('kondisi_lingkungan')->nullable(); // Kondisi lingkungan (bersih, kumuh, rawan bencana)
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_institutions', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('jumlah_lembaga_desa')->nullable(); // Jumlah lembaga desa
            $table->integer('jumlah_kegiatan_lembaga')->nullable(); // Jumlah kegiatan yang dilakukan oleh lembaga desa
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_developments', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->string('program_pengembangan')->nullable(); // Program pengembangan desa yang sedang berjalan
            $table->string('sumber_pendanaan')->nullable(); // Sumber pendanaan (APBD, APBN, swadaya masyarakat, dll)
            $table->text('indikator_keberhasilan')->nullable(); // Indikator keberhasilan program
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        Schema::create('village_idms', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade'); // Relasi ke tabel villages
            $table->integer('score_idm')->nullable(); // Skor IDM (Indeks Desa Membangun)
            $table->string('status_idm')->nullable(); // Status IDM
            $table->integer('score_prodeskel')->nullable(); // Skor Prodeskel
            $table->integer('score_epdeskel')->nullable(); // Skor EPDeskel
            $table->string('status')->nullable(); // Status Pengembangan
            $table->longText('classification')->nullable(); // Klasifikasi
            $table->string('year')->nullable(); // Tahun data
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villages');
        Schema::dropIfExists('user_villages');
        Schema::dropIfExists('village_demographics');
        Schema::dropIfExists('village_economies');
        Schema::dropIfExists('village_infrastructures');
        Schema::dropIfExists('village_educations');
        Schema::dropIfExists('village_healths');
        Schema::dropIfExists('village_environments');
        Schema::dropIfExists('village_institutions');
        Schema::dropIfExists('village_developments');
        Schema::dropIfExists('village_idms');
    }
};
