<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Imports\Officials\OfficialsImport;
use Illuminate\Http\Request;

// use App\Exports\AdminOfficialExport;
use App\Models\Official;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

// use Maatwebsite\Excel\Facades\Excel;

class OfficialImportController extends Controller
{
    // Controller Excel
    function excel(Request $request, String $role)
    {
        // dd($request->all(), $role);
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120' // 5MB
        ]);

        try {
            $file = $request->file('file');

            // Menggunakan Laravel Excel untuk mengimport
            $import = new OfficialsImport($role);
            $data = Excel::toArray($import, $file);
            // dd($data);

            // Identitas
            $identitas = $data[0];
            $this->identitasFunc($identitas);
            // dd($data[0]);

            // Tempat Berkerja
            $tempat_berkerja = $data[1];
            $this->tempatBekerjaFunc($tempat_berkerja);
            // dd($data[0]);

            // Jabatan
            $jabatan = $data[2];
            $this->jabatanFunc($jabatan);
            // dd($data[0]);

            // Organisasi
            $organisasi = $data[3];
            $this->organisasiFunc($organisasi);
            // dd($data[0]);

            // Pendidikan
            $pendidikan = $data[4];
            $this->pendidikanFunc($pendidikan);
            // dd($data[0]);

            // Pelatihan
            $training = $data[5];
            $this->trainingFunc($training);
            // dd($data[0]);

            // Orang Tua
            $orang_tua = $data[6];
            $this->orangTuaFunc($orang_tua);
            // dd($data[0]);

            // Pasangan
            $pasangan = $data[7];
            $this->pasanganFunc($pasangan);
            // dd($data[0]);

            // Anak
            $anak = $data[8];
            $this->anakFunc($anak);
            // dd($data[0]);

            // $data[0] berisi array dari sheet pertama
            return response()->json([
                'success' => true,
                'data' => $data[0],
                'role' => $role,
                'message' => 'File berhasil diproses'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    function identitasFunc($identitas) {

        foreach ($identitas as $k_identitas => $v_identitas) {
            if ($k_identitas == 0 || $k_identitas == 1 || $k_identitas == 2) {
                continue;
            }

            if ($k_identitas == 500) {
                break;
            }

            // Try Catch untuk insert data ke database
            try {
                Official::create([
                    // NIK
                    'nik' => $v_identitas[0],
                    // NIPD
                    'nipd' => $v_identitas[1],
                    // Nama Lengkap
                    'nama_lengkap' => $v_identitas[2],
                    // Gelar Kesarjanaan
                    'gelar_kesarjanaan' => $v_identitas[3],
                    // Tempat / Tgl. Lahir
                    'tempat_lahir' => $v_identitas[6],
                    'tanggal_lahir' => $v_identitas[7],
                    // Jenis Kelamin
                    'jenis_kelamin' => $v_identitas[8],
                    // Agama
                    'agama' => $v_identitas[9],
                    // Status Perkawinan
                    'status_perkawinan' => $v_identitas[10],
                    // Alamat Tempat Tinggal
                    'alamat' => $v_identitas[11],
                    'rt' => $v_identitas[12],
                    'rw' => $v_identitas[13],
                    'kode_pos' => $v_identitas[14],
                    'desa_kelurahan' => $v_identitas[15],
                    'kecamatan' => $v_identitas[16],
                    'kab_kota' => $v_identitas[17],
                    'provinsi' => $v_identitas[18],
                    // Golongan Darah
                    'golongan_darah' => $v_identitas[19],
                    // Nomor Handphone
                    'nomor_handphone' => $v_identitas[20],
                    // Pendidikan Terakhir
                    'pendidikan_terakhir' => $v_identitas[21],
                    // Nomor BPJS Kesehatan
                    'nomor_bpjs_kesehatan' => $v_identitas[22],
                    // No. BPJS Ketenagakerjaan
                    'nomor_bpjs_ketenagakerjaan' => $v_identitas[23],
                    // N P W P
                    'npwp' => $v_identitas[24],
                ]);

            } catch (\Throwable $th) {
                //throw $th;
                // Tambahkan log error di sini kedalam array $errors
                $errors [] = [
                    "code" => [
                        "row" => $k_identitas,
                        "error" => $th->getCode(),
                        "data" => $v_identitas,
                    ],
                ];
            }
        }
    }

    function tempatBekerjaFunc($tempat_berkerja) {
        // Extract headers from the first two rows
        $headers = array_merge($tempat_berkerja[0], $tempat_berkerja[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "Alamat Tempat Tinggal" => "alamat_tempat_tinggal",
            "JALAN " => "alamat_tempat_tinggal",
            "RT " => "rt",
            "RW " => "rw",
            "Kode Pos " => "kode_pos",
            "Desa/ Kelurahan " => "desa_kelurahan",
            "Kecamatan" => "kecamatan",
            "Kab./ Kota " => "kab_kota",
            "Provinsi" => "provinsi",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($tempat_berkerja as $k_tempat_berkerja => $v_tempat_berkerja) {
            // Skip header rows
            if ($k_tempat_berkerja < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_tempat_berkerja))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_tempat_berkerja as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                WorkLocation::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_tempat_berkerja,
                    "error" => $th->getMessage(),
                    "data" => $v_tempat_berkerja,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function jabatanFunc($jabatan) {
        // Extract headers from the first two rows
        $headers = array_merge($jabatan[0], $jabatan[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "Pejabat yg Menetapkan" => "pejabat_menetapkan",
            "SK Pelantikan" => "sk_pelantikan",
            "Nomor " => "nomor_sk",
            "Tgl" => "tanggal_sk",
            "Bln" => "bulan_sk",
            "Thn" => "tahun_sk",
            "Nama Jabatan" => "nama_jabatan",
            "Period ke-" => "period_ke",
            "TMT Jabatan" => "tmt_jabatan",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($jabatan as $k_jabatan => $v_jabatan) {
            // Skip header rows
            if ($k_jabatan < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_jabatan))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_jabatan as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Position::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_jabatan,
                    "error" => $th->getMessage(),
                    "data" => $v_jabatan,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function organisasiFunc($organisasi) {
        // Extract headers from the first two rows
        $headers = array_merge($organisasi[0], $organisasi[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "TEMPAT" => "tempat",
            "NAMA ORGANISASI" => "nama_organisasi",
            "KEDUDUKAN/ JABATAN" => "kedudukan_jabatan",
            "LAMA DALAM JABATAN" => "lama_dalam_jabatan",
            "TGL. MULAI" => "tgl_mulai",
            "TGL. SELESAI" => "tgl_selesai",
            "NAMA PIMPINAN" => "nama_pimpinan",
            "TEMPAT" => "tempat_pimpinan",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($organisasi as $k_organisasi => $v_organisasi) {
            // Skip header rows
            if ($k_organisasi < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_organisasi))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_organisasi as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Organization::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_organisasi,
                    "error" => $th->getMessage(),
                    "data" => $v_organisasi,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function pendidikanFunc($pendidikan) {
        // Extract headers from the first two rows
        $headers = array_merge($pendidikan[0], $pendidikan[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "TINGKAT PENDIDIKAN" => "tingkat_pendidikan",
            "NAMA SEKOLAH" => "nama_sekolah",
            "TEMPAT" => "tempat",
            "IJAZAH" => "ijazah",
            "NOMOR" => "nomor_ijazah",
            "TANGGAL" => "tanggal_ijazah",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($pendidikan as $k_pendidikan => $v_pendidikan) {
            // Skip header rows
            if ($k_pendidikan < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_pendidikan))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_pendidikan as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Education::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_pendidikan,
                    "error" => $th->getMessage(),
                    "data" => $v_pendidikan,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function trainingFunc($training) {
        // Extract headers from the first two rows
        $headers = array_merge($training[0], $training[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "NAMA" => "nama_pelatihan",
            "TEMPAT" => "tempat_pelatihan",
            "PELATIHAN" => "jenis_pelatihan",
            "PENYELENGGARA" => "penyelenggara",
            "PIAGAM/ SERTIFIKAT" => "piagam_sertifikat",
            "NOMOR" => "nomor_piagam",
            "TANGGAL" => "tanggal_piagam",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($training as $k_training => $v_training) {
            // Skip header rows
            if ($k_training < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_training))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_training as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Training::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_training,
                    "error" => $th->getMessage(),
                    "data" => $v_training,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function orangTuaFunc($orang_tua) {
        // Extract headers from the first two rows
        $headers = array_merge($orang_tua[0], $orang_tua[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "NAMA" => "nama",
            "STATUS" => "status",
            "Tempat / Tgl. Lahir " => "tempat_lahir",
            "Tgl. Lahir" => "tanggal_lahir",
            "Pekerjaan" => "pekerjaan",
            "Alamat Tempat Tinggal" => "alamat",
            "JALAN " => "alamat",
            "RT " => "rt",
            "RW " => "rw",
            "Telp" => "telp",
            "Kode Pos " => "kode_pos",
            "Desa/ Kelurahan " => "desa_kelurahan",
            "Kecamatan" => "kecamatan",
            "Kab./ Kota " => "kab_kota",
            "Provinsi" => "provinsi",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($orang_tua as $k_orang_tua => $v_orang_tua) {
            // Skip header rows
            if ($k_orang_tua < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_orang_tua))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_orang_tua as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Parent::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_orang_tua,
                    "error" => $th->getMessage(),
                    "data" => $v_orang_tua,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function pasanganFunc($pasangan) {
        // Extract headers from the first two rows
        $headers = array_merge($pasangan[0], $pasangan[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "NAMA" => "nama",
            "STATUS" => "status",
            "Tempat / Tgl. Lahir " => "tempat_lahir",
            "Tgl. Lahir" => "tanggal_lahir",
            "Tgl. Kawin" => "tanggal_kawin",
            "Pendidikan Umum" => "pendidikan_umum",
            "Pekerjaan" => "pekerjaan",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($pasangan as $k_pasangan => $v_pasangan) {
            // Skip header rows
            if ($k_pasangan < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_pasangan))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_pasangan as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Spouse::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_pasangan,
                    "error" => $th->getMessage(),
                    "data" => $v_pasangan,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

    function anakFunc($anak) {
        // Extract headers from the first two rows
        $headers = array_merge($anak[0], $anak[1]);

        // Remove empty headers
        $headers = array_filter($headers, function($value) {
            return $value !== null;
        });

        // Map headers to database columns
        $headerMap = [
            "NIK" => "nik",
            "NAMA" => "nama",
            "Tempat / Tgl. Lahir " => "tempat_lahir",
            "Tgl. Lahir" => "tanggal_lahir",
            "Jenis Kelamin" => "jenis_kelamin",
            "Status" => "status",
            "Pendidikan Umum" => "pendidikan_umum",
            "Pekerjaan" => "pekerjaan",
        ];

        // Initialize an array to store errors
        $errors = [];

        // Process each row of data
        foreach ($anak as $k_anak => $v_anak) {
            // Skip header rows
            if ($k_anak < 2) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($v_anak))) {
                continue;
            }

            // Map data to database columns
            $data = [];
            foreach ($v_anak as $index => $value) {
                if (isset($headers[$index]) && isset($headerMap[$headers[$index]])) {
                    $data[$headerMap[$headers[$index]]] = $value;
                }
            }

            // Try to insert data into the database
            try {
                Child::create($data);
            } catch (\Throwable $th) {
                // Log the error
                $errors[] = [
                    "row" => $k_anak,
                    "error" => $th->getMessage(),
                    "data" => $v_anak,
                ];
            }
        }

        // Optionally, you can return or log the errors
        if (!empty($errors)) {
            // Log errors or return them as needed
            \Log::error('Errors during data insertion:', $errors);
        }
    }

}
