<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Official;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class StudyController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_Pendidikan.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        // Prepare result data
        $success_count = 0;
        $failed_count = 0;
        $not_found = [
            'officials' => []
        ];

        foreach ($data as $k_position => $v_position) {
            // Stop looping if IDIdentitas is empty
            if (empty($v_position['idpendidikan'])) {
                Log::warning("Stopping loop at row {$k_position}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$k_position}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // 1. Validate data
                $validationResult = $this->validateStudyData($v_position);
                if (!$validationResult['valid']) {
                    $not_found['officials'][] = [
                        'row' => $k_position,
                        'id_identitas' => $v_position['ididentitas'],
                        'reason' => $validationResult['reason']
                    ];
                    Log::warning("Failed at row {$k_position}: ID {$v_position['ididentitas']} - {$validationResult['reason']}");
                    echo "Failed at row {$k_position}: ID {$v_position['ididentitas']} - {$validationResult['reason']}<br>";
                    $failed_count++;
                    continue;
                }

                // 2. Find Official
                $official = $this->findOfficial($v_position['ididentitas']);
                if (!$official) {
                    $not_found['officials'][] = [
                        'row' => $k_position,
                        'id_identitas' => $v_position['ididentitas'],
                        'reason' => 'Official not found'
                    ];
                    Log::warning("Failed at row {$k_position}: ID {$v_position['ididentitas']} - Official not found");
                    echo "Failed at row {$k_position}: ID {$v_position['ididentitas']} - Official not found<br>";
                    $failed_count++;
                    continue;
                }

                // 3. Map Education Level
                $pendidikan = $this->mapEducation($v_position['tingkatpendidikan']);

                // 4. Insert Study Data
                $this->insert($official, $pendidikan, $v_position);
                $success_count++;
                Log::info("Success at row {$k_position}: ID {$v_position['ididentitas']} - Study data created successfully (Pendidikan: {$pendidikan}" . ($pendidikan === 'Lainnya' ? ", Keterangan: {$v_position['tingkatpendidikan']})" : ")"));
                echo "Success at row {$k_position}: ID {$v_position['ididentitas']} - Study data created successfully (Pendidikan: {$pendidikan}" . ($pendidikan === 'Lainnya' ? ", Keterangan: {$v_position['tingkatpendidikan']})" : ")") . "<br>";

            } catch (\Throwable $th) {
                Log::error("Error processing row {$k_position}: {$th->getMessage()}", [
                    'id_identitas' => $v_position['ididentitas'],
                    'data' => $v_position,
                    'official' => isset($official) ? $official->toArray() : null
                ]);
                echo "Failed at row {$k_position}: ID {$v_position['ididentitas']} - Error: {$th->getMessage()}<br>";
                $failed_count++;
                continue;
            }
        }

        // Display results
        echo "<h2>Import Result</h2>";
        echo "<p>Success: {$success_count}</p>";
        echo "<p>Failed: {$failed_count}</p>";

        // Display not found data
        $this->displayNotFound($not_found);
    }

    /**
     * Validate study data from Excel
     */
    protected function validateStudyData($data)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        if (empty($data['tingkatpendidikan'])) {
            return [
                'valid' => false,
                'reason' => 'Missing TingkatPendidikan'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Find official by identity code
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
     * Insert study data
     */
    protected function insert($official, $pendidikan, $data)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $pendidikan, $data) {
                // Parse date with validation
                $tanggal = $this->parseDateString($data['tanggalijazah'] ?? null);

                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'pendidikan_umum' => $pendidikan ?? 'Lainnya',
                    'nama_sekolah' => strtoupper(trim($data['namasekolah'] ?? '')) ?: null,
                    'alamat_sekolah' => strtoupper(trim($data['tempat_sekolah'] ?? '')) ?: null,
                    'nomor_ijazah' => trim($data['noijazah'] ?? '') ?: null,
                    'tanggal' => $tanggal ? $tanggal->format('Y-m-d') : null,
                    'dokumen' => $data['ijazah'] ?? null,
                    'keterangan' => $pendidikan === 'Lainnya' ? trim($data['tingkatpendidikan'] ?? '-') : null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('study_officials')->insert($workPlaceInsert);
            });
        } catch (\Exception $e) {
            Log::error('Insert study data failed', [
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
     * Helper for parsing date with strict validation
     */
    protected function parseDateString($dateString)
    {
        if (empty($dateString) || $dateString === '0000-00-00') {
            return null;
        }

        $cleanDate = trim($dateString);

        try {
            // Try parsing as Excel numeric date
            if (is_numeric($cleanDate)) {
                $date = Date::excelToDateTimeObject($cleanDate);
                return Carbon::instance($date);
            }

            // Try parsing as string date
            $parsedDate = Carbon::createFromFormat('Y-m-d', $cleanDate);

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
     * Display not found data
     */
    protected function displayNotFound($not_found)
    {
        if (!empty($not_found['officials'])) {
            echo "<h3>Officials not found:</h3>";
            echo "<ul>";
            foreach ($not_found['officials'] as $item) {
                echo "<li>Row {$item['row']}: {$item['id_identitas']} - {$item['reason']}</li>";
            }
            echo "</ul>";
        }
    }

    /**
     * Map education level to standardized values
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
            'sltp' => 'SMP/MTS/SLTP',  // Added SLTP variant
            'smp' => 'SMP/MTS/SLTP',
            'mts' => 'SMP/MTS/SLTP',
            'slta' => 'SMA/SMK/MA/SLTA/SMU',  // Added SLTA variant
            'sma' => 'SMA/SMK/MA/SLTA/SMU',
            'smk' => 'SMA/SMK/MA/SLTA/SMU',
            'ma' => 'SMA/SMK/MA/SLTA/SMU',

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
