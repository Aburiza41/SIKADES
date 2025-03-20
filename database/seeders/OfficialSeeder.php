<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class OfficialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Inisialisasi Faker
        $faker = Faker::create('id_ID');

        // Ambil semua desa dan semua posisi
        $villages = DB::table('villages')->get();
        // dd($villages);
        $positions = DB::table('positions')->get();

        // Pastikan ada data dalam tabel
        if ($villages->isEmpty() || $positions->isEmpty()) {
            $this->command->info('Tabel positions atau villages kosong! Silakan isi terlebih dahulu.');
            return;
        }

        // Data dummy untuk variasi
        $statuses = ['Belum Menikah', 'Menikah', 'Cerai', 'Duda', 'Janda'];
        $religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
        $blood_types = ['A', 'B', 'AB', 'O'];
        $educations = ['SD/MI', 'SMP/MTS', 'SMA/SMK/MA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];
        $genders = ['L', 'P'];
        $status_official = ['daftar', 'proses', 'validasi', 'tolak'];

        foreach ($villages as $village) {
            // Ambil kecamatan dan kabupaten berdasarkan desa
            $district = DB::table('districts')->where('id', $village->district_id)->first();
            $regency = DB::table('regencies')->where('id', $district->regency_id ?? null)->first();

            foreach ($positions as $position) {
                // Buat data pejabat (official)
                $official = [
                    'village_id' => $village->id,
                    'nik' => $faker->unique()->numerify('################'), // 16 digit NIK
                    'niad' => $faker->unique()->numerify('##########'), // 10 digit NIAD
                    'nama_lengkap' => $faker->name,
                    'gelar_depan' => null,
                    'gelar_belakang' => null,
                    'tempat_lahir' => $faker->city,
                    'tanggal_lahir' => $faker->dateTimeBetween('-60 years', '-25 years')->format('Y-m-d'), // Usia antara 25-60 tahun
                    'jenis_kelamin' => $faker->randomElement($genders),
                    'status_perkawinan' => $faker->randomElement($statuses),
                    'agama' => $faker->randomElement($religions),
                    'status' => $faker->randomElement($status_official),
                    'user_village_id' => null,
                    'user_district_id' => null,
                    'user_regency_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Insert official ke database
                $official_id = DB::table('officials')->insertGetId($official);

                // Tambahkan alamat pejabat
                DB::table('official_addresses')->insert([
                    'official_id' => $official_id,
                    'alamat' => $faker->address,
                    'rt' => $faker->numberBetween(1, 10),
                    'rw' => $faker->numberBetween(1, 5),
                    'province_code' => '61', // Kode provinsi Kalimantan Barat
                    'province_name' => 'KALIMANTAN BARAT',
                    'regency_code' => $regency->code_bps ?? null,
                    'regency_name' => $regency->name_bps ?? null,
                    'district_code' => $district->code_bps ?? null,
                    'district_name' => $district->name_bps ?? null,
                    'village_code' => $village->code_bps,
                    'village_name' => $village->name_bps,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Tambahkan kontak pejabat
                DB::table('official_contacts')->insert([
                    'official_id' => $official_id,
                    'handphone' => $faker->unique()->numerify('08##########'), // Nomor handphone 12 digit
                    'email' => $faker->unique()->safeEmail,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Tambahkan identitas tambahan pejabat
                DB::table('official_identities')->insert([
                    'official_id' => $official_id,
                    'gol_darah' => $faker->randomElement($blood_types),
                    'pendidikan' => $faker->randomElement($educations),
                    'bpjs_kesehatan' => $faker->unique()->numerify('################'), // 16 digit BPJS Kesehatan
                    'bpjs_ketenagakerjaan' => $faker->unique()->numerify('################'), // 16 digit BPJS Ketenagakerjaan
                    'npwp' => $faker->unique()->numerify('############'), // 12 digit NPWP
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Tambahkan riwayat pendidikan pejabat
                $start_year = (int) date('Y', strtotime($official['tanggal_lahir'])) + 6; // Mulai SD pada usia 6 tahun
                foreach (['SD/MI', 'SMP/MTS', 'SMA/SMK/MA'] as $level) {
                    DB::table('study_officials')->insert([
                        'official_id' => $official_id,
                        'study_id' => DB::table('studies')->where('name', $level)->first()->id ?? null,
                        'nama_sekolah' => 'Sekolah ' . $faker->city,
                        'alamat_sekolah' => $faker->address,
                        'jurusan' => ($level === 'SMA/SMK/MA') ? $faker->randomElement(['IPA', 'IPS', 'Bahasa']) : null,
                        'tahun_masuk' => $start_year,
                        'tahun_keluar' => $start_year + ($level === 'SD/MI' ? 6 : 3),
                        'dokumen' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $start_year += ($level === 'SD/MI' ? 6 : 3);
                }

                // Tambahkan riwayat jabatan pejabat
                $selesai = $faker->optional()->dateTimeBetween('now', '+5 years');

                DB::table('position_officials')->insert([
                    'position_id' => $position->id,
                    'official_id' => $official_id,
                    'penetap' => 'Bupati ' . $faker->city,
                    'nomor_sk' => 'SK-' . $faker->unique()->numerify('##########'), // Contoh: SK-1234567890
                    'tanggal_sk' => $faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
                    'file_sk' => null,
                    'mulai' => $faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
                    'selesai' => $selesai ? $selesai->format('Y-m-d') : null, // Opsional
                    'keterangan' => 'Jabatan resmi desa',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Tambahkan log perubahan status pejabat
                DB::table('official_status_logs')->insert([
                    'official_id' => $official_id,
                    'status_sebelumnya' => null,
                    'status_baru' => $official['status'],
                    'user_id' => DB::table('users')->inRandomOrder()->first()->id ?? null,
                    'keterangan' => 'Pendaftaran awal',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}