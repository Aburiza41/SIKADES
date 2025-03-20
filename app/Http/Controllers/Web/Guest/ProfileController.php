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
        $query->where('status', 'validasi'); // Filter status "validasi"
    }])->get();

    // Ambil data pendidikan dari tabel studies
    $educationLevels = Study::pluck('name', 'id')->toArray();

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
        foreach ($educationLevels as $id => $education) {
            // Ambil pendidikan terakhir untuk setiap official
            $latestStudies = DB::table('study_officials as so')
                ->select('so.official_id', 'so.study_id')
                ->join('studies as s', 'so.study_id', '=', 's.id') // Join dengan tabel studies untuk mendapatkan level
                ->join(DB::raw('(SELECT so2.official_id, MAX(s2.level) as max_level
                             FROM study_officials as so2
                             JOIN studies as s2 ON so2.study_id = s2.id
                             GROUP BY so2.official_id) as latest'), function ($join) {
                    $join->on('so.official_id', '=', 'latest.official_id')
                        ->on('s.level', '=', 'latest.max_level');
                })
                ->where('so.study_id', $id) // Filter berdasarkan study_id
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('officials as o')
                        ->whereColumn('o.id', 'so.official_id')
                        ->where('o.status', 'validasi'); // Filter status "validasi"
                })
                ->get();

            // Ambil official_id dari hasil query di atas
            $officialIds = $latestStudies->pluck('official_id')->toArray();

            // Hitung jumlah officials yang memiliki pendidikan terakhir dengan study_id = $id
            $educationTotals[$education] = $regency->districts()
                ->with(['villages.officials' => function ($query) use ($officialIds) {
                    $query->whereIn('id', $officialIds); // Filter berdasarkan official_id
                }])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });
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
                    $query->where('status', 'validasi');
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
                        $query->where('pendidikan', $id);
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
            $query->whereHas('positionOfficial', function ($q) use ($position) {
                $q->where('position_id', $position->id)
                    ->where('mulai', '<=', Carbon::now()) // Mulai <= Hari Ini
                    ->where(function ($query) {
                        $query->where('selesai', '>=', Carbon::now()) // Selesai >= Hari Ini
                            ->orWhereNull('selesai'); // Atau Selesai NULL (masih aktif)
                    })
                    ->latest('mulai'); // Ambil data terbaru berdasarkan tanggal mulai
            })
                ->with(['positionOfficial.position']);
        }, 'villageIdmLatest'])
            ->where('district_id', $district->id)
            ->get(); // Ambil semua desa yang memenuhi kriteria

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Proses setiap Desa
        $villages->each(function ($village) use ($educationLevels) {
            // Hitung total Perangkat Desa dengan status "validasi"
            $village->total_officials = $village->officials()
                ->where('status', 'validasi')
                ->count();

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi"
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $village->officials()
                    ->whereHas('identities', function ($query) use ($id) {
                        $query->where('pendidikan', $id);
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
