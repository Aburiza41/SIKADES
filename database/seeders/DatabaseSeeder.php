<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Membuat Admin
        User::factory()->create([
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@sikades.kalbarprov.app',
            'role' => 'admin',
        ]);

        // Menjalankan command SyncBpsData
        $this->info('Menjalankan command sinkronisasi data BPS...');
        try {
            Artisan::call('bps:sync');
            $this->info('Sinkronisasi data BPS berhasil.');
        } catch (\Exception $e) {
            $this->error('Gagal menjalankan sinkronisasi data BPS: ' . $e->getMessage());
            Log::error('Gagal menjalankan sinkronisasi data BPS: ' . $e->getMessage());
        }

        // Memanggil seeder lainnya
        $this->call([
            // Tambahkan seeder lain di sini
            UserRegencySeeder::class,
            // UserDistrictSeeder::class,
            UserVillageSeeder::class,

            // PositionSeeder::class, // Tidak perlu dijalankan karena sudah dijalankan di Migration
            OfficialSeeder::class,

            // OrganizationSeeder::class,
            // TrainingSeeder::class,
        ]);
    }

    /**
     * Menampilkan pesan informasi.
     *
     * @param string $message
     */
    protected function info(string $message): void
    {
        $this->command->info($message); // Menggunakan $this->command untuk mengakses metode info
    }

    /**
     * Menampilkan pesan error.
     *
     * @param string $message
     */
    protected function error(string $message): void
    {
        $this->command->error($message); // Menggunakan $this->command untuk mengakses metode error
    }
}
