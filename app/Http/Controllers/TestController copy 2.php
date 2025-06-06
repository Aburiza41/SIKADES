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
    protected $bpsBaseUrl;
    protected $agamaOptions = [
        'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'
    ];

    public function __construct()
    {
        $this->bpsBaseUrl = config('services.bps.base_url');
    }

    public function index(Request $request)
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('Data_SIKADES.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        $totalData = $data->count();
        $processed = 0;
        $successCount = 0;
        $failedData = [];

        foreach ($data as $row) {
            $processed++;

            if ($processed % 100 === 0) {
                $progress = round(($processed / $totalData) * 100, 2);
                echo "\nProcessing: {$progress}% ({$processed}/{$totalData})\n";
                flush();
                ob_flush();
            }

            try {
                // Convert row to array and clean data
                $rowData = $this->cleanRowData($row->toArray());

                // Validate village_id
                if (empty($rowData['village_id']) || strlen((string)$rowData['village_id']) !== 10) {
                    throw new \Exception("Invalid village_id format");
                }

                $villageCode = $this->convertVillageId($rowData['village_id']);
                if (!$villageCode) {
                    throw new \Exception("Invalid village_id conversion");
                }

                // Handle village creation if not exists
                $village = Village::where('code_dagri', $villageCode)->first();
                if (!$village) {
                    $village = $this->findOrCreateVillage($villageCode, $rowData['village_id']);
                    if (!$village) {
                        throw new \Exception("Failed to create village");
                    }
                }

                // Prepare official data with proper validation
                $officialData = [
                    'village_id' => $village->id,
                    'nik' => $this->cleanNumber($rowData['nik'] ?? null),
                    'code_ident' => $this->cleanString($rowData['id_ident'] ?? null),
                    'nipd' => $this->cleanString($rowData['no_induk'] ?? null),
                    'nama_lengkap' => $this->cleanString($rowData['nama_lengkap'] ?? null),
                    'gelar_depan' => $this->cleanString($rowData['gelar_dpn'] ?? null),
                    'gelar_belakang' => $this->cleanString($rowData['gelar_blkng'] ?? null),
                    'tempat_lahir' => $this->cleanString($rowData['tmpt_lahir'] ?? null),
                    'tanggal_lahir' => $this->parseDate($rowData['tgl_lahir'] ?? null),
                    'jenis_kelamin' => $this->mapGender($rowData['jenis_kelamin'] ?? null),
                    'agama' => $this->validateAgama($rowData['agama'] ?? null),
                    'status_perkawinan' => $this->mapMaritalStatus($rowData['status_perkawinan'] ?? null),
                    'status' => 'daftar',
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                // Validate required fields
                if (empty($officialData['nama_lengkap']) || empty($officialData['nik'])) {
                    throw new \Exception("Missing required fields (nama_lengkap or nik)");
                }

                DB::table('officials')->insert($officialData);
                $successCount++;

            } catch (\Throwable $th) {
                $failedData[] = [
                    'row_data' => $row->toArray(),
                    'error' => $th->getMessage()
                ];
                \Log::error("Failed to import row {$processed}: " . $th->getMessage());
            }
        }

        $this->saveFailedData($failedData);
        return $this->generateImportReport($totalData, $successCount, $failedData);
    }

    protected function cleanRowData(array $rowData)
    {
        // Remove any empty or malformed values
        return array_map(function ($value) {
            if (is_string($value)) {
                $value = trim($value);
                return $value === '' ? null : $value;
            }
            return $value;
        }, $rowData);
    }

    protected function cleanString($value)
    {
        if ($value === null) return null;

        // Remove any special characters that might cause SQL issues
        $value = trim($value);
        $value = str_replace(["'", "\"", "\\", "\0"], "", $value);

        return empty($value) ? null : $value;
    }

    protected function cleanNumber($value)
    {
        if ($value === null) return null;

        // Remove any non-numeric characters
        $value = preg_replace('/[^0-9]/', '', $value);
        return empty($value) ? null : $value;
    }

    protected function parseDate($dateValue)
    {
        if (empty($dateValue)) return null;

        try {
            // Handle Excel date values
            if (is_numeric($dateValue)) {
                return Date::excelToDateTimeObject($dateValue);
            }

            // Handle string dates
            if (is_string($dateValue)) {
                // Skip invalid dates like "0000-00-00"
                if ($dateValue === '0000-00-00') return null;

                return Carbon::parse($dateValue);
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function validateAgama($agama)
    {
        if (empty($agama)) return 'Lainnya';

        $agama = ucfirst(strtolower(trim($agama)));

        // Handle common variations
        $variations = [
            'Budha' => 'Buddha',
            'Protestan' => 'Kristen',
            'Khonghucu' => 'Konghucu'
        ];

        if (array_key_exists($agama, $variations)) {
            $agama = $variations[$agama];
        }

        if (!in_array($agama, $this->agamaOptions)) {
            return 'Lainnya';
        }

        return $agama;
    }

    protected function mapGender($gender)
    {
        if (empty($gender)) return null;

        $gender = strtolower(trim($gender));
        if (strpos($gender, 'laki') !== false) return 'L';
        if (strpos($gender, 'perempuan') !== false) return 'P';
        return null;
    }

    protected function mapMaritalStatus($status)
    {
        if (empty($status)) return null;

        $status = strtolower(trim($status));
        if (strpos($status, 'kawin') !== false) return 'Kawin';
        if (strpos($status, 'belum') !== false) return 'Belum Kawin';
        if (strpos($status, 'duda') !== false) return 'Duda';
        if (strpos($status, 'janda') !== false) return 'Janda';
        return $status;
    }

    protected function findOrCreateVillage(string $villageCode, string $originalId)
    {
        $parts = explode('.', $villageCode);
        if (count($parts) !== 4) {
            throw new \Exception("Invalid village code format");
        }

        [$provinceCode, $regencyCode, $districtCode, $villageLocalCode] = $parts;

        // 1. Handle Regency
        $regency = Regency::where('code_dagri', "{$provinceCode}.{$regencyCode}")->first();
        if (!$regency) {
            $regency = $this->fetchAndCreateRegency($provinceCode, $regencyCode);
            if (!$regency) {
                throw new \Exception("Failed to create regency");
            }
        }

        // 2. Handle District
        $district = District::where('code_dagri', "{$provinceCode}.{$regencyCode}.{$districtCode}")->first();
        if (!$district) {
            $district = $this->fetchAndCreateDistrict($regency, $districtCode);
            if (!$district) {
                throw new \Exception("Failed to create district");
            }
        }

        // 3. Handle Village
        $village = Village::updateOrCreate(
            ['code_dagri' => $villageCode],
            [
                'district_id' => $district->id,
                'code_bps' => $district->code_bps . substr($villageLocalCode, 0, 4),
                'name_bps' => 'UNKNOWN',
                'name_dagri' => 'UNKNOWN',
                'original_id' => $originalId
            ]
        );

        return $village;
    }

    protected function fetchAndCreateRegency($provinceCode, $regencyCode)
    {
        try {
            $bpsCode = $provinceCode . substr($regencyCode, 0, 2);

            $response = Http::get($this->bpsBaseUrl, [
                'level' => 'kabupaten',
                'parent' => $provinceCode
            ]);

            $name = 'UNKNOWN';
            if ($response->successful()) {
                $data = $response->json();
                foreach ($data as $item) {
                    if ($item['kode_bps'] == $bpsCode) {
                        $name = $item['nama_bps'] ?? 'UNKNOWN';
                        break;
                    }
                }
            }

            return Regency::create([
                'code_bps' => $bpsCode,
                'name_bps' => $name,
                'code_dagri' => "{$provinceCode}.{$regencyCode}",
                'name_dagri' => $name
            ]);

        } catch (\Exception $e) {
            \Log::error("Regency creation failed: " . $e->getMessage());
            return null;
        }
    }

    protected function fetchAndCreateDistrict(Regency $regency, $districtCode)
    {
        try {
            $bpsCode = $regency->code_bps . substr($districtCode, 0, 3);

            $response = Http::get($this->bpsBaseUrl, [
                'level' => 'kecamatan',
                'parent' => $regency->code_bps
            ]);

            $name = 'UNKNOWN';
            if ($response->successful()) {
                $data = $response->json();
                foreach ($data as $item) {
                    if ($item['kode_bps'] == $bpsCode) {
                        $name = $item['nama_bps'] ?? 'UNKNOWN';
                        break;
                    }
                }
            }

            return District::create([
                'regency_id' => $regency->id,
                'code_bps' => $bpsCode,
                'name_bps' => $name,
                'code_dagri' => $regency->code_dagri . '.' . $districtCode,
                'name_dagri' => $name
            ]);

        } catch (\Exception $e) {
            \Log::error("District creation failed: " . $e->getMessage());
            return null;
        }
    }

    protected function convertVillageId($villageId)
    {
        if (empty($villageId)) return null;

        $villageStr = (string)$villageId;
        if (strlen($villageStr) !== 10) return null;

        return implode('.', [
            substr($villageStr, 0, 2),  // province
            substr($villageStr, 2, 2),  // regency
            substr($villageStr, 4, 2),  // district
            substr($villageStr, 6, 4)   // village
        ]);
    }

    protected function saveFailedData(array $failedData)
    {
        if (!empty($failedData)) {
            $fileName = 'failed_imports_' . date('Ymd_His') . '.json';
            file_put_contents(storage_path('logs/' . $fileName), json_encode($failedData, JSON_PRETTY_PRINT));
        }
    }

    protected function generateImportReport($total, $success, $failed)
    {
        $report = [
            'status' => 'completed',
            'total_data' => $total,
            'success_count' => $success,
            'failed_count' => count($failed),
            'success_rate' => round(($success/$total)*100, 2) . '%'
        ];

        if (!empty($failed)) {
            $report['common_errors'] = $this->analyzeErrors($failed);
            $report['failed_samples'] = array_slice($failed, 0, 5);
        }

        return response()->json($report);
    }

    protected function analyzeErrors($failedData)
    {
        $errorCounts = [];
        foreach ($failedData as $failed) {
            $error = $failed['error'];
            $errorCounts[$error] = ($errorCounts[$error] ?? 0) + 1;
        }

        arsort($errorCounts);
        return $errorCounts;
    }
}
