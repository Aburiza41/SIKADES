<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Official;
use App\Models\Organization;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class OrganizationController extends Controller
{
    /**
     * Import and process organization data from Excel file
     *
     * @return void
     */
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        try {
            $filePath = public_path('data/Data_Keanggotaan.xlsx');
            $data = Excel::toCollection(new TestImport, $filePath)->first();

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
            // Stop looping if IDIdentitas is empty
            if (empty($row['idkeanggotaan'])) {
                Log::warning("Stopping loop at row {$index}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$index}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // Validate data
                $validationResult = $this->validateOrganizationData($row);
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

                // Find official
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

                // Find or create organization
                $organization = $this->findOrCreateOrganization(
                    $row['jenisorganisasi'],
                    $row['namaorganisasi']
                );

                if (!$organization) {
                    Log::error("Failed to find or create organization at row {$index}: ID {$row['ididentitas']} - Organization: " . ($row['namaorganisasi'] ?? $row['jenisorganisasi'] ?? '-'));
                    echo "Failed to find or create organization at row {$index}: ID {$row['ididentitas']} - Organization: " . ($row['namaorganisasi'] ?? $row['jenisorganisasi'] ?? '-') . "<br>";
                    $result['failed_count']++;
                    continue;
                }

                // Insert organization data
                $this->insertOrganizationData($official, $organization, $row);
                $result['success_count']++;
                Log::info("Success at row {$index}: ID {$row['ididentitas']} - Organization created successfully (Organization: {$organization->title}" . ($organization->title === 'LAINNYA' ? ", Keterangan: " . ($row['namaorganisasi'] ?? $row['jenisorganisasi'] ?? '-') . ")" : ")"));
                echo "Success at row {$index}: ID {$row['ididentitas']} - Organization created successfully (Organization: {$organization->title}" . ($organization->title === 'LAINNYA' ? ", Keterangan: " . ($row['namaorganisasi'] ?? $row['jenisorganisasi'] ?? '-') . ")" : ")") . "<br>";

            } catch (\Exception $e) {
                Log::error("Error processing row {$index}: {$e->getMessage()}", [
                    'id_identitas' => $row['ididentitas'],
                    'data' => $row,
                    'organization' => isset($organization) ? $organization->toArray() : null,
                    'official' => isset($official) ? $official->toArray() : null
                ]);
                echo "Failed at row {$index}: ID {$row['ididentitas']} - Error: {$e->getMessage()}<br>";
                $result['failed_count']++;
                continue;
            }
        }

        return $result;
    }

    /**
     * Validate organization data from Excel
     *
     * @param array $data
     * @return array
     */
    protected function validateOrganizationData($data)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        if (empty($data['jenisorganisasi']) && empty($data['namaorganisasi'])) {
            return [
                'valid' => false,
                'reason' => 'Missing JenisOrganisasi and NamaOrganisasi'
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
     * Find or create organization based on type and name, fallback to Lainnya if not in predefined categories
     *
     * @param string|null $type
     * @param string|null $name
     * @return \App\Models\Organization|null
     */
    protected function findOrCreateOrganization($type, $name)
    {
        $title = trim($type ?? '');

        // If type is numeric, use name as title
        if (is_numeric($type)) {
            $title = trim($name ?? '');
        }

        // Fallback to 'LAINNYA' if no valid title
        if (empty($title)) {
            $lainnya = Organization::where('title', 'LAINNYA')->first();
            if (!$lainnya) {
                $lainnya = Organization::create([
                    'title' => 'LAINNYA',
                    'description' => 'Lainnya',
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                Log::info("Created 'LAINNYA' organization with title 'LAINNYA'");
            }
            return $lainnya;
        }

        // Predefined organization categories
        $validCategories = [
            'PARPOL' => 'Partai Politik',
            'PROFESI' => 'Profesi',
            'SOSIAL' => 'Sosial'
        ];

        // Normalize title to uppercase for comparison
        $normalizedTitle = strtoupper($title);

        // Check if title matches a predefined category
        if (array_key_exists($normalizedTitle, $validCategories)) {
            $organization = Organization::where('title', $normalizedTitle)->first();
            if ($organization) {
                return $organization;
            }
            // Create organization if it doesn't exist
            $organization = Organization::create([
                'title' => $normalizedTitle,
                'description' => $validCategories[$normalizedTitle],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            Log::info("Created organization with title '{$normalizedTitle}'");
            return $organization;
        }

        // Fallback to 'LAINNYA'
        $lainnya = Organization::where('title', 'LAINNYA')->first();
        if (!$lainnya) {
            $lainnya = Organization::create([
                'title' => 'LAINNYA',
                'description' => 'Lainnya',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            Log::info("Created 'LAINNYA' organization with title 'LAINNYA'");
        }
        return $lainnya;
    }

    /**
     * Insert organization data
     *
     * @param \App\Models\Official $official
     * @param \App\Models\Organization $organization
     * @param array $data
     * @return void
     */
    protected function insertOrganizationData($official, $organization, $data)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $organization, $data) {
                $mulai = $this->parseDateString($data['tanggalmulai'] ?? null);
                $selesai = $this->parseDateString($data['tanggalselesai'] ?? null);

                // Skip invalid dates (0000-00-00)
                if ($mulai && $mulai->format('Y-m-d') === '0000-00-00') {
                    $mulai = null;
                }
                if ($selesai && $selesai->format('Y-m-d') === '0000-00-00') {
                    $selesai = null;
                }

                $insertData = [
                    'official_id' => $official->id,
                    'organization_id' => $organization->id,
                    'nama' => trim($data['namaorganisasi'] ?? '-') ?: '-',
                    'posisi' => trim($data['kedudukan'] ?? null),
                    'mulai' => $mulai ? $mulai->format('Y-m-d') : null,
                    'selesai' => $selesai ? $selesai->format('Y-m-d') : null,
                    'pimpinan' => trim($data['namapimpinan'] ?? null),
                    'alamat' => trim($data['tempat'] ?? null),
                    'keterangan' => $organization->title === 'LAINNYA' ? trim($data['namaorganisasi'] ?? $data['jenisorganisasi'] ?? '-') : null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('official_organizations')->insert($insertData);
            });
        } catch (\Exception $e) {
            Log::error('Insert organization failed', [
                'error' => $e->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'official' => $official->toArray(),
                'organization' => $organization->toArray()
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
            echo "<h3>Officials not found:</h3><ul>";
            foreach ($result['not_found']['officials'] as $item) {
                echo "<li>Row {$item['row']}: {$item['id_identitas']} - {$item['reason']}</li>";
            }
            echo "</ul>";
        }
    }
}
