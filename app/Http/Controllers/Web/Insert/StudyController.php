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
use App\Models\Position;
use App\Models\Village;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;

class StudyController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_Pendidikan.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();
        // dd($data[0], count($data));
        // Prepare official data
        $success_count = 0;
        $failed_count = 0;
        $not_found = [
            'officials' => [],
            'positions' => []
        ];

        foreach ($data as $k_position => $v_position) {
            try {
                // 1. Find Official
                $official = $this->findOfficial($v_position['ididentitas']);
                if (!$official) {
                    $not_found['officials'][] = [
                        'row' => $k_position,
                        'id_identitas' => $v_position['ididentitas']
                    ];
                    continue;
                }

                // 2. Find Village
                // $jabatan = $this->findJabatan($v_position['namajabatan']);
                // // dd($jabatan);
                // if (!$jabatan) {
                //     $not_found['positions'][] = [
                //         'row' => $k_position,
                //         'kantor' => $v_position['namajabatan']
                //     ];
                //     continue;
                // }
                $pendidikan = $this->mapEducation($v_position['tingkatpendidikan']);

                // dd($jabatan);

                // 3. Insert Work Place
                $this->insert($official, $pendidikan, $v_position);
                $success_count++;
            } catch (\Throwable $th) {
                dd($th);
                Log::error("Error processing row {$k_position}: " . $th->getMessage());
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
    protected function findJabatan($jabatan)
    {
        // dd($jabatan);
        $cleanName = trim($jabatan);
        // dd($cleanName);
        return Position::where(function ($query) use ($cleanName) {
            $query->where('name', 'like', '%' . $cleanName . '%')
                ->orWhere('description', 'like', '%' . $cleanName . '%');
        })
            ->first();
    }

    /**
     * Insert data tempat kerja
     */
    protected function insert($official, $jabatan, $data)
    {
        try {
            // Konversi tanggal dengan validasi
            // $tmtJabatan = $this->parseDateString($data['tmtjabatan'] ?? null);
            $tanggal = $this->parseDateString($data['tanggalijazah'] ?? null);

            // Validasi tanggal wajib
            // if (!$tmtJabatan) {
            //     throw new \Exception("Tanggal TMT Jabatan tidak valid");
            // }

            $workPlaceInsert = [
                'official_id' => $official->id,
                'pendidikan_umum' => $jabatan ?? null,
                'nama_sekolah' => $data['namasekolah'] ?? null,
                'alamat_sekolah' => $data['tempat_sekolah'] ?? null,
                'nomor_ijazah' => $data['noijazah'] ?? null,
                'tanggal' => $tanggal,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];

            DB::table('study_officials')->insert($workPlaceInsert);
        } catch (\Exception $e) {
            Log::error("Gagal insert data jabatan: " . $e->getMessage());
            throw $e; // Re-throw untuk ditangkap di loop utama
        }
    }

    /**
     * Helper untuk parsing tanggal dengan validasi ketat
     */
    protected function parseDateString($dateString)
    {
        if (empty($dateString)) {
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
                echo "<li>Row {$item['row']}: {$item['id_identitas']}</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['positions'])) {
            echo "<h3>positions not found:</h3>";
            echo "<ul>";
            foreach ($not_found['positions'] as $item) {
                echo "<li>Row {$item['row']}: {$item['kantor']}</li>";
            }
            echo "</ul>";
        }
    }

    private function mapEducation($value)
    {
        $value = strtolower(trim($value));

        $mapping = [
            'sd' => 'SD/MI',
            'mi' => 'SD/MI',
            'smp' => 'SMP/MTS',
            'mts' => 'SMP/MTS',
            'sma' => 'SMA/SMK/MA',
            'smk' => 'SMA/SMK/MA',
            'ma' => 'SMA/SMK/MA',
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

        return null;
    }
}
