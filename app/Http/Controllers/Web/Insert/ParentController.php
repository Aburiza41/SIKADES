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

class ParentController extends Controller
{
    /**
     * Import and process parent data from Excel file
     *
     * @param string $parent 'Ayah' or 'Ibu'
     * @return void
     */
    public function index($parent)
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        try {
            // Validate parent parameter
            $parent = ucfirst(strtolower($parent));
            if (!in_array($parent, ['Ayah', 'Ibu'])) {
                throw new \Exception("Invalid parent type: {$parent}. Expected 'Ayah' or 'Ibu'.");
            }

            // Determine file path based on parent type
            $filePath = public_path('data/Data_' . $parent . '.xlsx');
            if (!file_exists($filePath)) {
                throw new \Exception("Excel file not found at: {$filePath}");
            }

            $data = Excel::toCollection(new TestImport, $filePath)->first();

            if ($data->isEmpty()) {
                throw new \Exception("No data loaded from Excel file. Check TestImport class configuration.");
            }

            $result = $this->processImport($data, $parent);

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
     * @param string $parent 'Ayah' or 'Ibu'
     * @return array
     */
    protected function processImport($data, $parent)
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
            $row['no_telepon'] = $row['no_telepon'] ?? $row['telpon'] ?? null;
            $row['village_name'] = $row['village_name'] ?? $row['desa'] ?? null;
            $row['district_name'] = $row['district_name'] ?? $row['kec'] ?? null;
            $row['regency_name'] = $row['regency_name'] ?? $row['kab'] ?? null;
            $row['province_name'] = $row['province_name'] ?? $row['prov'] ?? null;
            $row['kode_pos'] = $row['kode_pos'] ?? $row['pos'] ?? null;

            // Stop looping if IDIdentitas is empty
            if (empty($row['ididentitas'])) {
                Log::warning("Stopping loop at row {$index}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$index}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // 1. Validate data
                $validationResult = $this->validateParentData($row, $parent);
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

                // 3. Insert Parent Data
                $this->insert($official, $row, $parent);
                $result['success_count']++;
                $logMessage = "Success at row {$index}: ID {$row['ididentitas']} - Parent data created successfully (Hubungan: {$parent}, Nama: {$row['nama']}" . ($row['tempat'] ? ", Tempat Lahir: {$row['tempat']}" : "") . ($row['tanggal'] ? ", Tanggal Lahir: {$row['tanggal']}" : "") . ")";
                Log::info($logMessage);
                echo $logMessage . "<br>";

            } catch (\Throwable $th) {
                Log::error("Error processing row {$index}: {$th->getMessage()}", [
                    'id_identitas' => $row['ididentitas'],
                    'data' => $row,
                    'official' => isset($official) ? $official->toArray() : null,
                    'parent' => $parent
                ]);
                echo "Failed at row {$index}: ID {$row['ididentitas']} - Error: {$th->getMessage()}<br>";
                $result['failed_count']++;
                continue;
            }
        }

        return $result;
    }

    /**
     * Validate parent data from Excel
     *
     * @param array $data
     * @param string $parent 'Ayah' or 'Ibu'
     * @return array
     */
    protected function validateParentData($data, $parent)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        // Check if nama is empty or contains only whitespace
        if (empty(trim($data['nama'] ?? ''))) {
            return [
                'valid' => false,
                'reason' => 'Missing or empty Nama'
            ];
        }

        // Validate hubungan based on parent parameter or IDAyah
        // if (isset($data['idIbu']) && $parent === 'Ibu') {
        //     return [
        //         'valid' => false,
        //         'reason' => "Invalid hubungan: Expected 'Ibu' but found IDAyah"
        //     ];
        // }
        // if (!isset($data['idayah']) && $parent === 'Ayah') {
        //     return [
        //         'valid' => false,
        //         'reason' => "Invalid hubungan: Expected 'Ayah' but no IDAyah column"
        //     ];
        // }

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
     * Insert parent data
     *
     * @param \App\Models\Official $official
     * @param array $data
     * @param string $parent 'Ayah' or 'Ibu'
     * @return void
     */
    protected function insert($official, $data, $parent)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $data, $parent) {
                $tanggal = $this->parseDateString($data['tanggal'] ?? null);

                // Handle invalid rt values
                $rt = trim($data['rt'] ?? '');
                if ($rt === '-' || !is_numeric($rt)) {
                    $rt = null; // Set to null if invalid, as schema allows nullable rt
                }

                // Handle invalid rw values
                $rw = trim($data['rw'] ?? '');
                if ($rw === '-' || !is_numeric($rw)) {
                    $rw = null; // Set to null if invalid, as schema allows nullable rw
                }

                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'hubungan' => $parent,
                    'nama' => strtoupper(trim($data['nama'])), // Nama is guaranteed non-empty due to validation
                    'tempat_lahir' => strtoupper(trim($data['tempat'] ?? '')) ?: null,
                    'tanggal_lahir' => $tanggal ? $tanggal->format('Y-m-d') : null,
                    'pekerjaan' => strtoupper(trim($data['pekerjaan'] ?? '')) ?: null,
                    'alamat' => strtoupper(trim($data['alamat'] ?? '')) ?: null,
                    'rt' => $rt, // Use processed rt value
                    'rw' => $rw, // Use processed rw value
                    'kode_pos' => trim($data['kode_pos'] ?? $data['pos'] ?? '') ?: null,
                    'province_code' => null, // Not provided in Excel data
                    'province_name' => strtoupper(trim($data['province_name'] ?? $data['prov'] ?? '')) ?: null,
                    'regency_code' => null, // Not provided in Excel data
                    'regency_name' => strtoupper(trim($data['regency_name'] ?? $data['kab'] ?? '')) ?: null,
                    'district_code' => null, // Not provided in Excel data
                    'district_name' => strtoupper(trim($data['district_name'] ?? $data['kec'] ?? '')) ?: null,
                    'village_code' => null, // Not provided in Excel data
                    'village_name' => strtoupper(trim($data['village_name'] ?? $data['desa'] ?? '')) ?: null,
                    'no_telepon' => trim($data['no_telepon'] ?? $data['telpon'] ?? '') ?: null,
                    'keterangan' => trim($data['keterangan'] ?? '') ?: null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('parent_officials')->insert($workPlaceInsert);
            });
        } catch (\Exception $e) {
            Log::error('Insert parent data failed', [
                'error' => $e->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'official' => $official->toArray(),
                'parent' => $parent
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
}
