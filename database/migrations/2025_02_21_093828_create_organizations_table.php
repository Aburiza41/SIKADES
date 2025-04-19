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
            // Parpol
            ['title' => 'Parpol', 'description' => 'Partai Politik', 'created_at' => now(), 'updated_at' => now()],
            // Profesi
            ['title' => 'Profesi', 'description' => 'Profesi', 'created_at' => now(), 'updated_at' => now()],
            // Sosial
            ['title' => 'Sosial', 'description' => 'Sosial', 'created_at' => now(), 'updated_at' => now()],
            // Lainnya
            ['title' => 'Lainnya', 'description' => 'Lainnya', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Tabel untuk menyimpan relasi antara pejabat dan organisasi
        Schema::create('official_organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->constrained('officials')->onDelete('cascade'); // Relasi ke tabel officials
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade'); // Relasi ke tabel organizations
            $table->string('nama'); // Nama pejabat di organisasi
            $table->string('posisi')->nullable(); // Posisi pejabat di organisasi
            $table->longText('doc_scan')->nullable(); // Dokumen pendukung (scan surat keputusan, dll)
            // Start date and end date
            $table->date('mulai')->nullable(); // Tanggal mulai
            $table->date('selesai')->nullable(); // Tanggal selesai
            // Nama Pimpinan
            $table->string('pimpinan')->nullable();
            // Address
            $table->longText('alamat')->nullable();
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
