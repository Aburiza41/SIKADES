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

        // Data tingkat pendidikan
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
            $regency->total_districts = $regency->districts()->count();

            // Hitung total Desa dengan optimasi query
            $regency->total_villages = $regency->districts()->withCount('villages')->get()->sum('villages_count');

            // Base query untuk officials dengan status validasi
            $baseOfficialsQuery = function ($query) {
                $query->where('status', 'daftar');
            };

            // Hitung total Perangkat Desa dengan status "validasi"
            $regency->total_officials = $regency->districts()
                ->with(['villages.officials' => $baseOfficialsQuery])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });

            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $count = \App\Models\Official::whereHas('village.district.regency', function($q) use ($regency) {
                            $q->where('id', $regency->id);
                        })
                        ->whereHas('identities', function($q) use ($education) {
                            $q->where('pendidikan_terakhir', $education);
                        })
                        ->count();

                $educationTotals[$education] = $count;
            }
            $regency->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin
            $genderTotals = [
                'L' => $regency->districts()
                    ->with(['villages.officials' => function ($query) use ($baseOfficialsQuery) {
                        $baseOfficialsQuery($query);
                        $query->where('jenis_kelamin', 'L');
                    }])
                    ->get()
                    ->sum(function ($district) {
                        return $district->villages->sum(function ($village) {
                            return $village->officials->count();
                        });
                    }),
                'P' => $regency->districts()
                    ->with(['villages.officials' => function ($query) use ($baseOfficialsQuery) {
                        $baseOfficialsQuery($query);
                        $query->where('jenis_kelamin', 'P');
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

        // Kembalikan data ke view dengan Inertia
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

        // Data pendidikan
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
            // Hitung total Kecamatan (optimasi query)
            $regency->total_districts = $regency->districts()->count();

            // Hitung total Desa (optimasi query)
            $regency->total_villages = $regency->districts()->withCount('villages')->get()->sum('villages_count');

            // Query dasar untuk perangkat desa dengan status validasi
            $baseOfficialsQuery = function ($query) {
                $query->where('status', 'daftar');
            };

            // Hitung total Perangkat Desa dengan status "validasi" (optimasi query)
            $regency->total_officials = $regency->districts()
                ->with(['villages.officials' => $baseOfficialsQuery])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });

            // Hitung total Perangkat berdasarkan Pendidikan
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
           $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $count = \App\Models\Official::whereHas('village.district.regency', function($q) use ($regency) {
                            $q->where('id', $regency->id);
                        })
                        ->whereHas('identities', function($q) use ($education) {
                            $q->where('pendidikan_terakhir', $education);
                        })
                        ->count();

                $educationTotals[$education] = $count;
            }
            $regency->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin
            $genderTotals = [
                'L' => 0,
                'P' => 0
            ];

            // Query untuk jenis kelamin Laki-laki
            $genderTotals['L'] = $regency->districts()
                ->with(['villages.officials' => function ($query) use ($baseOfficialsQuery) {
                    $baseOfficialsQuery($query);
                    $query->where('jenis_kelamin', 'L');
                }])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });

            // Query untuk jenis kelamin Perempuan
            $genderTotals['P'] = $regency->districts()
                ->with(['villages.officials' => function ($query) use ($baseOfficialsQuery) {
                    $baseOfficialsQuery($query);
                    $query->where('jenis_kelamin', 'P');
                }])
                ->get()
                ->sum(function ($district) {
                    return $district->villages->sum(function ($village) {
                        return $village->officials->count();
                    });
                });

            $regency->gender_totals = $genderTotals;
        });

        // Kembalikan data dengan format konsisten
        return response()->json([
            'success' => true,
            'data' => $regencies,
            'message' => 'Data kabupaten berhasil diambil'
        ]);
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
        // $educationLevels = Study::pluck('name', 'id')->toArray();
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

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "daftar"
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
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $district->villages()
                    ->with(['officials' => function ($query) use ($education) {
                        $query->where('status', 'daftar')
                            ->whereHas('identities', function ($q) use ($education) {
                                $q->where('pendidikan_terakhir', $education);
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
                        $query->where('status', 'daftar')->where('jenis_kelamin', 'L');
                    }])
                    ->get()
                    ->sum(function ($village) {
                        return $village->officials->count();
                    }),
                'P' => $district->villages()
                    ->with(['officials' => function ($query) {
                        $query->where('status', 'daftar')->where('jenis_kelamin', 'P');
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
            $query->where('status', 'daftar') // Filter hanya yang statusnya 'daftar'
                ->whereHas('positions', function ($q) use ($positionIds) {
                    $q->whereIn('position_id', $positionIds)
                        ->where('tmt_jabatan', '<=', Carbon::now())
                        ->where(function ($query) {
                            $query->where('periode', '>=', Carbon::now())
                                ->orWhereNull('periode');
                        })
                        ->latest('tmt_jabatan');
                })
                ->with(['positions' => function ($q) {
                    $q->where('tmt_jabatan', '<=', Carbon::now())
                        ->where(function ($query) {
                            $query->where('periode', '>=', Carbon::now())
                                ->orWhereNull('periode');
                        })
                        ->latest('tmt_jabatan')
                        ->with(['position' => function ($q) {
                            $q->select('id', 'name', 'description', 'min', 'level', 'parent_id');
                        }]);
                }]);
        }, 'villageIdmLatest'])
        ->where('district_id', $district->id)
        ->get();

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

        // Proses setiap Desa
        $villages->each(function ($village) use ($educationLevels, $positionIds) {
            // Hitung total Perangkat Desa dengan status "daftar" dan memenuhi kriteria posisi
            $village->total_officials = $village->officials()
                ->where('status', 'daftar')
                ->whereHas('positions', function ($q) use ($positionIds) {
                    $q->whereIn('position_id', $positionIds)
                        ->where('tmt_jabatan', '<=', Carbon::now())
                        ->where(function ($query) {
                            $query->where('periode', '>=', Carbon::now())
                                ->orWhereNull('periode');
                        });
                })
                ->count();

            // Hitung total Perangkat berdasarkan Pendidikan dengan status "daftar"
            $educationTotals = [];
            foreach ($educationLevels as $id => $education) {
                $educationTotals[$education] = $village->officials()
                    ->where('status', 'daftar')
                    ->whereHas('positions', function ($q) use ($positionIds) {
                        $q->whereIn('position_id', $positionIds)
                            ->where('tmt_jabatan', '<=', Carbon::now())
                            ->where(function ($query) {
                                $query->where('periode', '>=', Carbon::now())
                                    ->orWhereNull('periode');
                            });
                    })
                    ->whereHas('identities', function ($query) use ($education) {
                        $query->where('pendidikan_terakhir', $education);
                    })
                    ->count();
            }
            $village->education_totals = $educationTotals;

            // Hitung total Perangkat berdasarkan Jenis Kelamin dengan status "daftar"
            $genderTotals = [
                'L' => $village->officials()
                    ->where('status', 'daftar')
                    ->whereHas('positions', function ($q) use ($positionIds) {
                        $q->whereIn('position_id', $positionIds)
                            ->where('tmt_jabatan', '<=', Carbon::now())
                            ->where(function ($query) {
                                $query->where('periode', '>=', Carbon::now())
                                    ->orWhereNull('periode');
                            });
                    })
                    ->where('jenis_kelamin', 'L')
                    ->count(),
                'P' => $village->officials()
                    ->where('status', 'daftar')
                    ->whereHas('positions', function ($q) use ($positionIds) {
                        $q->whereIn('position_id', $positionIds)
                            ->where('tmt_jabatan', '<=', Carbon::now())
                            ->where(function ($query) {
                                $query->where('periode', '>=', Carbon::now())
                                    ->orWhereNull('periode');
                            });
                    })
                    ->where('jenis_kelamin', 'P')
                    ->count(),
            ];
            $village->gender_totals = $genderTotals;
        });

        return response()->json($villages);
    }
}
