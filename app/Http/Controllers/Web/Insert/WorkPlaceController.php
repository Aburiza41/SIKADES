<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Official;
use App\Models\Village;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class WorkPlaceController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_TempatKerja.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        // Prepare official data
        $success_count = 0;
        $failed_count = 0;
        $not_found = [
            'officials' => [],
            'villages' => []
        ];

        foreach ($data as $k_workPlace => $v_workPlace) {
            // Stop looping if IDIdentitas is empty
            if (empty($v_workPlace['ididentitas'])) {
                Log::warning("Stopping loop at row {$k_workPlace}: Empty IDIdentitas detected");
                echo "Stopping loop at row {$k_workPlace}: Empty IDIdentitas detected<br>";
                break;
            }

            try {
                // 1. Validate data
                $validationResult = $this->validateWorkPlaceData($v_workPlace);
                if (!$validationResult['valid']) {
                    $not_found['officials'][] = [
                        'row' => $k_workPlace,
                        'id_identitas' => $v_workPlace['ididentitas'],
                        'reason' => $validationResult['reason']
                    ];
                    Log::warning("Failed at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - {$validationResult['reason']}");
                    echo "Failed at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - {$validationResult['reason']}<br>";
                    $failed_count++;
                    continue;
                }

                // 2. Find Official
                $official = $this->findOfficial($v_workPlace['ididentitas']);
                if (!$official) {
                    $not_found['officials'][] = [
                        'row' => $k_workPlace,
                        'id_identitas' => $v_workPlace['ididentitas'],
                        'reason' => 'Official not found'
                    ];
                    Log::warning("Failed at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - Official not found");
                    echo "Failed at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - Official not found<br>";
                    $failed_count++;
                    continue;
                }

                // 3. Get Village from Official
                $village = $official->village;
                $village_status = $village ? true : false;
                $village_name = $village ? null : trim($v_workPlace['kantor']);
                $regency_id = $village ? $official->user_regency_id : null;
                $district_id = $village ? $official->user_district_id : null;

                if (!$village) {
                    $not_found['villages'][] = [
                        'row' => $k_workPlace,
                        'kantor' => $v_workPlace['kantor'],
                        'kec' => $v_workPlace['kec'] ?? '-',
                        'kab' => $v_workPlace['kab'] ?? '-',
                        'reason' => 'Village not found in official record'
                    ];
                    Log::warning("Village not found in official record at row {$k_workPlace}: ID {$v_workPlace['ididentitas']}<br>");
                    echo "Village not found in official record at row {$k_workPlace}: ID {$v_workPlace['ididentitas']}<br>";
                }

                // 4. Insert Work Place
                $this->insertWorkPlace($official, $village, $v_workPlace, $village_status, $village_name, $regency_id, $district_id);
                $success_count++;
                Log::info("Success at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - Work place created successfully" . ($village_status ? "" : " (Village not found in official record, stored in village_name)"));
                echo "Success at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - Work place created successfully" . ($village_status ? "" : " (Village not found in official record, stored in village_name)") . "<br>";

            } catch (\Throwable $th) {
                Log::error("Error processing row {$k_workPlace}: {$th->getMessage()}", [
                    'id_identitas' => $v_workPlace['ididentitas'],
                    'data' => $v_workPlace,
                    'village' => $village ? $village->toArray() : null,
                    'official' => $official ? $official->toArray() : null
                ]);
                echo "Failed at row {$k_workPlace}: ID {$v_workPlace['ididentitas']} - Error: {$th->getMessage()}<br>";
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
     * Validate workplace data from Excel
     */
    protected function validateWorkPlaceData($data)
    {
        if (empty($data['ididentitas'])) {
            return [
                'valid' => false,
                'reason' => 'Missing IDIdentitas'
            ];
        }

        if (empty($data['kantor'])) {
            return [
                'valid' => false,
                'reason' => 'Missing Kantor (village name)'
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
        return Official::with('village.district.regency')->where('code_ident', 'like', '%' . $cleanId . '%')->first();
    }

    /**
     * Insert data tempat kerja
     */
    protected function insertWorkPlace($official, $village, $data, $village_status, $village_name, $regency_id, $district_id)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($official, $village, $data, $village_status, $village_name, $regency_id, $district_id) {
                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'alamat' => strtoupper($data['alamat'] ?? ''),
                    'rt' => is_numeric($data['rt']) ? (int)$data['rt'] : null,
                    'rw' => is_numeric($data['rw']) ? (int)$data['rw'] : null,
                    'kode_pos' => is_numeric($data['pos']) ? $data['pos'] : null,
                    'village_status' => $village_status,
                    'village_name' => $village_name,
                    'village_id' => $village ? $village->id : null,
                    'regency_id' => $regency_id,
                    'district_id' => $district_id,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                DB::table('work_officials')->insert($workPlaceInsert);
            });
        } catch (\Throwable $th) {
            Log::error('Insert workplace failed', [
                'error' => $th->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'official' => $official->toArray(),
                'village' => $village ? $village->toArray() : null,
                'village_status' => $village_status,
                'village_name' => $village_name
            ]);
            throw $th;
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

        if (!empty($not_found['villages'])) {
            echo "<h3>Villages not found in official records:</h3>";
            echo "<ul>";
            foreach ($not_found['villages'] as $item) {
                echo "<li>Row {$item['row']}: {$item['kantor']} (Kec: {$item['kec']}, Kab: {$item['kab']}) - {$item['reason']}</li>";
            }
            echo "</ul>";
        }
    }
}
