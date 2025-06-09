<?php

namespace App\Http\Controllers\Web\Insert;

use App\Http\Controllers\Controller;
use App\Imports\TestImport;
use App\Models\Regency;
use App\Models\District;
use App\Models\Official;
use App\Models\OfficialAddress;
use App\Models\OfficialContact;
use App\Models\OfficialIdentity;
use App\Models\OfficialStatusLog;
use App\Models\Village;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;

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
            try {
                // 1. Find Official
                $official = $this->findOfficial($v_workPlace['ididentitas']);
                if (!$official) {
                    $not_found['officials'][] = [
                        'row' => $k_workPlace,
                        'id_identitas' => $v_workPlace['ididentitas']
                    ];
                    continue;
                }

                // 2. Find Village
                $village = $this->findVillage($v_workPlace['kantor']);
                if (!$village) {
                    $not_found['villages'][] = [
                        'row' => $k_workPlace,
                        'kantor' => $v_workPlace['kantor']
                    ];
                    continue;
                }

                // 3. Insert Work Place
                $this->insertWorkPlace($official, $village, $v_workPlace);
                $success_count++;

            } catch (\Throwable $th) {
                Log::error("Error processing row {$k_workPlace}: " . $th->getMessage());
                $failed_count++;
                continue;
            }
        }

        // Tampilkan hasil proses
        echo "<h2>Import Result</h2>";
        echo "<p>Success: {$success_count}</p>";
        echo "<p>Failed: {$failed_count}</p>";

        // Tampilkan data yang tidak ditemukan
        $this->displayNotFound($not_found);
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
     * Mencari village berdasarkan nama kantor
     */
    protected function findVillage($kantorName)
    {
        $cleanName = trim($kantorName);
        return Village::with('district')
            ->where(function($query) use ($cleanName) {
                $query->where('name_bps', 'like', '%' . $cleanName . '%')
                      ->orWhere('name_dagri', 'like', '%' . $cleanName . '%');
            })
            ->first();
    }

    /**
     * Insert data tempat kerja
     */
    protected function insertWorkPlace($official, $village, $data)
    {
        $workPlaceInsert = [
            'official_id' => $official->id,
            'alamat' => $data['alamat'],
            'rt' => $data['rt'],
            'rw' => $data['rw'],
            'kode_pos' => $data['pos'],
            'village_id' => $village->id,
            'regency_id' => $village->district->regency_id,
            'district_id' => $village->district_id,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];

        DB::table('work_officials')->insert($workPlaceInsert);
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
                echo "<li>Row {$item['row']}: {$item['id_identitas']}</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['villages'])) {
            echo "<h3>Villages not found:</h3>";
            echo "<ul>";
            foreach ($not_found['villages'] as $item) {
                echo "<li>Row {$item['row']}: {$item['kantor']}</li>";
            }
            echo "</ul>";
        }
    }
}
