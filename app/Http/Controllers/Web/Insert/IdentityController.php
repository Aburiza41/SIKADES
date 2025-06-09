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

class IdentityController extends Controller
{
    public function index()
    {
        ini_set('memory_limit', '-1');
        set_time_limit(0);

        $filePath = public_path('data/Data_Identitas.xlsx');
        $data = Excel::toCollection(new TestImport, $filePath)->first();

        $success_count = 0;
        foreach ($data as $k_identitas => $v_identitas) {
            try {
                // Format nama dan alamat
                $nama_lengkap = $this->formatTitleCase(trim($v_identitas['namalengkap']));
                $alamat = $this->formatTitleCase(trim($v_identitas['alamat']));
                $tempat_lahir = $this->formatTitleCase(trim($v_identitas['tempatlahir']));

                // Format administrative names to uppercase
                $desa = strtoupper(trim($v_identitas['desa']));
                $kecamatan = strtoupper(trim($v_identitas['kecamatan']));
                $kabupaten = strtoupper(trim($v_identitas['kabupaten']));
                $provinsi = strtoupper(trim($v_identitas['provinsi']));

                // Handle tanggal lahir - set to null if invalid
                $tanggal_lahir = $this->parseDate($v_identitas['tanggallahir']);

                // Find or create regency
                $regency = Regency::firstOrCreate(
                    ['code' => $v_identitas['idkabupaten'] ?? null],
                    [
                        'name_dagri' => $kabupaten,
                        // 'code_bps' => $v_identitas['idkabupaten'] ?? null,
                        // 'code_dagri' => $v_identitas['idkabupaten'] ?? null,
                        'code' => $v_identitas['idkabupaten'] ?? null,
                        'active' => true
                    ]
                );

                // Find or create district
                $district = District::firstOrCreate(
                    [
                        'code' => $v_identitas['idkecamatan'] ?? null,
                        'regency_id' => $regency->id ?? null
                    ],
                    [
                        'name_dagri' => $kecamatan,
                        // 'code_bps' => $v_identitas['idkecamatan'] ?? null,
                        // 'code_dagri' => $v_identitas['idkecamatan'] ?? null,
                        'code' => $v_identitas['idkecamatan'] ?? null,
                        'active' => true
                    ]
                );

                // Find or create village
                $village = Village::firstOrCreate(
                    [
                        'code' => $v_identitas['iddesa'] ?? null,
                        'district_id' => $district->id ?? null
                    ],
                    [
                        'name_dagri' => $desa,
                        // 'code_bps' => $v_identitas['iddesa'] ?? null,
                        // 'code_dagri' => $v_identitas['iddesa'] ?? null,
                        'code' => $v_identitas['iddesa'] ?? null,
                        'active' => true
                    ]
                );

                // Map jenis kelamin
                $jenis_kelamin = $this->mapGender($v_identitas['jeniskelamin']);

                // Map agama
                $agama = $this->mapReligion($v_identitas['agama']);

                // Map status perkawinan
                $status_perkawinan = $this->mapMaritalStatus($v_identitas['statusperkawinan']);

                // Map status administrasi
                $status = $this->mapAdministrativeStatus($v_identitas['status'] ?? 0);

                // Check if official exists to determine if this is an update or create
                $existing_official = Official::where('code_ident', trim($v_identitas['ididentitas']))->first();
                $previous_status = $existing_official ? $existing_official->status : null;

                // Insert/Update Official
                $official = Official::updateOrCreate(
                    [
                        'code_ident' => trim($v_identitas['ididentitas'])
                    ],
                    [
                        'code_ident' => trim($v_identitas['ididentitas']),
                        'village_id' => $village->id,
                        'nik' => $v_identitas['nik'] ? trim($v_identitas['nik']) : null,
                        'nipd' => $v_identitas['nipd'] ? trim($v_identitas['nipd']) : null,
                        'nama_lengkap' => $nama_lengkap,
                        'gelar_depan' => $v_identitas['gelardepan'] ? trim($v_identitas['gelardepan']) : null,
                        'gelar_belakang' => $v_identitas['gelarbelakang'] ? trim($v_identitas['gelarbelakang']) : null,
                        'tempat_lahir' => $tempat_lahir ?: null,
                        'tanggal_lahir' => $tanggal_lahir ?: '1970-01-01',
                        'jenis_kelamin' => $jenis_kelamin,
                        'agama' => $agama,
                        'status_perkawinan' => $status_perkawinan,
                        'status' => $status,
                    ]
                );

                try {
                    // Log status change if this is an update and status changed
                if ($existing_official && $existing_official->status != $status) {
                    OfficialStatusLog::create([
                        'official_id' => $official->id,
                        'status_sebelumnya' => $previous_status,
                        'status_baru' => $status,
                        'user_id' => 1, // Using user ID 1 as the default user
                        'keterangan' => $v_identitas['catatan'] ? trim($v_identitas['catatan']) : 'Import data dari Excel',
                    ]);
                } elseif (!$existing_official) {
                    // Log initial status for new records
                    OfficialStatusLog::create([
                        'official_id' => $official->id,
                        'status_sebelumnya' => null,
                        'status_baru' => $status,
                        'user_id' => 1, // Using user ID 1 as the default user
                        'keterangan' => $v_identitas['catatan'] ? trim($v_identitas['catatan']) : 'Data awal dari import Excel',
                    ]);
                }
                } catch (\Throwable $th) {
                    //throw $th;
                }

                try {
                    // Insert Official Address
                OfficialAddress::updateOrCreate(
                    ['official_id' => $official->id],
                    [
                        'alamat' => $alamat ?: '-',
                        'rt' => $v_identitas['rt'] ?? null,
                        'rw' => $v_identitas['rw'] ?? null,
                        'kode_pos' => $v_identitas['pos'] ? trim($v_identitas['pos']) : null,
                        'province_code' => '61', // Kalimantan Barat code
                        'province_name' => $provinsi ?: 'KALIMANTAN BARAT',
                        'regency_code' => $regency->code,
                        'regency_name' => $kabupaten,
                        'district_code' => $district->code,
                        'district_name' => $kecamatan,
                        'village_code' => $village->code,
                        'village_name' => $desa,
                    ]
                );
                } catch (\Throwable $th) {
                    //throw $th;
                }

                try {
                    // Insert Official Contact
                if (!empty($v_identitas['nomortelpon'])) {
                    OfficialContact::updateOrCreate(
                        ['official_id' => $official->id],
                        [
                            'handphone' => $v_identitas['nomortelpon'] ? trim($v_identitas['nomortelpon']) : null,
                            'email' => null, // No email data in the source
                        ]
                    );
                }
                } catch (\Throwable $th) {
                    //throw $th;
                }

                try {
                    // Map pendidikan terakhir
                $pendidikan_terakhir = $this->mapEducation($v_identitas['pendidikanterakhir']);

                // Insert Official Identity
                OfficialIdentity::updateOrCreate(
                    ['official_id' => $official->id],
                    [
                        'gol_darah' => $v_identitas['golongandarah'] ? strtoupper(trim($v_identitas['golongandarah'])) : 'Kosong',
                        'pendidikan_terakhir' => $pendidikan_terakhir,
                        'bpjs_kesehatan' => $v_identitas['bpjskesehatan'] === 'ADA' ? 'ADA' : null,
                        'bpjs_ketenagakerjaan' => $v_identitas['bpjsketenagakerjaan'] ? trim($v_identitas['bpjsketenagakerjaan']) : null,
                        'npwp' => $v_identitas['npwp'] ? trim($v_identitas['npwp']) : null,
                        'foto' => null, // No foto data in the source
                    ]
                );

                } catch (\Throwable $th) {
                    //throw $th;
                }
                $success_count++;
            } catch (\Throwable $th) {
                Log::error("Error importing row {$k_identitas}", [
                    'error' => $th->getMessage(),
                    'data' => $v_identitas
                ]);

                echo "Error at: ". $th->getMessage() . "\n";
                echo "Row: " . $k_identitas . "\n";
                continue;
            }
        }

        echo "Successfully imported {$success_count} records\n";
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

        return 'Kosong';
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

        return $mapping[$value] ?? 'Kosong';
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

        return $mapping[$value] ?? 'Kosong';
    }

    private function mapAdministrativeStatus($status)
    {
        $mapping = [
            0 => 'daftar',
            1 => 'proses',
            2 => 'validasi',
            3 => 'tolak'
        ];

        return $mapping[$status] ?? 'daftar';
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

        return 'Kosong';
    }
}
