<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateOrganizationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Tabel untuk menyimpan organisasi
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique(); // Judul organisasi
            $table->text('description')->nullable(); // Deskripsi organisasi
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        // Menambahkan data default untuk tabel organizations
        DB::table('organizations')->insert([
            ['title' => 'Karang Taruna', 'description' => 'Organisasi kepemudaan di desa', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'PKK', 'description' => 'Pemberdayaan dan kesejahteraan keluarga', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'LPM', 'description' => 'Lembaga Pemberdayaan Masyarakat', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'BPD', 'description' => 'Badan Permusyawaratan Desa', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'RT/RW', 'description' => 'Rukun Tetangga / Rukun Warga', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Kelompok Tani', 'description' => 'Kelompok tani di desa', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Kelompok Nelayan', 'description' => 'Kelompok nelayan di desa', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Posyandu', 'description' => 'Pos Pelayanan Terpadu', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'BUMDes', 'description' => 'Badan Usaha Milik Desa', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Koperasi Desa', 'description' => 'Koperasi yang beroperasi di desa', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tabel untuk menyimpan relasi antara pejabat dan organisasi
        Schema::create('official_organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade'); // Relasi ke tabel organizations
            $table->string('nama'); // Nama pejabat di organisasi
            $table->string('posisi')->nullable(); // Posisi pejabat di organisasi
            $table->longText('doc_scan')->nullable(); // Dokumen pendukung (scan surat keputusan, dll)
            $table->text('keterangan')->nullable(); // Keterangan tambahan
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
        Schema::dropIfExists('official_organizations');
        Schema::dropIfExists('organizations');
    }
}