<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Exception;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organizations = [
            ['title' => 'Karang Taruna', 'description' => 'Organisasi kepemudaan di desa'],
            ['title' => 'PKK', 'description' => 'Pemberdayaan dan kesejahteraan keluarga'],
            ['title' => 'LPM', 'description' => 'Lembaga Pemberdayaan Masyarakat'],
            ['title' => 'BPD', 'description' => 'Badan Permusyawaratan Desa'],
            ['title' => 'RT/RW', 'description' => 'Rukun Tetangga / Rukun Warga'],
        ];

        try {
            // Upsert untuk menghindari duplikasi berdasarkan title
            DB::table('organizations')->upsert($organizations, ['title'], ['description', 'updated_at']);
            $this->command->info('Data organizations berhasil ditambahkan atau diperbarui.');
        } catch (Exception $e) {
            $this->command->error('Gagal menambahkan data organizations: ' . $e->getMessage());
            return;
        }

        $officials = DB::table('officials')->get();
        $organizations = DB::table('organizations')->get();

        if ($officials->isEmpty() || $organizations->isEmpty()) {
            $this->command->info('Tabel officials atau organizations kosong! Silakan isi terlebih dahulu.');
            return;
        }

        try {
            DB::table('officials')->orderBy('id')->chunk(100, function ($officials) use ($organizations) {
                $data = [];

                foreach ($officials as $official) {
                    // Pilih organisasi secara acak (1-2 organisasi per official)
                    $assignedOrganizations = $organizations->random(rand(1, 2));

                    foreach ($assignedOrganizations as $organization) {
                        $data[] = [
                            'official_id' => $official->id,
                            'organization_id' => $organization->id,
                            'doc_scan' => null,
                            'nama' => $official->nama_lengkap ?? 'Tidak Diketahui',
                            'posisi' => 'Anggota',
                            'keterangan' => 'Anggota aktif dalam organisasi',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }

                if (!empty($data)) {
                    // Gunakan upsert untuk menghindari duplikasi pasangan official_id dan organization_id
                    DB::table('official_organizations')->upsert(
                        $data,
                        ['official_id', 'organization_id'],
                        ['updated_at']
                    );
                }
            });

            $this->command->info('Data official_organizations berhasil ditambahkan atau diperbarui.');
        } catch (Exception $e) {
            $this->command->error('Gagal menambahkan data official_organizations: ' . $e->getMessage());
        }
    }
}
