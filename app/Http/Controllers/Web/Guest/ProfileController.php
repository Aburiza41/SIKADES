<?php

namespace App\Http\Controllers\Web\Guest;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Position;
use App\Models\Regency;
use App\Models\Village;
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
        return Inertia::render('Guest/Profile/Page');
    }

    public function getRegencies()
    {
        // Ambil data Kabupaten dengan relasi districts, villages, dan officials
        $regencies = Regency::with(['districts.villages.officials' => function ($query) {
            $query->where('status', 'validasi'); // Filter status "validasi"
        }, 'districts.villages.officials.identities'])->get();

        // Ambil data pendidikan dari tabel official_identities
        $educationLevels = [
            'SD/MI' => 'SD/MI',
            'SMP/MTS/SLTP' => 'SMP/MTS',
            'SMA/SMK/MA/SLTA/SMU' => 'SMA/SMK/MA',
            'D1' => 'D1',
            'D2' => 'D2',
            'D3' => 'D3',
            'D4' => 'D4',
            'S1' => 'S1',
            'S2' => 'S2',
            'S3' => 'S3',
            'Lainnya' => 'Lainnya',
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

            // Hitung total Perangkat berdasarkan Pendidikan Terakhir dengan status "validasi" menggunakan DB query
            $educationTotals = [];
            foreach ($educationLevels as $key => $education) {
                $educationTotals[$education] = DB::table('officials')
                    ->join('official_identities', 'officials.id', '=', 'official_identities.official_id')
                    ->join('villages', 'officials.village_id', '=', 'villages.id')
                    ->join('districts', 'villages.district_id', '=', 'districts.id')
                    ->where('districts.regency_id', $regency->id)
                    ->where('officials.status', 'validasi')
                    ->where('official_identities.pendidikan_terakhir', $key)
                    ->count();
            }
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

    public function getDistricts($regencyCode)
    {
        // Ambil data Kabupaten berdasarkan kode BPS
        $regency = Regency::where('code_bps', $regencyCode)->first();

        if (!$regency) {
            return response()->json(['message' => 'Kabupaten tidak ditemukan'], 404);
        }

        // Ambil data Kecamatan dengan relasi villages dan officials
        $districts = District::where('regency_id', $regency->id)
            ->with(['villages.officials' => function ($query) {
                $query->where('status', 'validasi');
            }, 'villages.officials.identities'])
            ->get();

        // Ambil data pendidikan dari tabel official_identities
        $educationLevels = [
            'SD/MI' => 'SD/MI',
            'SMP/MTS/SLTP' => 'SMP/MTS',
            'SMA/SMK/MA/SLTA/SMU' => 'SMA/SMK/MA',
            'D1' => 'D1',
            'D2' => 'D2',
            'D3' => 'D3',
            'D4' => 'D4',
            'S1' => 'S1',
            'S2' => 'S2',
            'S3' => 'S3',
            'Lainnya' => 'Lainnya',
        ];

        // Proses setiap Kecamatan
        $districts->each(function ($district) use ($educationLevels) {
            // Hitung total Desa
            $district->total_villages = $district->villages->count();

            // Hitung total Perangkat Desa dengan status "validasi"
            $district->total_officials = $district->villages->sum(function ($village) {
                return $village->officials->count();
            });

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi" menggunakan DB query
            $educationTotals = [];
            foreach ($educationLevels as $key => $education) {
                $educationTotals[$education] = DB::table('officials')
                    ->join('official_identities', 'officials.id', '=', 'official_identities.official_id')
                    ->join('villages', 'officials.village_id', '=', 'villages.id')
                    ->where('villages.district_id', $district->id)
                    ->where('officials.status', 'validasi')
                    ->where('official_identities.pendidikan_terakhir', $key)
                    ->count();
            }
            $district->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin dengan status "validasi"
            $genderTotals = [
                'L' => $district->villages->sum(function ($village) {
                    return $village->officials->where('jenis_kelamin', 'L')->count();
                }),
                'P' => $district->villages->sum(function ($village) {
                    return $village->officials->where('jenis_kelamin', 'P')->count();
                }),
            ];
            $district->gender_totals = $genderTotals;
        });

        // Kembalikan data
        return response()->json($districts);
    }

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

        // Ambil data Desa dengan relasi officials (Kepala Desa) dan villageIdmLatest
        $villages = Village::with(['officials' => function ($query) use ($position) {
            $query->whereHas('positions', function ($q) use ($position) {
                $q->where('position_id', $position->id)
                    ->where('tmt_jabatan', '<=', now())
                    ->where(function ($query) {
                        $query->where('periode', '>=', now())
                            ->orWhereNull('periode');
                    });
            })->where('status', 'validasi')
                ->with(['positions.position', 'identities']);
        }, 'villageIdmLatest'])
            ->where('district_id', $district->id)
            ->get();

        // Ambil data pendidikan dari tabel official_identities
        $educationLevels = [
            'SD/MI' => 'SD/MI',
            'SMP/MTS/SLTP' => 'SMP/MTS',
            'SMA/SMK/MA/SLTA/SMU' => 'SMA/SMK/MA',
            'D1' => 'D1',
            'D2' => 'D2',
            'D3' => 'D3',
            'D4' => 'D4',
            'S1' => 'S1',
            'S2' => 'S2',
            'S3' => 'S3',
            'Lainnya' => 'Lainnya',
        ];

        // Proses setiap Desa
        $villages->each(function ($village) use ($educationLevels) {
            // Hitung total Perangkat Desa dengan status "validasi"
            $village->total_officials = $village->officials()
                ->where('status', 'validasi')
                ->count();

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi"
            $educationTotals = [];
            foreach ($educationLevels as $key => $education) {
                $educationTotals[$education] = $village->officials()
                    ->whereHas('identities', function ($query) use ($key) {
                        $query->where('pendidikan_terakhir', $key);
                    })
                    ->where('status', 'validasi')
                    ->count();
            }
            $village->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin dengan status "validasi"
            $genderTotals = [
                'L' => $village->officials()
                    ->where('status', 'validasi')
                    ->where('jenis_kelamin', 'L')
                    ->count(),
                'P' => $village->officials()
                    ->where('status', 'validasi')
                    ->where('jenis_kelamin', 'P')
                    ->count(),
            ];
            $village->gender_totals = $genderTotals;
        });

        // Kembalikan data
        return response()->json($villages);
    }
}
