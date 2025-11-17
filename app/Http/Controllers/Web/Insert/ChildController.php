<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Official;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ChildController extends Controller
{
    /**
     * Import and process child data from Excel file
     *
     * @return void
     */
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        try {
            $filePath = public_path('data/Data_Anak.xlsx');
            if (!file_exists($filePath)) {
                throw new \Exception("Excel file not found at: {$filePath}");
            }

            $data = Excel::toCollection(new TestImport, $filePath)->first();

            if ($data->isEmpty()) {
                throw new \Exception("No data loaded from Excel file. Check TestImport class configuration.");
            }

            $result = $this->processImport($data);

            // Display results
            $this->displayResults($result);
        } catch (\Exception $e) {
            Log::error('Import failed: ' . $e->getMessage());
            echo "<h2>Error</h2><p>Import failed: {$e->getMessage()}</p>";
        }
    }

    /**
     * Process imported data
     *
     * @param \Illuminate\Support\Collection $data
     * @return array
     */
    protected function processImport($data)
    {
        $result = [
            'success_count' => 0,
            'failed_count' => 0,
            'not_found' => [
                'officials' => []
            ]
        ];

        foreach ($data as $index => $row) {
            // Normalize row keys to lowercase
            $row = collect($row)->mapWithKeys(function ($value, $key) {
                return [strtolower($key) => $value];
            })->toArray();

            // Map potential column name variations
            $row['ididentitas'] = $row['ididentitas'] ?? $row['id_identitas'] ?? null;
            $row['tanggal_lahir'] = $row['tanggal_lahir'] ?? $row['tanggal'] ?? null;
            $row['tempat_lahir'] = $row['tempat_lahir'] ?? $row['tempat'] ?? null;
            $row['jeniskelamin'] = $row['jeniskelamin'] ?? $row['jenis_kelamin'] ?? null;
            $row['pendidikan'] = $row['pendidikan'] ?? $row['pendidikan_umum'] ?? null;

            // Stop looping if IDIdentitas is empty
            if (empty($row['ididentitas'])) {
                Log::warning("Stopping loop at row {$index}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$index}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // 1. Validate data
                $validationResult = $this->validateChildData($row);
                if (!$validationResult['valid']) {
                    $result['not_found']['officials'][] = [
                        'row' => $index,
                        'id_identitas' => $row['ididentitas'],
                        'reason' => $validationResult['reason']
                    ];
                    Log::warning("Failed at row {$index}: ID {$row['ididentitas']} - {$validationResult['reason']}");
                    echo "Failed at row {$index}: ID {$row['ididentitas']} - {$validationResult['reason']}<br>";
                    $result['failed_count']++;
                    continue;
                }

                // 2. Find Official
                $official = $this->findOfficial($row['ididentitas']);
                if (!$official) {
                    $result['not_found']['officials'][] = [
                        'row' => $index,
                        'id_identitas' => $row['ididentitas'],
                        'reason' => 'Official not found'
                    ];
                    Log::warning("Failed at row {$index}: ID {$row['ididentitas']} - Official not found");
                    echo "Failed at row {$index}: ID {$row['ididentitas']} - Official not found<br>";
                    $result['failed_count']++;
                    continue;
                }

                // 3. Validate marriage status
                if (!in_array($official->status_perkawinan, ['Kawin', 'Duda', 'Janda'])) {
                    $result['not_found']['officials'][] = [
                        'row' => $index,
                        'id_identitas' => $row['ididentitas'],
                        'reason' => 'Official is not married (status: ' . $official->status_perkawinan . ')'
                    ];
                    Log::warning("Failed at row {$index}: ID {$row['ididentitas']} - Official is not married (status: {$official->status_perkawinan})");
                    echo "Failed at row {$index}: ID {$row['ididentitas']} - Official is not married (status: {$official->status_perkawinan})<br>";
                    $result['failed_count']++;
                    continue;
                }

                // 4. Map Education Level
                $pendidikan = $this->mapEducation($row['pendidikan']);

                // 5. Insert Child Data
                $this->insert($official, $row, $pendidikan);
                $result['success_count']++;
                $logMessage = "Success at row {$index}: ID {$row['ididentitas']} - Child data created successfully (Nama: {$row['nama']}" . (isset($row['tempat_lahir']) && !empty(trim($row['tempat_lahir'])) ? ", Tempat Lahir: {$row['tempat_lahir']}" : "") . ($row['tanggal_lahir'] ? ", Tanggal Lahir: {$row['tanggal_lahir']}" : "") . ", Pendidikan: {$pendidikan})";
                Log::info($logMessage);
                echo $logMessage . "<br>";

            } catch (\Throwable $th) {
                Log::error("Error processing row {$index}: {$th->getMessage()}", [
                    'id_identitas' => $row['ididentitas'],
                    'data' => $row,
                    'official' => isset($official) ? $official->toArray() : null
                ]);
                echo "Failed at row {$index}: ID {$row['ididentitas']} - Error: {$th->getMessage()}<br>";
                $result['failed_count']++;
                continue;
            }
        }

        return $result;
    }

    /**
     * Validate child data from Excel
     *
     * @param array $data
     * @return array
     */
    protected function validateChildData($data)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        if (empty(trim($data['nama'] ?? ''))) {
            return [
                'valid' => false,
                'reason' => 'Missing or empty Nama'
            ];
        }

        if (empty($data['jeniskelamin']) || !in_array(trim($data['jeniskelamin']), ['Laki-laki', 'Perempuan'])) {
            return [
                'valid' => false,
                'reason' => 'Invalid or missing JenisKelamin (must be Laki-laki or Perempuan)'
            ];
        }

        if (empty($data['status']) || !in_array(trim($data['status']), ['Anak Kandung', 'Anak Tiri', 'Anak Angkat'])) {
            return [
                'valid' => false,
                'reason' => 'Invalid or missing Status (must be Anak Kandung, Anak Tiri, or Anak Angkat)'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Find official by identity code
     *
     * @param string|null $idIdentitas
     * @return \App\Models\Official|null
     */
    protected function findOfficial($idIdentitas)
    {
        if (empty($idIdentitas)) {
            return null;
        }

        $cleanId = trim(preg_replace('/\s+/', '', $idIdentitas));
        return Official::where('code_ident', 'like', '%' . $cleanId . '%')->first();
    }

    /**
     * Insert child data
     *
     * @param \App\Models\Official $official
     * @param array $data
     * @param string $pendidikan
     * @return void
     */
    protected function insert($official, $data, $pendidikan)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $data, $pendidikan) {
                $tanggal_lahir = $this->parseDateString($data['tanggal_lahir'] ?? null);

                // Handle missing or empty tempat_lahir
                $tempat_lahir = isset($data['tempat_lahir']) ? trim($data['tempat_lahir']) : (isset($data['tempat']) ? trim($data['tempat']) : '');
                $tempat_lahir = !empty($tempat_lahir) ? strtoupper($tempat_lahir) : null;

                // Map jenis_kelamin
                $jenis_kelamin = trim($data['jeniskelamin']) === 'Laki-laki' ? 'L' : 'P';

                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'jenis_kelamin' => $jenis_kelamin,
                    'nama' => strtoupper(trim($data['nama'])), // Nama is guaranteed non-empty due to validation
                    'tempat_lahir' => $tempat_lahir,
                    'tanggal_lahir' => $tanggal_lahir ? $tanggal_lahir->format('Y-m-d') : null,
                    'status' => trim($data['status']),
                    'pendidikan_umum' => $pendidikan ?? 'Lainnya',
                    'pekerjaan' => strtoupper(trim($data['pekerjaan'] ?? '')) ?: null,
                    'keterangan' => trim($data['keterangan'] ?? '') ?: null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('child_officials')->insert($workPlaceInsert);
            });
        } catch (\Exception $e) {
            Log::error('Insert child data failed', [
                'error' => $e->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'official' => $official->toArray(),
                'pendidikan' => $pendidikan
            ]);
            throw $e;
        }
    }

    /**
     * Parse date string with validation
     *
     * @param mixed $dateString
     * @return \Carbon\Carbon|null
     */
    protected function parseDateString($dateString)
    {
        if (empty($dateString) || $dateString === '0000-00-00') {
            return null;
        }

        $cleanDate = trim($dateString);

        try {
            // Handle Excel numeric date
            if (is_numeric($cleanDate)) {
                $date = Date::excelToDateTimeObject($cleanDate);
                return Carbon::instance($date);
            }

            // Handle string date
            $parsedDate = Carbon::parse($cleanDate);

            // Validate date range for MySQL
            if ($parsedDate->year < 1000 || $parsedDate->year > 9999) {
                return null;
            }

            return $parsedDate;
        } catch (\Exception $e) {
            Log::warning("Failed to parse date: {$cleanDate} - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Display import results
     *
     * @param array $result
     * @return void
     */
    protected function displayResults($result)
    {
        echo "<h2>Import Result</h2>";
        echo "<p>Success: {$result['success_count']}</p>";
        echo "<p>Failed: {$result['failed_count']}</p>";

        if (!empty($result['not_found']['officials'])) {
            echo "<h3>Officials not found or invalid data:</h3><ul>";
            foreach ($result['not_found']['officials'] as $item) {
                echo "<li>Row {$item['row']}: {$item['id_identitas']} - {$item['reason']}</li>";
            }
            echo "</ul>";
        }
    }

    /**
     * Map education level to standardized values
     *
     * @param mixed $value
     * @return string|null
     */
    private function mapEducation($value)
    {
        if (empty($value)) {
            return 'Lainnya';
        }

        $value = strtolower(trim($value));

        $mapping = [
            // Basic education
            'sd' => 'SD/MI',
            'mi' => 'SD/MI',
            'sltp' => 'SMP/MTS/SLTP',
            'smp' => 'SMP/MTS/SLTP',
            'mts' => 'SMP/MTS/SLTP',
            'slta' => 'SMA/SMK/MA/SLTA/SMU',
            'sma' => 'SMA/SMK/MA/SLTA/SMU',
            'smk' => 'SMA/SMK/MA/SLTA/SMU',
            'ma' => 'SMA/SMK/MA/SLTA/SMU',
            'smu' => 'SMA/SMK/MA/SLTA/SMU',
            // Higher education
            'd1' => 'D1',
            'd2' => 'D2',
            'd3' => 'D3',
            'd4' => 'D4',
            's1' => 'S1',
            's2' => 'S2',
            's3' => 'S3'
        ];

        if (array_key_exists($value, $mapping)) {
            return $mapping[$value];
        }

        // Try partial matching
        foreach ($mapping as $key => $label) {
            if (str_contains($value, $key)) {
                return $label;
            }
        }

        return 'Lainnya';
    }
}
