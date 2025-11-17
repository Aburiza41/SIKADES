<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Official;
use App\Models\Position;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class PositionController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_Jabatan.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        // Prepare position data
        $success_count = 0;
        $failed_count = 0;
        $not_found = [
            'officials' => []
        ];

        foreach ($data as $k_position => $v_position) {
            // Stop looping if IDIdentitas is empty
            if (empty($v_position['ididentitas'])) {
                Log::warning("Stopping loop at row {$k_position}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$k_position}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // 1. Validate data
                $validationResult = $this->validatePositionData($v_position);
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

                // 3. Find or Create Position
                $position = $this->findOrCreateJabatan($v_position['namajabatan']);
                if (!$position) {
                    Log::error("Failed to find or create position at row {$k_position}: ID {$v_position['ididentitas']} - Position: {$v_position['namajabatan']}");
                    echo "Failed to find or create position at row {$k_position}: ID {$v_position['ididentitas']} - Position: {$v_position['namajabatan']}<br>";
                    $failed_count++;
                    continue;
                }

                // 4. Insert Position
                $this->insert($official, $position, $v_position);
                $success_count++;
                Log::info("Success at row {$k_position}: ID {$v_position['ididentitas']} - Position created successfully (Position: {$position->name}" . ($position->slug === 'lainnya' ? ", Keterangan: {$v_position['namajabatan']})" : ")"));
                echo "Success at row {$k_position}: ID {$v_position['ididentitas']} - Position created successfully (Position: {$position->name}" . ($position->slug === 'lainnya' ? ", Keterangan: {$v_position['namajabatan']})" : ")") . "<br>";

            } catch (\Throwable $th) {
                Log::error("Error processing row {$k_position}: {$th->getMessage()}", [
                    'id_identitas' => $v_position['ididentitas'],
                    'data' => $v_position,
                    'position' => isset($position) ? $position->toArray() : null,
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
     * Validate position data from Excel
     */
    protected function validatePositionData($data)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        if (empty($data['namajabatan'])) {
            return [
                'valid' => false,
                'reason' => 'Missing NamaJabatan'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Mencari official berdasarkan ID identitas
     */
    protected function findOfficial($idIdentitas)
    {
        $cleanId = trim(preg_replace('/\s+/', '', $idIdentitas));
        return Official::where('code_ident', 'like', '%' . $cleanId . '%')->first();
    }

    /**
     * Mencari atau membuat jabatan berdasarkan nama jabatan
     */
    protected function findOrCreateJabatan($jabatan)
    {
        $cleanName = trim(preg_replace('/\s+/', ' ', str_replace(['\'', '"', '/', '\\'], '', $jabatan)));
        $position = Position::where(function ($query) use ($cleanName) {
            $query->where('name', 'like', '%' . $cleanName . '%')
                  ->orWhere('description', 'like', '%' . $cleanName . '%');
        })->first();

        if ($position) {
            return $position;
        }

        // Jika tidak ditemukan, cari atau buat posisi "Lainnya"
        $lainnya = Position::where('slug', 'lainnya')->first();
        if (!$lainnya) {
            $lainnya = Position::create([
                'name' => 'Lainnya',
                'slug' => 'lainnya',
                'description' => 'Lainnya',
                'min' => 1,
                'level' => 1,
                'parent_id' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            Log::info("Created 'Lainnya' position with slug 'lainnya'");
        }

        return $lainnya;
    }

    /**
     * Insert data jabatan
     */
    protected function insert($official, $position, $data)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $position, $data) {
                // Konversi tanggal dengan validasi
                $tmtJabatan = $this->parseDateString($data['tmtjabatan'] ?? null);
                $tanggalSk = $this->parseDateString($data['tanggalsk'] ?? null);

                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'position_id' => $position->id,
                    'penetap' => strtoupper(trim($data['pejabat'] ?? "-")),
                    'nomor_sk' => trim($data['skpelantikan'] ?? "-"),
                    'periode' => trim($data['periode'] ?? "1"),
                    'tmt_jabatan' => $tmtJabatan ? $tmtJabatan->format('Y-m-d') : null,
                    'tanggal_sk' => $tanggalSk ? $tanggalSk->format('Y-m-d') : null,
                    'keterangan' => $position->slug === 'lainnya' ? trim($data['namajabatan'] ?? "-") : trim($data['namajabatan'] ?? "-"),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('position_officials')->insert($workPlaceInsert);
            });
        } catch (\Throwable $th) {
            Log::error('Insert position failed', [
                'error' => $th->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'official' => $official->toArray(),
                'position' => $position->toArray()
            ]);
            throw $th;
        }
    }

    /**
     * Helper untuk parsing tanggal dengan validasi ketat
     */
    protected function parseDateString($dateString)
    {
        if (empty($dateString) || $dateString === '0000-00-00') {
            return null;
        }

        $cleanDate = trim($dateString);

        try {
            // Coba parsing sebagai tanggal Excel (numeric)
            if (is_numeric($cleanDate)) {
                $date = Date::excelToDateTimeObject($cleanDate);
                return Carbon::instance($date);
            }

            // Coba parsing sebagai string tanggal
            $parsedDate = Carbon::createFromFormat('Y-m-d', $cleanDate);

            // Validasi range tanggal untuk MySQL
            if ($parsedDate->year < 1000 || $parsedDate->year > 9999) {
                return null;
            }

            return $parsedDate;
        } catch (\Exception $e) {
            Log::warning("Gagal parsing tanggal: {$cleanDate} - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Menampilkan data yang tidak ditemukan
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
}
