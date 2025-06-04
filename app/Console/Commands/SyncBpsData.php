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
                        {--verify : Verify data completeness after sync}';

    protected $description = 'Synchronize regional data from BPS API to local database with complete West Kalimantan coverage';

    // Expected counts for West Kalimantan (61)
    protected $expectedCounts = [
        'regencies' => 14, // 12 kabupaten + 2 kota
        'districts' => 174,
        'villages' => 2031
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
        $this->line('│   🚀 ENHANCED BPS DATA SYNC (KALBAR)      │');
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

        // 1. Sync Regencies
        $regencies = $this->fetchApiData($baseUrl, 'kabupaten', $provinceCode);
        $this->syncRegencies($regencies);

        // 2. Sync Districts for each regency
        $regencyCodes = collect($regencies)->pluck('kode_bps');
        foreach ($regencyCodes as $regencyCode) {
            $districts = $this->fetchApiData($baseUrl, 'kecamatan', $regencyCode);
            $this->syncDistricts($districts, $regencyCode);

            // 3. Sync Villages for each district
            $districtCodes = collect($districts)->pluck('kode_bps');
            foreach ($districtCodes as $districtCode) {
                $villages = $this->fetchApiData($baseUrl, 'desa', $districtCode);
                $this->syncVillages($villages, $districtCode);
            }
        }
    }

    protected function fetchApiData(string $baseUrl, string $level, string $parentCode): array
    {
        $this->info("\n🔍 Fetching {$level} data for parent {$parentCode}...");

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
                $this->warn("⚠ No {$level} data received");
                return $this->getFallbackData($level, $parentCode);
            }

            $this->info("📥 Received " . count($data) . " {$level} records");
            return $data;

        } catch (\Exception $e) {
            $this->warn("⚠ Failed to fetch {$level} data: " . $e->getMessage());
            return $this->getFallbackData($level, $parentCode);
        }
    }

    protected function syncRegencies(array $regencies): void
    {
        if (empty($regencies)) {
            $this->warn("No regency data to process");
            return;
        }

        $bar = $this->output->createProgressBar(count($regencies));
        $bar->start();

        $successCount = 0;
        $failCount = 0;

        foreach ($regencies as $regency) {
            try {
                $this->validateData($regency, ['kode_bps', 'nama_bps']);

                Regency::updateOrCreate(
                    ['code_bps' => $regency['kode_bps']],
                    [
                        'name_bps' => $regency['nama_bps'],
                        'code_dagri' => $regency['kode_dagri'] ?? null,
                        'name_dagri' => $regency['nama_dagri'] ?? null,
                    ]
                );
                $successCount++;
            } catch (\Exception $e) {
                Log::error("Regency sync failed", [
                    'data' => $regency,
                    'error' => $e->getMessage()
                ]);
                $failCount++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->info("\n✅ Regencies: {$successCount} succeeded, {$failCount} failed");
    }

    protected function syncDistricts(array $districts, string $regencyCode): void
    {
        if (empty($districts)) {
            $this->warn("No district data to process for regency {$regencyCode}");
            return;
        }

        $regency = Regency::where('code_bps', $regencyCode)->first();
        if (!$regency) {
            $this->warn("⚠ Regency {$regencyCode} not found in database");
            return;
        }

        $successCount = 0;
        $failCount = 0;

        foreach ($districts as $district) {
            try {
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
                $successCount++;
            } catch (\Exception $e) {
                Log::error("District sync failed", [
                    'data' => $district,
                    'error' => $e->getMessage()
                ]);
                $failCount++;
            }
        }

        $this->info("✅ Districts for {$regencyCode}: {$successCount} succeeded, {$failCount} failed");
    }

    protected function syncVillages(array $villages, string $districtCode): void
    {
        if (empty($villages)) {
            $this->warn("No village data to process for district {$districtCode}");
            return;
        }

        $district = District::where('code_bps', $districtCode)->first();
        if (!$district) {
            $this->warn("⚠ District {$districtCode} not found in database");
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
                    ]
                );
                $successCount++;
            } catch (\Exception $e) {
                Log::error("Village sync failed", [
                    'data' => $village,
                    'error' => $e->getMessage()
                ]);
                $failCount++;
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

        // Additional validation for BPS codes
        if (isset($data['kode_bps'])) {
            if (!preg_match('/^\d+$/', $data['kode_bps'])) {
                throw new \Exception("Invalid BPS code format: " . $data['kode_bps']);
            }
        }
    }

    protected function verifyDataCompleteness(): void
    {
        $this->info("\n🔎 Verifying data completeness for West Kalimantan...");

        // Verify regencies
        $actualRegencies = Regency::where('code_bps', 'like', '61%')->count();
        $this->checkCount('regencies', $actualRegencies, $this->expectedCounts['regencies']);

        // Verify districts
        $actualDistricts = District::whereHas('regency', function($q) {
            $q->where('code_bps', 'like', '61%');
        })->count();
        $this->checkCount('districts', $actualDistricts, $this->expectedCounts['districts']);

        // Verify villages
        $actualVillages = Village::whereHas('district.regency', function($q) {
            $q->where('code_bps', 'like', '61%');
        })->count();
        $this->checkCount('villages', $actualVillages, $this->expectedCounts['villages']);

        $this->info("\n✅ Data verification completed");
    }

    protected function checkCount(string $type, int $actual, int $expected): void
    {
        if ($actual < $expected) {
            $this->warn("⚠ {$type}: {$actual}/{$expected} (missing " . ($expected - $actual) . ")");
            $this->logMissingData($type);
        } elseif ($actual > $expected) {
            $this->warn("⚠ {$type}: {$actual}/{$expected} (extra " . ($actual - $expected) . ")");
        } else {
            $this->info("✓ {$type}: Complete ({$actual}/{$expected})");
        }
    }

    protected function logMissingData(string $type): void
    {
        switch ($type) {
            case 'regencies':
                $expectedCodes = $this->getExpectedRegencyCodes();
                $existingCodes = Regency::where('code_bps', 'like', '61%')
                    ->pluck('code_bps')
                    ->toArray();
                $missing = array_diff($expectedCodes, $existingCodes);
                break;

            case 'districts':
                // Similar logic for districts
                break;

            case 'villages':
                // Similar logic for villages
                break;
        }

        if (!empty($missing)) {
            Log::warning("Missing {$type}", ['codes' => $missing]);
            $this->warn("Missing codes: " . implode(', ', $missing));
        }
    }

    protected function getExpectedRegencyCodes(): array
    {
        return [
            '6101', // Kabupaten Sambas
            '6102', // Kabupaten Bengkayang
            '6103', // Kabupaten Landak
            '6104', // Kabupaten Mempawah
            '6105', // Kabupaten Sanggau
            '6106', // Kabupaten Ketapang
            '6107', // Kabupaten Sintang
            '6108', // Kabupaten Kapuas Hulu
            '6109', // Kabupaten Sekadau
            '6110', // Kabupaten Melawi
            '6111', // Kabupaten Kayong Utara
            '6112', // Kabupaten Kubu Raya
            '6171', // Kota Pontianak
            '6172', // Kota Singkawang
        ];
    }

    protected function getFallbackData(string $level, string $parentCode): array
    {
        $this->warn("🔄 Using fallback data for {$level} with parent {$parentCode}...");

        $fallbackFile = storage_path("bps_fallback/{$parentCode}_{$level}.json");

        if (file_exists($fallbackFile)) {
            $data = json_decode(file_get_contents($fallbackFile), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->info("Loaded " . count($data) . " fallback records");
                return $data;
            }
        }

        // Minimal fallback for demo purposes
        if ($level === 'kabupaten' && $parentCode === '61') {
            return [
                [
                    'kode_bps' => '6101',
                    'nama_bps' => 'KABUPATEN SAMBAS',
                    'kode_dagri' => '61.01',
                    'nama_dagri' => 'SAMBAS'
                ],
                // Add all West Kalimantan regencies here
            ];
        }

        $this->warn("⚠ No fallback data available for {$level} with parent {$parentCode}");
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
            'trace' => $th->getTraceAsString(),
            'config' => config('services.bps')
        ]);

        $this->error("\n📛 Error Details:");
        $this->line("Message: " . $th->getMessage());
        $this->line("Location: " . $th->getFile() . ':' . $th->getLine());
        $this->line("\n🔧 Troubleshooting:");
        $this->line("- Check internet connection");
        $this->line("- Verify API URL in .env (BPS_API_URL)");
        $this->line("- Check complete log at storage/logs/laravel.log");
        $this->line("- Consider using --verify option to check data completeness");
    }
}
