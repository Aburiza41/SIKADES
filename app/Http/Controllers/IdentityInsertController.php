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

class IdentityInsertController extends Controller
{
    protected $bpsBaseUrl;
    protected $agamaOptions = [
        'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu',
        'Protestan', 'Budha', 'Kepercayaan' // Common variations
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
                // Validate and clean row data first
                $cleanData = $this->cleanRowData($row);

                if (!$cleanData['valid']) {
                    throw new \Exception($cleanData['error']);
                }

                // Handle village
                $villageCode = $this->convertVillageId($cleanData['village_id']);
                if (!$villageCode) {
                    throw new \Exception("Invalid village_id format: {$cleanData['village_id']}");
                }

                $village = Village::where('code_dagri', $villageCode)->first();

                if (!$village) {
                    $village = $this->findOrCreateVillage($villageCode, $cleanData['village_id']);
                    if (!$village) {
                        throw new \Exception("Failed to find or create village");
                    }
                }

                // Prepare official data
                $officialData = [
                    'village_id' => $village->id,
                    'nik' => $cleanData['nik'] ?? null,
                    'code_ident' => $cleanData['id_ident'] ?? null,
                    'nipd' => $cleanData['no_induk'] ?? null,
                    'nama_lengkap' => $cleanData['nama_lengkap'] ?? null,
                    'gelar_depan' => $this->cleanString($cleanData['gelar_dpn'] ?? null),
                    'gelar_belakang' => $this->cleanString($cleanData['gelar_blkng'] ?? null),
                    'tempat_lahir' => $cleanData['tmpt_lahir'] ?? null,
                    'tanggal_lahir' => $cleanData['tgl_lahir'] ?? null,
                    'jenis_kelamin' => $this->mapGender($cleanData['jenis_kelamin']),
                    'agama' => $this->validateAgama($cleanData['agama']),
                    'status_perkawinan' => $this->mapMaritalStatus($cleanData['status_perkawinan']),
                    'status' => 'daftar',
                    'created_at' => now(),
                    'updated_at' => now()
                ];

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

    protected function cleanRowData($row)
    {
        $result = [
            'valid' => true,
            'error' => null
        ];

        try {
            // Convert all values to array and clean
            $data = $row->toArray();

            // Handle date conversion
            if (isset($data['tgl_lahir'])) {
                if ($data['tgl_lahir'] === '0000-00-00' || empty($data['tgl_lahir'])) {
                    $data['tgl_lahir'] = null;
                } elseif (is_numeric($data['tgl_lahir'])) {
                    try {
                        $data['tgl_lahir'] = Date::excelToDateTimeObject($data['tgl_lahir']);
                    } catch (\Exception $e) {
                        $data['tgl_lahir'] = null;
                    }
                }
            }

            // Clean village_id
            if (empty($data['village_id']) || strlen((string)$data['village_id']) !== 10) {
                throw new \Exception("Invalid village_id");
            }

            // Clean agama
            if (isset($data['agama'])) {
                $data['agama'] = $this->validateAgama($data['agama']);
            }

            $result = array_merge($data, ['valid' => true]);

        } catch (\Exception $e) {
            $result = [
                'valid' => false,
                'error' => $e->getMessage()
            ];
        }

        return $result;
    }

    protected function validateAgama($agama)
    {
        $agama = ucfirst(strtolower(trim($agama)));

        // Handle common variations
        $mapping = [
            'Budha' => 'Buddha',
            'Protestan' => 'Kristen',
            'Khonghucu' => 'Konghucu'
        ];

        if (array_key_exists($agama, $mapping)) {
            return $mapping[$agama];
        }

        if (!in_array($agama, $this->agamaOptions)) {
            return 'Lainnya';
        }

        return $agama;
    }

    protected function mapGender($gender)
    {
        $gender = strtolower(trim($gender));
        if (strpos($gender, 'laki') !== false) return 'L';
        if (strpos($gender, 'perempuan') !== false) return 'P';
        return null;
    }

    protected function mapMaritalStatus($status)
    {
        $status = strtolower(trim($status));
        if (strpos($status, 'kawin') !== false) return 'Kawin';
        if (strpos($status, 'belum') !== false) return 'Belum Kawin';
        return $status;
    }

    protected function cleanString($value)
    {
        if ($value === null) return null;
        $value = trim($value);
        return empty($value) ? null : $value;
    }

    protected function findOrCreateVillage(string $villageCode, string $originalId)
    {
        $parts = explode('.', $villageCode);
        if (count($parts) !== 4) {
            throw new \Exception("Invalid village code format: {$villageCode}");
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
        $village = Village::where('code_dagri', $villageCode)->first();
        if (!$village) {
            $village = $this->fetchAndCreateVillage($district, $villageLocalCode, $originalId);
            if (!$village) {
                throw new \Exception("Failed to create village");
            }
        }

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

            $regencyData = null;

            if ($response->successful()) {
                $regencies = $response->json();
                foreach ($regencies as $r) {
                    if ($r['kode_bps'] == $bpsCode) {
                        $regencyData = $r;
                        break;
                    }
                }
            }

            return Regency::create([
                'code_bps' => $bpsCode,
                'name_bps' => $regencyData['nama_bps'] ?? 'UNKNOWN',
                'code_dagri' => "{$provinceCode}.{$regencyCode}",
                'name_dagri' => $regencyData['nama_dagri'] ?? 'UNKNOWN'
            ]);

        } catch (\Exception $e) {
            \Log::error("Regency creation failed: " . $e->getMessage());
            return null;
        }
    }

    protected function fetchAndCreateDistrict(Regency $regency, $districtCode)
    {
        try {
            $bpsParentCode = $regency->code_bps;
            $bpsCode = $bpsParentCode . substr($districtCode, 0, 3);

            $response = Http::get($this->bpsBaseUrl, [
                'level' => 'kecamatan',
                'parent' => $bpsParentCode
            ]);

            $districtData = null;

            if ($response->successful()) {
                $districts = $response->json();
                foreach ($districts as $d) {
                    if ($d['kode_bps'] == $bpsCode) {
                        $districtData = $d;
                        break;
                    }
                }
            }

            return District::create([
                'regency_id' => $regency->id,
                'code_bps' => $bpsCode,
                'name_bps' => $districtData['nama_bps'] ?? 'UNKNOWN',
                'code_dagri' => $regency->code_dagri . '.' . $districtCode,
                'name_dagri' => $districtData['nama_dagri'] ?? 'UNKNOWN'
            ]);

        } catch (\Exception $e) {
            \Log::error("District creation failed: " . $e->getMessage());
            return null;
        }
    }

    protected function fetchAndCreateVillage(District $district, $villageCode, $originalId)
    {
        try {
            $bpsParentCode = $district->code_bps;
            $bpsCode = $bpsParentCode . substr($villageCode, 0, 4);

            $response = Http::get($this->bpsBaseUrl, [
                'level' => 'desa',
                'parent' => $bpsParentCode
            ]);

            $villageData = null;

            if ($response->successful()) {
                $villages = $response->json();
                foreach ($villages as $v) {
                    if ($v['kode_bps'] == $bpsCode) {
                        $villageData = $v;
                        break;
                    }
                }
            }

            return Village::create([
                'district_id' => $district->id,
                'code_bps' => $bpsCode,
                'name_bps' => $villageData['nama_bps'] ?? 'UNKNOWN',
                'code_dagri' => $district->code_dagri . '.' . $villageCode,
                'name_dagri' => $villageData['nama_dagri'] ?? 'UNKNOWN',
                'original_id' => $originalId
            ]);

        } catch (\Exception $e) {
            \Log::error("Village creation failed: " . $e->getMessage());
            return null;
        }
    }

    private function convertVillageId($villageId)
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

    private function saveFailedData(array $failedData)
    {
        if (!empty($failedData)) {
            $fileName = 'failed_imports_' . date('Ymd_His') . '.json';
            file_put_contents(storage_path('logs/' . $fileName), json_encode($failedData, JSON_PRETTY_PRINT));
        }
    }

    private function generateImportReport($total, $success, $failed)
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

    private function analyzeErrors($failedData)
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
