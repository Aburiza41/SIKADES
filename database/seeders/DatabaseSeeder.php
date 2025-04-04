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
        $this->createAdminUser();
        $this->runBpsSyncCommand();
        $this->runOtherSeeders();
    }

    protected function createAdminUser(): void
    {
        try {
            User::factory()->create([
                'name' => 'Admin',
                'username' => 'admin',
                'email' => 'admin@sikades.kalbarprov.app',
                'role' => 'admin',
            ]);
            $this->info('✅ User admin berhasil dibuat');
        } catch (\Exception $e) {
            $this->error('❌ Gagal membuat user admin: ' . $e->getMessage());
            Log::error('Admin user creation failed', ['error' => $e]);
        }
    }

    protected function runBpsSyncCommand(): void
    {
        $this->info("\n🔄 Memulai sinkronisasi data BPS...");

        try {
            $exitCode = Artisan::call('bps:sync', [], $this->command->getOutput());

            if ($exitCode === 0) {
                $this->info('🎉 Sinkronisasi BPS berhasil!');
            } else {
                $this->error("⚠ Sinkronisasi BPS gagal dengan kode error: $exitCode");
                $this->warn('➡ Lihat log terakhir untuk detail error:');
                $this->line('   tail -f storage/logs/laravel.log');
            }
        } catch (\Exception $e) {
            $this->error('❌ Exception saat menjalankan sync: ' . $e->getMessage());
            Log::error('BPS Sync Command Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    protected function runOtherSeeders(): void
    {
        $this->info("\n🌱 Menjalankan seeder tambahan...");

        $seeders = [
            UserRegencySeeder::class,
            UserVillageSeeder::class,
            OfficialSeeder::class,
        ];

        foreach ($seeders as $seeder) {
            try {
                $this->call($seeder);
                $this->info("✅ $seeder berhasil dijalankan");
            } catch (\Exception $e) {
                $this->error("❌ Gagal menjalankan $seeder: " . $e->getMessage());
            }
        }
    }

    // Helper methods untuk output konsisten
    protected function info(string $message): void
    {
        $this->command->getOutput()->writeln("<info>$message</info>");
    }

    protected function error(string $message): void
    {
        $this->command->getOutput()->writeln("<error>$message</error>");
    }

    protected function warn(string $message): void
    {
        $this->command->getOutput()->writeln("<comment>$message</comment>");
    }

    protected function line(string $message): void
    {
        $this->command->getOutput()->writeln($message);
    }
}
