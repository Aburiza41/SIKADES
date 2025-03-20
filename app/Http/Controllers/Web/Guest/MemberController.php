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
use Inertia\Inertia;

class MemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil data Kabupaten tanpa relasi yang tidak diperlukan
        $regencies = Regency::get();

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Proses setiap Kabupaten
        $regencies->each(function ($regency) use ($educationLevels) {
            // Hitung total Kecamatan
            $regency->total_districts = $regency->districts()->count();

            // Hitung total Desa
            $regency->total_villages = $regency->districts()->withCount('villages')->get()->sum('villages_count');

            // Hitung total Perangkat Desa dengan status "validasi"
            $regency->total_officials = $regency->districts()
                ->with(['villages.officials' => function ($query) {
                    $query->where('status', 'validasi');
                }])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });

                // Debugging
                // dd($regency->total_officials);

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi"
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $regency->districts()
                    ->with(['villages.officials' => function ($query) use ($id) {
                        $query->where('status', 'validasi')
                            ->whereHas('identities', function ($q) use ($id) {
                                $q->where('pendidikan', $id);
                            });
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
                'L' => $regency->districts()
                    ->with(['villages.officials' => function ($query) {
                        $query->where('status', 'validasi')->where('jenis_kelamin', 'L');
                    }])
                    ->get()
                    ->sum(function ($district) {
                        return $district->villages->sum(function ($village) {
                            return $village->officials->count();
                        });
                    }),
                'P' => $regency->districts()
                    ->with(['villages.officials' => function ($query) {
                        $query->where('status', 'validasi')->where('jenis_kelamin', 'P');
                    }])
                    ->get()
                    ->sum(function ($district) {
                        return $district->villages->sum(function ($village) {
                            return $village->officials->count();
                        });
                    }),
            ];
            $regency->gender_totals = $genderTotals;
        });

        // Kembalikan data ke view
        return Inertia::render('Guest/Member/Page', [
            'regencies' => $regencies,
        ]);
    }

    /**
     * Ambil data Kabupaten.
     */
    public function getRegencies()
    {
        // Ambil data Kabupaten tanpa relasi yang tidak diperlukan
        $regencies = Regency::get();

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Proses setiap Kabupaten
        $regencies->each(function ($regency) use ($educationLevels) {
            // Hitung total Kecamatan
            $regency->total_districts = $regency->districts()->count();

            // Hitung total Desa
            $regency->total_villages = $regency->districts()->withCount('villages')->get()->sum('villages_count');

            // Hitung total Perangkat Desa dengan status "validasi"
            $regency->total_officials = $regency->districts()
                ->with(['villages.officials' => function ($query) {
                    $query->where('status', 'validasi');
                }])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "validasi"
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $regency->districts()
                    ->with(['villages.officials' => function ($query) use ($id) {
                        $query->where('status', 'validasi')
                            ->whereHas('identities', function ($q) use ($id) {
                                $q->where('pendidikan', $id);
                            });
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
                'L' => $regency->districts()
                    ->with(['villages.officials' => function ($query) {
                        $query->where('status', 'validasi')->where('jenis_kelamin', 'L');
                    }])
                    ->get()
                    ->sum(function ($district) {
                        return $district->villages->sum(function ($village) {
                            return $village->officials->count();
                        });
                    }),
                'P' => $regency->districts()
                    ->with(['villages.officials' => function ($query) {
                        $query->where('status', 'validasi')->where('jenis_kelamin', 'P');
                    }])
                    ->get()
                    ->sum(function ($district) {
                        return $district->villages->sum(function ($village) {
                            return $village->officials->count();
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
                    ->with(['officials' => function ($query) use ($id) {
                        $query->where('status', 'validasi')
                            ->whereHas('identities', function ($q) use ($id) {
                                $q->where('pendidikan', $id);
                            });
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
                        $query->where('status', 'validasi')->where('jenis_kelamin', 'L');
                    }])
                    ->get()
                    ->sum(function ($village) {
                        return $village->officials->count();
                    }),
                'P' => $district->villages()
                    ->with(['officials' => function ($query) {
                        $query->where('status', 'validasi')->where('jenis_kelamin', 'P');
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

        // Ambil data Semua Posisi Jabatan
        $positions = Position::get();

        if ($positions->isEmpty()) {
            return response()->json(['message' => 'Tidak ada posisi jabatan yang ditemukan'], 404);
        }

        // Ambil ID semua posisi
        $positionIds = $positions->pluck('id');

        // Ambil data Desa dengan relasi officials
        $villages = Village::with(['officials' => function ($query) use ($positionIds) {
            $query->select('id', 'village_id', 'nama_lengkap', 'gelar_depan', 'gelar_belakang') // Ambil kolom tertentu dari officials
                ->whereHas('positionOfficial', function ($q) use ($positionIds) {
                    $q->whereIn('position_id', $positionIds) // Filter berdasarkan semua posisi
                        ->where('mulai', '<=', Carbon::now()) // Mulai <= Hari Ini
                        ->where(function ($query) {
                            $query->where('selesai', '>=', Carbon::now()) // Selesai >= Hari Ini
                                ->orWhereNull('selesai'); // Atau Selesai NULL (masih aktif)
                        })
                        ->latest('mulai'); // Ambil data terbaru berdasarkan tanggal mulai
                })
                ->with(['positionOfficial' => function ($q) {
                    $q->select('id', 'position_id', 'official_id', 'mulai', 'selesai') // Ambil kolom tertentu dari position_official
                        ->with(['position' => function ($q) {
                            $q->select('id', 'name', 'description', 'min', 'level', 'parent_id'); // Ambil kolom tertentu dari position
                        }]);
                }]);
        }, 'villageIdmLatest']) // Eager load relasi villageIdmLatest
            ->where('district_id', $district->id) // Filter berdasarkan district_id
            ->get(); // Ambil semua desa yang memenuhi kriteria
        // dd($villages[0]);

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
                    ->where('status', 'validasi')
                    ->whereHas('identities', function ($query) use ($id) {
                        $query->where('pendidikan', $id);
                    })
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