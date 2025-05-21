<?php

namespace App\Http\Controllers\Web\Guest;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Position;
use App\Models\Regency;
use App\Models\Study;
use App\Models\Village;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Kembalikan data ke view
        return Inertia::render('Guest/Profile/Page');
    }

    /**
     * Ambil data Kabupaten.
     */
    public function getRegencies()
    {
        // Ambil data Kabupaten dengan relasi districts dan villages
        $regencies = Regency::with(['districts.villages.officials' => function ($query) {
            $query->where('status', 'daftar'); // Filter status "validasi"
        }])->get();
        // dd($regencies);
        // Ambil data pendidikan dari tabel studies
        $educationLevels = [
            1 => 'SD/MI',
            2 => 'SMP/MTS',
            3 => 'SMA/SMK/MA',
            4 => 'D1',
            5 => 'D2',
            6 => 'D3',
            7 => 'D4',
            8 => 'S1',
            9 => 'S2',
            10 => 'S3',
        ];

        // Proses setiap Kabupaten
        $regencies->each(function ($regency) use ($educationLevels) {
            // Hitung total Kecamatan
            $regency->total_districts = $regency->districts->count();

            // Hitung total Desa
            $regency->total_villages = $regency->districts->sum(function ($district) {
                return $district->villages->count();
            });

            // Hitung total Perangkat Desa dengan status "validasi"
            $regency->total_officials = $regency->districts->sum(function ($district) {
                return $district->villages->sum(function ($village) {
                    return $village->officials->count();
                });
            });

            // Hitung total Perangkat berdasarkan Pendidikan Terakhir dengan status "validasi"
            $educationTotals = [];

            $regency->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin dengan status "validasi"
            $genderTotals = [
                'L' => $regency->districts->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->where('jenis_kelamin', 'L')->count();
                    });
                }),
                'P' => $regency->districts->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->where('jenis_kelamin', 'P')->count();
                    });
                }),
            ];
            $regency->gender_totals = $genderTotals;
        });

        // Kembalikan data
        return response()->json($regencies);
    }

    /**
     * Ambil data Kecamatan berdasarkan kode Kabupaten.
     */
    public function getDistricts($regencyCode)
    {
        // Ambil data Kabupaten berdasarkan kode BPS
        $regency = Regency::where('code_bps', $regencyCode)->first();

        if (!$regency) {
            return response()->json(['message' => 'Kabupaten tidak ditemukan'], 404);
        }

        // Ambil data Kecamatan berdasarkan Kabupaten
        $districts = District::where('regency_id', $regency->id)->get();

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Proses setiap Kecamatan
        $districts->each(function ($district) use ($educationLevels) {
            // Hitung total Desa
            $district->total_villages = $district->villages()->count();

            // Hitung total Perangkat Desa dengan status "validasi"
            $district->total_officials = $district->villages()
                ->with(['officials' => function ($query) {
                    $query->where('status', 'daftar');
                }])
                ->get()
                ->sum(function ($village) {
                    return $village->officials->count();
                });

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi"
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $district->villages()
                    ->with(['officials.identities' => function ($query) use ($id) {
                        $query->where('pendidikan_terakhir', $id);
                    }])
                    ->get()
                    ->sum(function ($village) {
                        return $village->officials->count();
                    });
            }
            $district->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin dengan status "validasi"
            $genderTotals = [
                'L' => $district->villages()
                    ->with(['officials' => function ($query) {
                        $query->where('jenis_kelamin', 'L');
                    }])
                    ->get()
                    ->sum(function ($village) {
                        return $village->officials->count();
                    }),
                'P' => $district->villages()
                    ->with(['officials' => function ($query) {
                        $query->where('jenis_kelamin', 'P');
                    }])
                    ->get()
                    ->sum(function ($village) {
                        return $village->officials->count();
                    }),
            ];
            $district->gender_totals = $genderTotals;
        });

        // Kembalikan data
        return response()->json($districts);
    }

    /**
     * Ambil data Desa berdasarkan kode Kecamatan.
     */
    public function getVillages($districtCode)
    {
        // Ambil data Kecamatan berdasarkan kode BPS
        $district = District::where('code_bps', $districtCode)->first();

        if (!$district) {
            return response()->json(['message' => 'Kecamatan tidak ditemukan'], 404);
        }

        // Ambil data Position "Kepala Desa"
        $position = Position::where('name', 'Kepala Desa')->first();

        if (!$position) {
            return response()->json(['message' => 'Posisi Kepala Desa tidak ditemukan'], 404);
        }

        // Ambil data Desa dengan relasi officials (Kepala Desa) dan descriptionLatest
        $villages = Village::with(['officials' => function ($query) use ($position) {
            $query->whereHas('positions', function ($q) use ($position) {
                $q->where('position_id', $position->id)
                    ->where('tmt_jabatan', '<=', Carbon::now()) // TMT Jabatan <= Hari Ini
                    ->where(function ($query) {
                        $query->where('periode', '>=', Carbon::now()) // Periode >= Hari Ini
                            ->orWhereNull('periode'); // Atau Periode NULL (masih aktif)
                    })
                    ->latest('tmt_jabatan'); // Ambil data terbaru berdasarkan TMT Jabatan
            })
                ->with(['positions.position']);
        }, 'villageIdmLatest'])
            ->where('district_id', $district->id)
            ->get(); // Ambil semua desa yang memenuhi kriteria

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Proses setiap Desa
        $villages->each(function ($village) use ($educationLevels) {
            // Hitung total Perangkat Desa dengan status "validasi"
            $village->total_officials = $village->officials()
                ->where('status', 'daftar')
                ->count();

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi"
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $village->officials()
                    ->whereHas('identities', function ($query) use ($id) {
                        $query->where('pendidikan_terakhir', $id);
                    })
                    ->where('status', 'daftar')
                    ->count();
            }
            $village->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin dengan status "validasi"
            $genderTotals = [
                'L' => $village->officials()
                    ->where('status', 'daftar')
                    ->where('jenis_kelamin', 'L')
                    ->count(),
                'P' => $village->officials()
                    ->where('status', 'daftar')
                    ->where('jenis_kelamin', 'P')
                    ->count(),
            ];
            $village->gender_totals = $genderTotals;
        });

        // dd($villages);
        // Kembalikan data
        return response()->json($villages);
    }
}
