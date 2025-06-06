<?php

namespace App\Http\Controllers;

use App\Imports\TestImport;
use App\Models\Regency;
use App\Models\District;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class TestController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('Data_SIKADES.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath);
        dd($data[2][0], $data[2][1]);

        // Prepare official data
        $success_count = 0;
        foreach ($data[1] as $k_workPlace => $v_workPlace) {
            try {
                // Find Official
                $official = DB::table('officials')->where('code_ident', $v_workPlace['ident_id_values'])->first();

                if ($official == null) {
                    echo "Official not found\n";
                    // Row
                    echo "Row: " . $k_workPlace . "\n";
                    continue;
                }

                // Find Village
                $village = DB::table('villages')->where('name_dagri', $v_workPlace['desa_kantor'])->orWhere('name_bps', $v_workPlace['desa_kantor'])->first();
                if ($village == null) {
                    echo "Village not found\n";
                    // Row
                    echo "Row: " . $k_workPlace . "\n";
                    continue;
                }

                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'alamat' => $v_workPlace['alamat_kerja'],
                    'rt' => $v_workPlace['rt_kerja'],
                    'rw' => $v_workPlace['rw_kerja'],
                    'kode_pos' => $v_workPlace['kode_pos_kerja'],
                    'village_id' => $village->id,
                    'regency_id' => $village->district->regency_id,
                    'district_id' => $village->district_id,
                ];

                DB::table('work_officials')->insert($workPlaceInsert);

                $success_count++;
            } catch (\Throwable $th) {
                //throw $th;

                echo "Error at: ". $th . "\n";
                // Row
                echo "Row: " . $k_workPlace . "\n";
                continue;
            }
        }
    }

    public function workPlace()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('Data_SIKADES.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath);
        // dd($data[1][0], $data[1][1]);

        // Prepare official data
        $success_count = 0;
        foreach ($data[1] as $k_workPlace => $v_workPlace) {
            try {
                // Find Official
                $official = DB::table('officials')->where('code_ident', $v_workPlace['ident_id_values'])->first();

                if ($official == null) {
                    echo "Official not found\n";
                    // Row
                    echo "Row: " . $k_workPlace . "\n";
                    continue;
                }

                // Find Village
                $village = DB::table('villages')->where('name_dagri', $v_workPlace['desa_kantor'])->orWhere('name_bps', $v_workPlace['desa_kantor'])->first();
                if ($village == null) {
                    echo "Village not found\n";
                    // Row
                    echo "Row: " . $k_workPlace . "\n";
                    continue;
                }

                $workPlaceInsert = [
                    'official_id' => $official->id,
                    'alamat' => $v_workPlace['alamat_kerja'],
                    'rt' => $v_workPlace['rt_kerja'],
                    'rw' => $v_workPlace['rw_kerja'],
                    'kode_pos' => $v_workPlace['kode_pos_kerja'],
                    'village_id' => $village->id,
                    'regency_id' => $village->district->regency_id,
                    'district_id' => $village->district_id,
                ];

                DB::table('work_officials')->insert($workPlaceInsert);

                $success_count++;
            } catch (\Throwable $th) {
                //throw $th;

                echo "Error at: ". $th . "\n";
                // Row
                echo "Row: " . $k_workPlace . "\n";
                continue;
            }
        }
    }
}
