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
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Support\Facades\Log;

class IdentityController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_Identitas.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        $success_count = 0;
        $failed_count = 0;
        $not_found = [
            'identities' => [],
            'villages' => [],
            'districts' => [],
            'regencies' => [],
        ];

        foreach ($data as $k_identitas => $v_identitas) {
            // dd($v_identitas);
            // Stop looping if IDIdentitas is empty
            if (empty(trim($v_identitas['ididentitas']))) {
                echo "Stopping loop at row {$k_identitas}: Empty IDIdentitas detected for name {$v_identitas['namalengkap']}<br>";
                break;
            }

            try {
                $validationResult = $this->validateIdentityData($v_identitas);
                if (!$validationResult['valid']) {
                    $not_found['identities'][] = [
                        'row' => $k_identitas,
                        'name' => $v_identitas['namalengkap'] ?? 'Unknown',
                        'reason' => $validationResult['reason'],
                    ];
                    echo "Failed at row {$k_identitas}: Name {$v_identitas['namalengkap']} (NIK: {$v_identitas['nik']}) - {$validationResult['reason']}<br>";
                    $failed_count++;
                    continue;
                }

                // // Find regency
                // $regency = $this->findRegency($v_identitas['idkabupaten'] ?? null);
                // if (!$regency) {
                //     $not_found['regencies'][] = [
                //         'row' => $k_identitas,
                //         'regency_code' => $v_identitas['idkabupaten'] ?? 'Unknown',
                //     ];
                //     echo "Failed at row {$k_identitas}: Name {$v_identitas['namalengkap']} (NIK: {$v_identitas['nik']}) - Regency not found: {$v_identitas['idkabupaten']}<br>";
                //     $failed_count++;
                //     continue;
                // }

                // // Find district
                // $district = $this->findDistrict($v_identitas['idkecamatan'] ?? null, $regency->id);
                // // dd($v_identitas['idkecamatan'], $district);
                // if (!$district) {
                //     $not_found['districts'][] = [
                //         'row' => $k_identitas,
                //         'district_code' => $v_identitas['idkecamatan'] ?? 'Unknown',
                //     ];
                //     echo "Failed at row {$k_identitas}: Name {$v_identitas['namalengkap']} (NIK: {$v_identitas['nik']}) - District not found: {$v_identitas['idkecamatan']}<br>";
                //     $failed_count++;
                //     continue;
                // }

                // Find village
                $village = $this->findVillage($v_identitas['iddesa'] ?? null);
                if (!$village) {
                    $not_found['villages'][] = [
                        'row' => $k_identitas,
                        'village_code' => $v_identitas['iddesa'] ?? 'Unknown',
                    ];
                    echo "Failed at row {$k_identitas}: Name {$v_identitas['namalengkap']} (NIK: {$v_identitas['nik']}) - Village not found: {$v_identitas['iddesa']}<br>";
                    $failed_count++;
                    continue;
                }

                $district = $village->district;
                $regency = $district->regency;

                $this->insertOrUpdateIdentity($v_identitas, $village, $district, $regency);
                $success_count++;
                echo "Success at row {$k_identitas}: Name {$v_identitas['namalengkap']} (NIK: {$v_identitas['nik']}) - Identity created/updated successfully<br>";
            } catch (\Throwable $th) {
                Log::error("Error processing row {$k_identitas}: {$th->getMessage()}", [
                    'data' => $v_identitas,
                    'village' => $village ? $village->toArray() : null,
                    'district' => $district ? $district->toArray() : null,
                    'regency' => $regency ? $regency->toArray() : null,
                ]);
                echo "Failed at row {$k_identitas}: Name {$v_identitas['namalengkap']} (NIK: {$v_identitas['nik']}) - Error: {$th->getMessage()}<br>";
                $failed_count++;
            }
        }

        // Display not found data
        $this->displayNotFound($not_found);

        echo "Successfully imported {$success_count} records, failed {$failed_count} records<br>";
    }

    /**
     * Validate identity data from Excel.
     *
     * @param array $data
     * @return array
     */
    protected function validateIdentityData($data)
    {
        // Check required fields (only ididentitas and namalengkap are mandatory)
        if (empty($data['ididentitas']) || empty($data['namalengkap'])) {
            return [
                'valid' => false,
                'reason' => 'Missing required fields: ' . implode(', ', array_filter([
                    empty($data['namalengkap']) ? 'name' : null,
                    empty($data['ididentitas']) ? 'ididentitas' : null,
                ])),
            ];
        }

        // Validate status
        if (isset($data['status']) && !in_array((string)$data['status'], ['0', '1', '2', '3'])) {
            $data['status'] = '0'; // Default to '0' (proses) if invalid
        }

        // Validate rt and rw (set to null if invalid)
        if (isset($data['rt']) && !is_null($data['rt']) && (!is_numeric($data['rt']) || $data['rt'] < 0)) {
            $data['rt'] = null;
        }

        if (isset($data['rw']) && !is_null($data['rw']) && (!is_numeric($data['rw']) || $data['rw'] < 0)) {
            $data['rw'] = null;
        }

        // Validate gol_darah
        $validBloodTypes = ['A', 'B', 'AB', 'O', 'Lainnya'];
        if (isset($data['golongandarah']) && !in_array(strtoupper(trim($data['golongandarah'])), $validBloodTypes)) {
            $data['golongandarah'] = 'Lainnya'; // Set to 'Lainnya' if invalid
        }

        return ['valid' => true];
    }

    /**
     * Find regency.
     *
     * @param mixed $code
     * @return \App\Models\Regency|null
     */
    protected function findRegency($code)
    {
        if (empty($code) || $code === '0') {
            return null;
        }

        $cleanCode = trim($code);
        return Regency::where('code', $cleanCode)->orWhere('code_bps', $cleanCode)->first();
    }

    /**
     * Find district.
     *
     * @param mixed $code
     * @param int $regencyId
     * @return \App\Models\District|null
     */
    protected function findDistrict($code, $regencyId)
    {
        if (empty($code) || $code === '0') {
            return null;
        }

        $cleanCode = trim($code);
        return District::where('code', $cleanCode)->orWhere('code_bps', $cleanCode)->first();
    }

    /**
     * Find village.
     *
     * @param mixed $code
     * @param int $districtId
     * @return \App\Models\Village|null
     */
    protected function findVillage($code)
    {
        if (empty($code) || $code === '0') {
            return null;
        }

        $cleanCode = trim($code);
        return Village::where('code', $cleanCode)->orWhere('code_bps', $cleanCode)->first();
    }

    /**
     * Insert or update identity and related data.
     *
     * @param array $data
     * @param \App\Models\Village $village
     * @param \App\Models\District $district
     * @param \App\Models\Regency $regency
     * @return void
     */
    protected function insertOrUpdateIdentity($data, $village, $district, $regency)
    {
        DB::enableQueryLog();
        try {
            DB::transaction(function () use ($data, $village, $district, $regency) {
                // Format data
                $nama_lengkap = $this->formatTitleCase(trim($data['namalengkap']));
                $alamat = strtoupper(trim($data['alamat']));
                $tempat_lahir = strtoupper(trim($data['tempatlahir']));
                $provinsi = strtoupper(trim($data['provinsi']));
                $desa = strtoupper(trim($data['desa']));
                $kecamatan = strtoupper(trim($data['kecamatan']));
                $kabupaten = strtoupper(trim($data['kabupaten']));
                $tanggal_lahir = $this->parseDate($data['tanggallahir']);
                $jenis_kelamin = $this->mapGender($data['jeniskelamin']);
                $agama = $this->mapReligion($data['agama']);
                $status_perkawinan = $this->mapMaritalStatus($data['statusperkawinan']);
                $status = $this->mapAdministrativeStatus($data['status'] ?? '0');
                $pendidikan_terakhir = $this->mapEducation($data['pendidikanterakhir']);
                $gol_darah = $this->mapBloodType($data['golongandarah']);

                // Check if official exists
                $existing_official = Official::where('code_ident', strtoupper(trim($data['ididentitas'])))->first();
                $previous_status = $existing_official ? $existing_official->status : null;

                // Validate previous_status
                $validStatuses = ['daftar', 'proses', 'validasi', 'tolak'];
                $validatedPreviousStatus = in_array($previous_status, $validStatuses) ? $previous_status : null;

                // Log for debugging
                Log::info("Processing status log for official", [
                    'official_id' => $existing_official ? $existing_official->id : 'new',
                    'previous_status' => $previous_status,
                    'validated_previous_status' => $validatedPreviousStatus,
                    'new_status' => $status,
                ]);

                // Insert/Update Official
                $official = Official::updateOrCreate(
                    [
                        'code_ident' => strtoupper(trim($data['ididentitas']))
                    ],
                    [
                        'code_ident' => strtoupper(trim($data['ididentitas'])),
                        'village_id' => $village->id,
                        'nik' => $data['nik'] ? strtoupper(trim($data['nik'])) : null,
                        'nipd' => $data['nipd'] ? strtoupper(trim($data['nipd'])) : null,
                        'nama_lengkap' => $nama_lengkap,
                        'gelar_depan' => $data['gelardepan'] ? trim($data['gelardepan']) : null,
                        'gelar_belakang' => $data['gelarbelakang'] ? trim($data['gelarbelakang']) : null,
                        'tempat_lahir' => $tempat_lahir ?: null,
                        'tanggal_lahir' => $tanggal_lahir ?: '1970-01-01',
                        'jenis_kelamin' => $jenis_kelamin,
                        'agama' => $agama,
                        'status_perkawinan' => $status_perkawinan,
                        'status' => $status,
                    ]
                );

                // Log status change
                if ($existing_official && $existing_official->status != $status) {
                    OfficialStatusLog::create([
                        'official_id' => $official->id,
                        'status_sebelumnya' => $validatedPreviousStatus,
                        'status_baru' => $status,
                        'user_id' => 1,
                        'keterangan' => $data['catatan'] ? strtoupper(trim($data['catatan'])) : 'IMPORT DATA DARI EXCEL',
                    ]);
                } elseif (!$existing_official) {
                    OfficialStatusLog::create([
                        'official_id' => $official->id,
                        'status_sebelumnya' => null,
                        'status_baru' => $status,
                        'user_id' => 1,
                        'keterangan' => $data['catatan'] ? strtoupper(trim($data['catatan'])) : 'DATA AWAL DARI IMPORT EXCEL',
                    ]);
                }

                // Insert Official Address
                OfficialAddress::updateOrCreate(
                    ['official_id' => $official->id],
                    [
                        'alamat' => $alamat ?: '-',
                        'rt' => $this->validateInteger($data['rt'] ?? null),
                        'rw' => $this->validateInteger($data['rw'] ?? null),
                        'kode_pos' => $data['pos'] ? strtoupper(trim($data['pos'])) : null,
                        'province_code' => '61',
                        'province_name' => $provinsi ?: 'KALIMANTAN BARAT',
                        'regency_code' => $regency->code,
                        'regency_name' => $kabupaten,
                        'district_code' => $district->code,
                        'district_name' => $kecamatan,
                        'village_code' => $village->code,
                        'village_name' => $desa,
                    ]
                );

                // Insert Official Contact
                if (!empty($data['nomortelpon'])) {
                    OfficialContact::updateOrCreate(
                        ['official_id' => $official->id],
                        [
                            'handphone' => $data['nomortelpon'] ? strtoupper(trim($data['nomortelpon'])) : null,
                            'email' => null,
                        ]
                    );
                }

                // Insert Official Identity
                OfficialIdentity::updateOrCreate(
                    ['official_id' => $official->id],
                    [
                        'gol_darah' => $gol_darah,
                        'pendidikan_terakhir' => $pendidikan_terakhir,
                        'bpjs_kesehatan' => $data['bpjskesehatan'] === 'ADA' ? 'ADA' : null,
                        'bpjs_ketenagakerjaan' => $data['bpjsketenagakerjaan'] ? strtoupper(trim($data['bpjsketenagakerjaan'])) : null,
                        'npwp' => $data['npwp'] ? strtoupper(trim($data['npwp'])) : null,
                        'foto' => null,
                    ]
                );
            });
        } catch (\Throwable $th) {
            Log::error('Insert identity failed', [
                'error' => $th->getMessage(),
                'queries' => DB::getQueryLog(),
                'data' => $data,
                'village' => $village ? $village->toArray() : null,
                'district' => $district ? $district->toArray() : null,
                'regency' => $regency ? $regency->toArray() : null,
            ]);
            throw $th;
        }
    }

    /**
     * Display data that was not found during processing.
     *
     * @param array $not_found
     * @return void
     */
    protected function displayNotFound($not_found)
    {
        if (!empty($not_found['identities'])) {
            echo "<h3>Identities not found or invalid:</h3><ul>";
            foreach ($not_found['identities'] as $item) {
                echo "<li>Row {$item['row']}: {$item['name']} ({$item['reason']})</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['villages'])) {
            echo "<h3>Villages not found:</h3><ul>";
            foreach ($not_found['villages'] as $item) {
                echo "<li>Row {$item['row']}: {$item['village_code']}</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['districts'])) {
            echo "<h3>Districts not found:</h3><ul>";
            foreach ($not_found['districts'] as $item) {
                echo "<li>Row {$item['row']}: {$item['district_code']}</li>";
            }
            echo "</ul>";
        }

        if (!empty($not_found['regencies'])) {
            echo "<h3>Regencies not found:</h3><ul>";
            foreach ($not_found['regencies'] as $item) {
                echo "<li>Row {$item['row']}: {$item['regency_code']}</li>";
            }
            echo "</ul>";
        }
    }

    // Helper methods
    private function parseDate($date)
    {
        if (empty($date)) {
            return null;
        }

        try {
            if (is_numeric($date)) {
                // Handle Excel date format
                $dateObj = Date::excelToDateTimeObject($date);
            } else {
                // Try different date formats
                try {
                    $dateObj = Carbon::createFromFormat('Y-m-d', trim($date));
                } catch (\Exception $e) {
                    try {
                        $dateObj = Carbon::parse(trim($date));
                    } catch (\Exception $e) {
                        return null;
                    }
                }
            }

            // Validate the year is within MySQL's acceptable range
            $year = $dateObj->format('Y');
            if ($year < 1000 || $year > 9999) {
                return null;
            }

            return $dateObj;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function formatTitleCase($string)
    {
        if (empty($string)) {
            return null;
        }

        return ucwords(strtolower(trim($string)));
    }

    private function mapGender($value)
    {
        $value = strtolower(trim($value));

        if (str_contains($value, 'laki')) {
            return 'L';
        } elseif (str_contains($value, 'perempuan')) {
            return 'P';
        }

        return 'Lainnya';
    }

    private function mapReligion($value)
    {
        $value = strtolower(trim($value));

        $mapping = [
            'islam' => 'Islam',
            'kristen' => 'Kristen',
            'katolik' => 'Katolik',
            'hindu' => 'Hindu',
            'buddha' => 'Buddha',
            'konghucu' => 'Konghucu'
        ];

        return $mapping[$value] ?? 'Lainnya';
    }

    private function mapMaritalStatus($value)
    {
        $value = strtolower(trim($value));

        $mapping = [
            'belum kawin' => 'Belum Kawin',
            'kawin' => 'Kawin',
            'duda' => 'Duda',
            'janda' => 'Janda'
        ];

        return $mapping[$value] ?? 'Lainnya';
    }

    private function mapAdministrativeStatus($status)
    {
        $mapping = [
            '0' => 'proses',
            '1' => 'validasi',
            '2' => 'tolak',
            '3' => 'daftar'
        ];

        return $mapping[(string)$status] ?? 'proses';
    }

    private function mapEducation($value)
    {
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

    private function mapBloodType($value)
    {
        $value = strtoupper(trim($value));
        $validBloodTypes = ['A', 'B', 'AB', 'O', 'Lainnya'];

        if (empty($value) || !in_array($value, $validBloodTypes)) {
            return 'Lainnya';
        }

        return $value;
    }

    private function validateInteger($value)
    {
        if (is_null($value) || $value === '') {
            return null;
        }

        // Remove non-numeric characters
        $cleanValue = preg_replace('/[^0-9]/', '', trim($value));
        if (!is_numeric($cleanValue) || $cleanValue < 0 || $cleanValue > 127) {
            Log::warning("Invalid rt/rw value set to null", [
                'original_value' => $value,
                'clean_value' => $cleanValue,
            ]);
            return null; // Set to null if out of range for tinyInteger (signed)
        }

        return (int) $cleanValue;
    }
}
