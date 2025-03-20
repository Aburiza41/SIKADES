<?php

namespace Database\Seeders;

use App\Models\Village;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserVillageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate Admin Desa Berdasarkan Data Desa
        $villages = Village::all();

        foreach ($villages as $village) {
            // Create User Village
            $email = strtolower(str_replace(' ', '', $village->name_bps)) . $village->code_bps . '@sikades.kalbarprov.app';

            $user = User::factory()->create([
                'name' => $village->name_bps,
                'username' => strtolower(str_replace(' ', '', $village->name_bps)) . $village->code_bps,
                'email' => $email,
                'role' => 'village',
            ]);

            // Insert into user_villages table
            DB::table('user_villages')->insert([
                'user_id' => $user->id,
                'village_id' => $village->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insert data untuk setiap tabel child (tahun 2025)
            $this->seedVillageChildTables($village->id);
        }
    }

    /**
     * Seed data untuk setiap tabel child.
     *
     * @param int $villageId
     */
    private function seedVillageChildTables(int $villageId): void
    {
        $year = '2025'; // Tahun data

        // Data Demografis
        DB::table('village_demographics')->insert([
            'village_id' => $villageId,
            'jumlah_penduduk' => rand(1000, 10000), // Jumlah penduduk antara 1000 dan 10000
            'jumlah_laki_laki' => rand(500, 5000), // Jumlah laki-laki antara 500 dan 5000
            'jumlah_perempuan' => rand(500, 5000), // Jumlah perempuan antara 500 dan 5000
            'jumlah_kepala_keluarga' => rand(200, 2000), // Jumlah kepala keluarga antara 200 dan 2000
            'jumlah_anak_anak' => rand(100, 1000), // Jumlah anak-anak antara 100 dan 1000
            'jumlah_remaja' => rand(100, 1000), // Jumlah remaja antara 100 dan 1000
            'jumlah_dewasa' => rand(500, 5000), // Jumlah dewasa antara 500 dan 5000
            'jumlah_lansia' => rand(100, 1000), // Jumlah lansia antara 100 dan 1000
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Ekonomi
        DB::table('village_economies')->insert([
            'village_id' => $villageId,
            'jumlah_keluarga_miskin' => rand(50, 500), // Jumlah keluarga miskin antara 50 dan 500
            'tingkat_pengangguran' => rand(5, 20), // Tingkat pengangguran antara 5% dan 20%
            'mata_pencaharian_utama' => $this->randomMataPencaharian(), // Mata pencaharian utama acak
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Infrastruktur
        DB::table('village_infrastructures')->insert([
            'village_id' => $villageId,
            'rumah_tangga_listrik' => rand(500, 5000), // Rumah tangga dengan listrik antara 500 dan 5000
            'rumah_tangga_air_bersih' => rand(400, 4000), // Rumah tangga dengan air bersih antara 400 dan 4000
            'kondisi_jalan' => $this->randomKondisiJalan(), // Kondisi jalan acak
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Pendidikan
        DB::table('village_educations')->insert([
            'village_id' => $villageId,
            'jumlah_penduduk_sd' => rand(500, 2000), // Jumlah penduduk SD antara 500 dan 2000
            'jumlah_penduduk_smp' => rand(300, 1500), // Jumlah penduduk SMP antara 300 dan 1500
            'jumlah_penduduk_sma' => rand(200, 1000), // Jumlah penduduk SMA antara 200 dan 1000
            'jumlah_penduduk_pt' => rand(50, 500), // Jumlah penduduk Perguruan Tinggi antara 50 dan 500
            'jumlah_fasilitas_pendidikan' => rand(1, 10), // Jumlah fasilitas pendidikan antara 1 dan 10
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Kesehatan
        DB::table('village_healths')->insert([
            'village_id' => $villageId,
            'jumlah_fasilitas_kesehatan' => rand(1, 5), // Jumlah fasilitas kesehatan antara 1 dan 5
            'jumlah_tenaga_kesehatan' => rand(5, 20), // Jumlah tenaga kesehatan antara 5 dan 20
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Lingkungan
        DB::table('village_environments')->insert([
            'village_id' => $villageId,
            'luas_wilayah' => rand(500, 5000) + (rand(0, 99) / 100), // Luas wilayah antara 500.00 dan 5000.99 hektar
            'jenis_penggunaan_lahan' => $this->randomJenisLahan(), // Jenis penggunaan lahan acak
            'kondisi_lingkungan' => $this->randomKondisiLingkungan(), // Kondisi lingkungan acak
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Kelembagaan
        DB::table('village_institutions')->insert([
            'village_id' => $villageId,
            'jumlah_lembaga_desa' => rand(1, 10), // Jumlah lembaga desa antara 1 dan 10
            'jumlah_kegiatan_lembaga' => rand(5, 50), // Jumlah kegiatan lembaga antara 5 dan 50
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data Pengembangan Desa
        DB::table('village_developments')->insert([
            'village_id' => $villageId,
            'program_pengembangan' => $this->randomProgramPengembangan(), // Program pengembangan acak
            'sumber_pendanaan' => $this->randomSumberPendanaan(), // Sumber pendanaan acak
            'indikator_keberhasilan' => $this->randomIndikatorKeberhasilan(), // Indikator keberhasilan acak
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Data IDM dan Prodeskel
        DB::table('village_idms')->insert([
            'village_id' => $villageId,
            'score_idm' => rand(50, 100), // Skor IDM antara 50 dan 100
            'status_idm' => $this->randomStatusIDM(), // Status IDM acak
            'score_prodeskel' => rand(50, 100), // Skor Prodeskel antara 50 dan 100
            'score_epdeskel' => rand(50, 100), // Skor EPDeskel antara 50 dan 100
            'status' => $this->randomStatusPengembangan(), // Status pengembangan acak
            'classification' => $this->randomKlasifikasi(), // Klasifikasi acak
            'year' => $year,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Fungsi untuk menghasilkan mata pencaharian utama acak.
     *
     * @return string
     */
    private function randomMataPencaharian(): string
    {
        $mataPencaharian = ['Pertanian', 'Nelayan', 'Pedagang', 'PNS', 'Swasta', 'Wiraswasta'];
        return $mataPencaharian[array_rand($mataPencaharian)];
    }

    /**
     * Fungsi untuk menghasilkan kondisi jalan acak.
     *
     * @return string
     */
    private function randomKondisiJalan(): string
    {
        $kondisiJalan = ['Baik', 'Sedang', 'Rusak'];
        return $kondisiJalan[array_rand($kondisiJalan)];
    }

    /**
     * Fungsi untuk menghasilkan jenis penggunaan lahan acak.
     *
     * @return string
     */
    private function randomJenisLahan(): string
    {
        $jenisLahan = ['Pertanian', 'Pemukiman', 'Hutan', 'Perkebunan', 'Tambang'];
        return $jenisLahan[array_rand($jenisLahan)];
    }

    /**
     * Fungsi untuk menghasilkan kondisi lingkungan acak.
     *
     * @return string
     */
    private function randomKondisiLingkungan(): string
    {
        $kondisiLingkungan = ['Bersih', 'Kumuh', 'Rawan Bencana'];
        return $kondisiLingkungan[array_rand($kondisiLingkungan)];
    }

    /**
     * Fungsi untuk menghasilkan program pengembangan acak.
     *
     * @return string
     */
    private function randomProgramPengembangan(): string
    {
        $program = ['Pembangunan Jalan Desa', 'Pembangunan Sekolah', 'Pembangunan Puskesmas', 'Pembangunan Irigasi'];
        return $program[array_rand($program)];
    }

    /**
     * Fungsi untuk menghasilkan sumber pendanaan acak.
     *
     * @return string
     */
    private function randomSumberPendanaan(): string
    {
        $sumber = ['APBD', 'APBN', 'Swadaya Masyarakat', 'CSR Perusahaan'];
        return $sumber[array_rand($sumber)];
    }

    /**
     * Fungsi untuk menghasilkan indikator keberhasilan acak.
     *
     * @return string
     */
    private function randomIndikatorKeberhasilan(): string
    {
        $indikator = [
            'Jalan desa telah dibangun sepanjang 5 km',
            'Sekolah baru telah dibangun',
            'Puskesmas baru telah beroperasi',
            'Irigasi telah diperbaiki',
        ];
        return $indikator[array_rand($indikator)];
    }

    /**
     * Fungsi untuk menghasilkan status IDM acak.
     *
     * @return string
     */
    private function randomStatusIDM(): string
    {
        $status = ['Maju', 'Berkembang', 'Tertinggal'];
        return $status[array_rand($status)];
    }

    /**
     * Fungsi untuk menghasilkan status pengembangan acak.
     *
     * @return string
     */
    private function randomStatusPengembangan(): string
    {
        $status = ['Sedang Berjalan', 'Selesai', 'Tertunda'];
        return $status[array_rand($status)];
    }

    /**
     * Fungsi untuk menghasilkan klasifikasi acak.
     *
     * @return string
     */
    private function randomKlasifikasi(): string
    {
        $klasifikasi = ['Desa Berkembang', 'Desa Maju', 'Desa Tertinggal'];
        return $klasifikasi[array_rand($klasifikasi)];
    }
}