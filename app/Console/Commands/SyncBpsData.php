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
                        {--retries=3 : Number of retry attempts}
                        {--timeout=30 : Timeout in seconds}
                        {--test : Test connection without saving data}
                        {--verify : Verify data completeness after sync}
                        {--force : Force sync even if data exists}';

    protected $description = 'Synchronize complete West Kalimantan regional data from BPS API to local database';

    // Complete list of West Kalimantan regencies with their codes
    protected $westKalimantanRegencies = [
        '6101' => 'KABUPATEN SAMBAS',
        '6102' => 'KABUPATEN BENGKAYANG',
        '6103' => 'KABUPATEN LANDAK',
        '6104' => 'KABUPATEN MEMPAWAH',
        '6105' => 'KABUPATEN SANGGAU',
        '6106' => 'KABUPATEN KETAPANG',
        '6107' => 'KABUPATEN SINTANG',
        '6108' => 'KABUPATEN KAPUAS HULU',
        '6109' => 'KABUPATEN SEKADAU',
        '6110' => 'KABUPATEN MELAWI',
        '6111' => 'KABUPATEN KAYONG UTARA',
        '6112' => 'KABUPATEN KUBU RAYA',
        '6171' => 'KOTA PONTIANAK',
        '6172' => 'KOTA SINGKAWANG'
    ];

    public function handle()
    {
        $this->showHeader();

        try {
            $result = $this->executeSync();

            if ($this->option('verify') || $result === 0) {
                $this->verifyDataCompleteness();
            }

            return $result;
        } catch (\Throwable $th) {
            $this->logError($th);
            return 2;
        }
    }

    protected function showHeader(): void
    {
        $this->line('');
        $this->line('┌──────────────────────────────────────────┐');
        $this->line('│   🚀 COMPLETE KALBAR DATA SYNC            │');
        $this->line('└──────────────────────────────────────────┘');
        $this->line('');
        $this->info('🔧 Configuration:');
        $this->line('- Endpoint: ' . config('services.bps.base_url'));
        $this->line('- Province: ' . config('services.bps.kode_provinsi', '61'));
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
            $this->info("\n🎉 Synchronization completed successfully!");
            return 0;
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->error("\n💥 Synchronization failed: " . $th->getMessage());
            throw $th;
        }
    }

    protected function syncAllLevels(): void
    {
        $provinceCode = config('services.bps.kode_provinsi', '61');
        $baseUrl = config('services.bps.base_url');

        // 1. Ensure all regencies exist first
        $this->ensureAllRegenciesExist();

        // 2. Sync data for each regency
        foreach ($this->westKalimantanRegencies as $regencyCode => $regencyName) {
            $this->info("\n🔵 Processing regency: {$regencyName} ({$regencyCode})");

            // Get districts for this regency
            $districts = $this->fetchApiData($baseUrl, 'kecamatan', $regencyCode);
            $this->syncDistricts($districts, $regencyCode);

            // Get villages for each district
            foreach ($districts as $district) {
                $villages = $this->fetchApiData($baseUrl, 'desa', $district['kode_bps']);
                $this->syncVillages($villages, $district['kode_bps']);
            }
        }
    }

    protected function ensureAllRegenciesExist(): void
    {
        $this->info("\n🔍 Verifying all West Kalimantan regencies exist...");

        foreach ($this->westKalimantanRegencies as $code => $name) {
            $regency = Regency::firstOrCreate(
                ['code_bps' => $code],
                [
                    'name_bps' => $name,
                    'code_dagri' => '61.' . substr($code, 2),
                    'name_dagri' => str_replace('KABUPATEN ', '', $name),
                    'code' => str_replace('.', '', '61.' . substr($code, 2))
                ]
            );

            if ($regency->wasRecentlyCreated) {
                $this->line("➕ Created regency: {$name} ({$code})");
            } elseif ($this->option('force')) {
                $regency->update([
                    'name_bps' => $name,
                    'code_dagri' => '61.' . substr($code, 2),
                    'name_dagri' => str_replace('KABUPATEN ', '', $name),
                    'code' => str_replace('.', '', '61.' . substr($code, 2))
                ]);
                $this->line("🔄 Updated regency: {$name} ({$code})");
            }
        }
    }

    protected function fetchApiData(string $baseUrl, string $level, string $parentCode): array
    {
        $this->info("🔍 Fetching {$level} for parent {$parentCode}...");

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
                $this->warn("⚠ No {$level} data received for {$parentCode}");
                return $this->getFallbackData($level, $parentCode);
            }

            $this->info("📥 Received " . count($data) . " {$level} records");
            return $data;

        } catch (\Exception $e) {
            $this->warn("⚠ Failed to fetch {$level} data: " . $e->getMessage());
            return $this->getFallbackData($level, $parentCode);
        }
    }

    protected function syncDistricts(array $districts, string $regencyCode): void
    {
        if (empty($districts)) {
            $this->warn("No district data received for regency {$regencyCode}");
            return;
        }

        $regency = Regency::where('code_bps', $regencyCode)->first();
        if (!$regency) {
            $this->error("Regency {$regencyCode} not found!");
            return;
        }

        $successCount = 0;
        $failCount = 0;

        foreach ($districts as $district) {
            try {
                $this->validateData($district, ['kode_bps', 'nama_bps']);

                $operation = District::updateOrCreate(
                    ['code_bps' => $district['kode_bps']],
                    [
                        'regency_id' => $regency->id,
                        'name_bps' => $district['nama_bps'],
                        'code_dagri' => $district['kode_dagri'] ?? null,
                        'name_dagri' => $district['nama_dagri'] ?? null,
                        'code' => isset($district['kode_dagri']) ? str_replace('.', '', $district['kode_dagri']) : null
                    ]
                );

                $successCount++;
            } catch (\Exception $e) {
                Log::error("District sync failed", [
                    'data' => $district,
                    'error' => $e->getMessage()
                ]);
                $failCount++;
                $this->error("Failed to sync district: " . $e->getMessage());
            }
        }

        $this->info("✅ Districts for {$regencyCode}: {$successCount} succeeded, {$failCount} failed");
    }

    protected function syncVillages(array $villages, string $districtCode): void
    {
        if (empty($villages)) {
            $this->warn("No village data received for district {$districtCode}");
            return;
        }

        $district = District::where('code_bps', $districtCode)->first();
        if (!$district) {
            $this->error("District {$districtCode} not found!");
            return;
        }

        $successCount = 0;
        $failCount = 0;

        foreach ($villages as $village) {
            try {
                $this->validateData($village, ['kode_bps', 'nama_bps']);

                Village::updateOrCreate(
                    ['code_bps' => $village['kode_bps']],
                    [
                        'district_id' => $district->id,
                        'name_bps' => $village['nama_bps'],
                        'code_dagri' => $village['kode_dagri'] ?? null,
                        'name_dagri' => $village['nama_dagri'] ?? null,
                        'code' => isset($village['kode_dagri']) ? str_replace('.', '', $village['kode_dagri']) : null,
                    ]
                );

                $successCount++;
            } catch (\Exception $e) {
                Log::error("Village sync failed", [
                    'data' => $village,
                    'error' => $e->getMessage()
                ]);
                $failCount++;
                $this->error("Failed to sync village: " . $e->getMessage());
            }
        }

        $this->info("✅ Villages for {$districtCode}: {$successCount} succeeded, {$failCount} failed");
    }

    protected function validateData(array $data, array $requiredFields): void
    {
        foreach ($requiredFields as $field) {
            if (!array_key_exists($field, $data)) {
                throw new \Exception("Required field '{$field}' missing in data");
            }

            if (empty($data[$field])) {
                throw new \Exception("Field '{$field}' cannot be empty");
            }
        }

        if (isset($data['kode_bps']) && !preg_match('/^\d+$/', $data['kode_bps'])) {
            throw new \Exception("Invalid BPS code format: " . $data['kode_bps']);
        }
    }

    protected function verifyDataCompleteness(): void
    {
        $this->info("\n🔎 Verifying data completeness for West Kalimantan...");

        // Verify all regencies exist
        $this->verifyRegencies();

        // Verify districts for each regency
        foreach ($this->westKalimantanRegencies as $code => $name) {
            $this->verifyDistrictsForRegency($code);
        }

        $this->info("\n✅ Data verification completed");
    }

    protected function verifyRegencies(): void
    {
        $missing = [];

        foreach ($this->westKalimantanRegencies as $code => $name) {
            if (!Regency::where('code_bps', $code)->exists()) {
                $missing[] = $code;
            }
        }

        if (!empty($missing)) {
            $this->error("Missing regencies: " . implode(', ', $missing));
        } else {
            $this->info("✓ All 14 regencies exist");
        }
    }

    protected function verifyDistrictsForRegency(string $regencyCode): void
    {
        $districts = District::whereHas('regency', function($q) use ($regencyCode) {
            $q->where('code_bps', $regencyCode);
        })->count();

        if ($districts === 0) {
            $this->warn("⚠ No districts found for regency {$regencyCode}");
        } else {
            $this->info("✓ Regency {$regencyCode} has {$districts} districts");
        }
    }

    protected function getFallbackData(string $level, string $parentCode): array
    {
        $fallbackFile = storage_path("bps_fallback/{$parentCode}_{$level}.json");

        if (file_exists($fallbackFile)) {
            $data = json_decode(file_get_contents($fallbackFile), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->info("Using fallback data with " . count($data) . " records");
                return $data;
            }
        }

        $this->warn("No fallback data available for {$level} with parent {$parentCode}");
        return [];
    }

    protected function testConnection(): int
    {
        $this->info("\n🔌 Testing connection to BPS API...");

        try {
            $response = Http::timeout(10)
                ->get(config('services.bps.base_url'));

            if ($response->successful()) {
                $this->info("✅ Connection successful. Status: " . $response->status());
                return 0;
            }

            $this->error("❌ Connection failed. Status: " . $response->status());
            return 1;

        } catch (\Exception $e) {
            $this->error("❌ Exception: " . $e->getMessage());
            return 2;
        }
    }

    protected function logError(\Throwable $th): void
    {
        Log::error('BPS Sync Failed', [
            'error' => $th->getMessage(),
            'file' => $th->getFile(),
            'line' => $th->getLine(),
            'trace' => $th->getTraceAsString()
        ]);

        $this->error("\n📛 Error Details:");
        $this->line("Message: " . $th->getMessage());
        $this->line("Location: " . $th->getFile() . ':' . $th->getLine());
        $this->line("\n🔧 Troubleshooting:");
        $this->line("- Check internet connection");
        $this->line("- Verify API URL in .env (BPS_API_URL)");
        $this->line("- Check complete log at storage/logs/laravel.log");
        $this->line("- Try with --force option to overwrite existing data");
    }
}
