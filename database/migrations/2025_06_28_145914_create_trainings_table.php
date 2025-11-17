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

        $trainingMapping = [
            1 => ['title' => 'LAINNYA', 'description' => 'Pelatihan lainnya yang tidak termasuk dalam kategori'],
            7 => ['title' => 'PELATIHAN / BIMTEK PENYUSUNAN RENSTRA DESA, RKP DESA DAN APBDESA', 'description' => 'Pelatihan penyusunan rencana strategis desa, rencana kerja pembangunan desa, dan anggaran pendapatan belanja desa'],
            8 => ['title' => 'PELATIHAN / BIMTEK PEMBUATAN RPJMDES DAN RKPDES', 'description' => 'Pelatihan pembuatan rencana pembangunan jangka menengah desa dan rencana kerja pembangunan desa'],
            9 => ['title' => 'PELATIHAN / BIMTEK PENGELOLAAN DAN PERTANGGUNGJAWABAN KEUANGAN DESA', 'description' => 'Pelatihan pengelolaan dan pertanggungjawaban keuangan desa'],
            10 => ['title' => 'PELATIHAN PENGELOLAAN KEUANGAN DESA BERBASIS SISKEUDES (PEMENDAGRI 20 TAHUN 2018)', 'description' => 'Pelatihan pengelolaan keuangan desa berbasis sistem keuangan desa'],
            11 => ['title' => 'BIMTEK PRIORITAS DANA DESA SERTA PENGELOLAAN KEUANGAN DESA', 'description' => 'Bimbingan teknis prioritas dana desa dan pengelolaan keuangan desa'],
            12 => ['title' => 'BIMTEK TENAGA TEKNIS BANTUAN SARANA DAN PRASARANA MELALUI ALOKASI DANA DESA', 'description' => 'Bimbingan teknis tenaga teknis bantuan sarana dan prasarana melalui alokasi dana desa'],
            13 => ['title' => 'BIMTEK PELAPORAN ADD DAN BAGI HASIL PAJAK RETRIBUSI DAERAH', 'description' => 'Bimbingan teknis pelaporan alokasi dana desa dan bagi hasil pajak retribusi daerah'],
            14 => ['title' => 'BIMBINGAN TEKNIS PENGELOLAAN KEUANGAN DESA (PERENCANAAN PELAKSANAAN, PENATAUSAHAAN, PELAPORAN, DAN PERTANGGUNGJAWABAN)', 'description' => 'Bimbingan teknis pengelolaan keuangan desa'],
            15 => ['title' => 'BIMTEK PERANAN PEMERINTAH DESA DALAM MENINGKATKAN PARTISIPASI MASYARAKAT DI DESA', 'description' => 'Bimbingan teknis peranan pemerintah desa dalam meningkatkan partisipasi masyarakat'],
            16 => ['title' => 'BIMTEK PERENCANAAN PENGANGGARAN DESA', 'description' => 'Bimbingan teknis perencanaan penganggaran desa'],
            17 => ['title' => 'BIMTEK KEBIJAKAN PENGALOKASIAN DAN PENYALURAN DANA DESA', 'description' => 'Bimbingan teknis kebijakan pengalokasian dan penyaluran dana desa'],
            18 => ['title' => 'PELATIHAN / BIMTEK PENYUSUNAN PERENCANAAN PEMBANGUNAN DESA', 'description' => 'Pelatihan penyusunan perencanaan pembangunan desa'],
            19 => ['title' => 'PELATIHAN / BIMTEK PENINGKATAN KAPASITAS PEMERINTAH DESA DAN ANGGOTA BPD', 'description' => 'Pelatihan peningkatan kapasitas pemerintah desa dan anggota badan permusyawaratan desa'],
            20 => ['title' => 'BIMTEK PENINGKATAN KAPASISTAS PERANGKAT DESA', 'description' => 'Bimbingan teknis peningkatan kapasitas perangkat desa'],
            21 => ['title' => 'PELATIHAN KEPEMIMPINAN KEPALA DESA', 'description' => 'Pelatihan kepemimpinan untuk kepala desa'],
            22 => ['title' => 'BIMTEK TEKNIK PERCEPATAN PENATAAN KEWENANGAN BAGI KEPALA DESA DAN SEKRETARIS DESA', 'description' => 'Bimbingan teknis teknik percepatan penataan kewenangan'],
            23 => ['title' => 'TEKNIK PENYUSUNAN PRODUK HUKUM DESA', 'description' => 'Pelatihan teknik penyusunan produk hukum desa'],
            24 => ['title' => 'PENCEGAHAN TINDAK PIDANA KORUPSI BAGI KADES DAN TPK', 'description' => 'Pelatihan pencegahan tindak pidana korupsi untuk kepala desa dan tim pengelola keuangan'],
            25 => ['title' => 'PENYAMAAN PERSEPSI UU NO. 6 TAHUN 2014', 'description' => 'Pelatihan penyamaan persepsi undang-undang nomor 6 tahun 2014 tentang desa'],
            26 => ['title' => 'MASALAH DAN KONFLIK', 'description' => 'Pelatihan penyelesaian masalah dan konflik di desa'],
            27 => ['title' => 'TEKNIS PENGELOLAAN ASET DESA', 'description' => 'Pelatihan teknis pengelolaan aset desa'],
            28 => ['title' => 'PELATIHAN PENATAAN ADMINISTRASI DESA', 'description' => 'Pelatihan penataan administrasi desa'],
            29 => ['title' => 'PELATIHAN PEMBUATAN PROFIL DESA', 'description' => 'Pelatihan pembuatan profil desa'],
            30 => ['title' => 'PELATIHAN MANAJEMEN ASET DESA', 'description' => 'Pelatihan manajemen aset desa']
        ];

        foreach ($trainingMapping as $id => $data) {
            DB::table('trainings')->updateOrInsert(
                ['id' => $id],
                [
                    'id' => $id,
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

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
