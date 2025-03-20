<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('positions')->insert([
            [
                'name' => 'Kepala Desa',
                'description' => 'Pemimpin pemerintahan desa yang bertanggung jawab atas administrasi dan pembangunan desa.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sekretaris Desa',
                'description' => 'Membantu Kepala Desa dalam urusan administrasi pemerintahan desa.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kaur Keuangan',
                'description' => 'Mengelola keuangan desa, termasuk penyusunan anggaran dan laporan keuangan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kaur Perencanaan',
                'description' => 'Menyusun rencana kerja pemerintah desa dan anggaran tahunan desa.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kasi Pemerintahan',
                'description' => 'Bertugas dalam bidang pemerintahan, termasuk administrasi kependudukan dan ketertiban umum.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kasi Kesejahteraan',
                'description' => 'Mengurus kesejahteraan sosial masyarakat desa, seperti bantuan sosial dan pemberdayaan ekonomi.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kasi Pelayanan',
                'description' => 'Menyediakan layanan administrasi bagi masyarakat desa, seperti pembuatan surat pengantar dan rekomendasi.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kadus (Kepala Dusun)',
                'description' => 'Memimpin dan mengkoordinasi wilayah dusun dalam pemerintahan desa.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'BPD (Badan Permusyawaratan Desa)',
                'description' => 'Lembaga perwakilan masyarakat desa yang berfungsi sebagai pengawas dan mitra kerja pemerintah desa.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'LPMD (Lembaga Pemberdayaan Masyarakat Desa)',
                'description' => 'Bertugas membantu pemerintahan desa dalam perencanaan dan pelaksanaan pembangunan desa.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
