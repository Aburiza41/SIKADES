<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Exception;

class TrainingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainings = [
            ['title' => 'Pelatihan Kepemimpinan', 'description' => 'Pelatihan untuk meningkatkan keterampilan kepemimpinan perangkat desa'],
            ['title' => 'Pelatihan Administrasi Desa', 'description' => 'Meningkatkan kemampuan dalam administrasi desa'],
            ['title' => 'Pelatihan Keuangan Desa', 'description' => 'Mengenai pengelolaan keuangan desa secara transparan'],
            ['title' => 'Pelatihan Teknologi Informasi', 'description' => 'Pengenalan teknologi informasi untuk desa digital'],
            ['title' => 'Pelatihan Manajemen Bencana', 'description' => 'Persiapan dalam menghadapi bencana di desa'],
        ];

        try {
            // Upsert untuk menghindari duplikasi training berdasarkan title
            DB::table('trainings')->upsert($trainings, ['title'], ['description', 'updated_at']);
            $this->command->info('Data trainings berhasil ditambahkan atau diperbarui.');
        } catch (Exception $e) {
            $this->command->error('Gagal menambahkan data trainings: ' . $e->getMessage());
            return;
        }

        $officials = DB::table('officials')->get();
        $trainings = DB::table('trainings')->get();

        if ($officials->isEmpty() || $trainings->isEmpty()) {
            $this->command->info('Tabel officials atau trainings kosong! Silakan isi terlebih dahulu.');
            return;
        }

        try {
            DB::table('officials')->orderBy('id')->chunk(100, function ($officials) use ($trainings) {
                $data = [];

                foreach ($officials as $official) {
                    // Pilih pelatihan secara acak (1-2 pelatihan per official)
                    $assignedTrainings = $trainings->random(rand(1, 2));

                    foreach ($assignedTrainings as $training) {
                        $mulai = Carbon::now()->subMonths(rand(1, 12)); // Acak tanggal mulai
                        $selesai = (clone $mulai)->addDays(rand(3, 10)); // Acak durasi pelatihan

                        $data[] = [
                            'official_id' => $official->id,
                            'training_id' => $training->id,
                            'doc_scan' => null,
                            'nama' => $official->nama_lengkap,
                            'keterangan' => 'Pelatihan diikuti oleh perangkat desa',
                            'mulai' => $mulai->format('Y-m-d'),
                            'selesai' => $selesai->format('Y-m-d'),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }

                if (!empty($data)) {
                    // Upsert untuk menghindari duplikasi data training per official
                    DB::table('official_trainings')->upsert($data, ['official_id', 'training_id'], ['updated_at']);
                }
            });

            $this->command->info('Data official_trainings berhasil ditambahkan atau diperbarui.');
        } catch (Exception $e) {
            $this->command->error('Gagal menambahkan data official_trainings: ' . $e->getMessage());
        }
    }
}
