<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Regency;
use App\Models\District;
use App\Models\Village;
use Illuminate\Http\Client\RequestException;

class SyncBpsData extends Command
{
    protected $signature = 'bps:sync
                            {--retries=3 : Jumlah percobaan ulang}
                            {--timeout=30 : Timeout dalam detik}
                            {--test : Test koneksi tanpa menyimpan data}';

    protected $description = 'Sinkronisasi data wilayah dari API BPS ke database lokal';

    public function handle()
    {
        $this->showHeader();

        try {
            return $this->executeSync();
        } catch (\Throwable $th) {
            $this->logError($th);
            return 2;
        }
    }

    protected function showHeader(): void
    {
        $this->line('');
        $this->line('┌──────────────────────────────────────────┐');
        $this->line('│   🚀 SINKRONISASI DATA WILAYAH BPS       │');
        $this->line('└──────────────────────────────────────────┘');
        $this->line('');
        $this->info('🔧 Konfigurasi:');
        $this->line('- Endpoint: ' . config('services.bps.base_url'));
        $this->line('- Provinsi: ' . config('services.bps.kode_provinsi', '61'));
        $this->line('- Retries: ' . $this->option('retries'));
        $this->line('- Timeout: ' . $this->option('timeout') . 's');
        $this->line('');
    }

    protected function executeSync(): int
    {
        if ($this->option('test')) {
            return $this->testConnection();
        }

        DB::beginTransaction();

        try {
            $this->syncAllLevels();
            DB::commit();
            $this->info("\n🎉 Sinkronisasi berhasil diselesaikan!");
            return 0;
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->error("\n💥 Sinkronisasi gagal: " . $th->getMessage());
            throw $th;
        }
    }

    protected function syncAllLevels(): void
    {
        $provinceCode = config('services.bps.kode_provinsi', '61');
        $baseUrl = config('services.bps.base_url');

        // 1. Sync Kabupaten
        $regencies = $this->fetchApiData($baseUrl, 'kabupaten', $provinceCode);
        $this->syncRegencies($regencies);

        // 2. Sync Kecamatan untuk setiap kabupaten
        foreach ($regencies as $regency) {
            $districts = $this->fetchApiData($baseUrl, 'kecamatan', $regency['kode_bps']);
            $this->syncDistricts($districts, $regency['kode_bps']);

            // 3. Sync Desa untuk setiap kecamatan
            foreach ($districts as $district) {
                $villages = $this->fetchApiData($baseUrl, 'desa', $district['kode_bps']);
                $this->syncVillages($villages, $district['kode_bps']);
            }
        }
    }

    protected function fetchApiData(string $baseUrl, string $level, string $parentCode): array
    {
        $this->info("\n🔍 Mengambil data {$level} untuk parent {$parentCode}...");

        try {
            $response = Http::withOptions([
                    'verify' => config('app.env') === 'production',
                    'timeout' => $this->option('timeout'),
                ])
                ->retry($this->option('retries'), 1000, function ($exception) {
                    return $exception instanceof RequestException;
                })
                ->get($baseUrl, [
                    'level' => $level,
                    'parent' => $parentCode
                ]);

            if ($response->failed()) {
                throw new \Exception("API Error: {$response->status()} - {$response->body()}");
            }

            $data = $response->json();

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON: " . json_last_error_msg());
            }

            if (empty($data)) {
                $this->warn("⚠ Data {$level} kosong");
                return [];
            }

            $this->info("📥 Diterima " . count($data) . " record {$level}");
            return $data;

        } catch (\Exception $e) {
            $this->warn("⚠ Gagal mengambil data {$level}: " . $e->getMessage());
            return $this->getFallbackData($level, $parentCode);
        }
    }

    protected function syncRegencies(array $regencies): void
    {
        if (empty($regencies)) return;

        $bar = $this->output->createProgressBar(count($regencies));
        $bar->start();

        foreach ($regencies as $regency) {
            $this->validateData($regency, ['kode_bps', 'nama_bps']);

            Regency::updateOrCreate(
                ['code_bps' => $regency['kode_bps']],
                [
                    'name_bps' => $regency['nama_bps'],
                    'code_dagri' => $regency['kode_dagri'] ?? null,
                    'name_dagri' => $regency['nama_dagri'] ?? null,
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->info("\n✅ Kabupaten: " . count($regencies) . " record diproses");
    }

    protected function syncDistricts(array $districts, string $regencyCode): void
    {
        if (empty($districts)) return;

        $regency = Regency::where('code_bps', $regencyCode)->first();
        if (!$regency) {
            $this->warn("⚠ Kabupaten {$regencyCode} tidak ditemukan di database");
            return;
        }

        foreach ($districts as $district) {
            $this->validateData($district, ['kode_bps', 'nama_bps']);

            District::updateOrCreate(
                ['code_bps' => $district['kode_bps']],
                [
                    'regency_id' => $regency->id,
                    'name_bps' => $district['nama_bps'],
                    'code_dagri' => $district['kode_dagri'] ?? null,
                    'name_dagri' => $district['nama_dagri'] ?? null,
                ]
            );
        }

        $this->info("✅ Kecamatan: " . count($districts) . " record diproses");
    }

    protected function syncVillages(array $villages, string $districtCode): void
    {
        if (empty($villages)) return;

        $district = District::where('code_bps', $districtCode)->first();
        if (!$district) {
            $this->warn("⚠ Kecamatan {$districtCode} tidak ditemukan di database");
            return;
        }

        foreach ($villages as $village) {
            $this->validateData($village, ['kode_bps', 'nama_bps']);

            Village::updateOrCreate(
                ['code_bps' => $village['kode_bps']],
                [
                    'district_id' => $district->id,
                    'name_bps' => $village['nama_bps'],
                    'code_dagri' => $village['kode_dagri'] ?? null,
                    'name_dagri' => $village['nama_dagri'] ?? null,
                ]
            );
        }

        $this->info("✅ Desa: " . count($villages) . " record diproses");
    }

    protected function validateData(array $data, array $requiredFields): void
    {
        foreach ($requiredFields as $field) {
            if (!array_key_exists($field, $data)) {
                throw new \Exception("Field wajib '{$field}' tidak ditemukan dalam data");
            }

            if (empty($data[$field])) {
                throw new \Exception("Field '{$field}' tidak boleh kosong");
            }
        }
    }

    protected function testConnection(): int
    {
        $this->info("\n🔌 Testing koneksi ke API BPS...");

        try {
            $response = Http::timeout(10)
                ->get(config('services.bps.base_url'));

            if ($response->successful()) {
                $this->info("✅ Koneksi berhasil. Status: " . $response->status());
                return 0;
            }

            $this->error("❌ Koneksi gagal. Status: " . $response->status());
            return 1;

        } catch (\Exception $e) {
            $this->error("❌ Exception: " . $e->getMessage());
            return 2;
        }
    }

    protected function getFallbackData(string $level, string $parentCode): array
    {
        $this->warn("🔄 Menggunakan data fallback untuk {$level}...");

        // Contoh data fallback dasar
        if ($level === 'kabupaten' && $parentCode === '61') {
            return [
                [
                    'kode_bps' => '6101',
                    'nama_bps' => 'KABUPATEN SAMBAS',
                    'kode_dagri' => '61.01',
                    'nama_dagri' => 'SAMBAS'
                ],
                // Tambahkan data lainnya sesuai kebutuhan
            ];
        }

        return [];
    }

    protected function logError(\Throwable $th): void
    {
        Log::error('BPS Sync Failed', [
            'error' => $th->getMessage(),
            'file' => $th->getFile(),
            'line' => $th->getLine(),
            'trace' => $th->getTraceAsString(),
            'config' => config('services.bps')
        ]);

        $this->error("\n📛 Error Details:");
        $this->line("Message: " . $th->getMessage());
        $this->line("Location: " . $th->getFile() . ':' . $th->getLine());
        $this->line("\n🔧 Tips:");
        $this->line("- Periksa koneksi internet");
        $this->line("- Verifikasi URL API di .env (BPS_API_URL)");
        $this->line("- Cek log lengkap di storage/logs/laravel.log");
    }
}
