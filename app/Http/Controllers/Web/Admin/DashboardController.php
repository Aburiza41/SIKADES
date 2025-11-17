<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Official;
use App\Models\Organization;
use App\Models\Position;
use App\Models\Regency;
use App\Models\Study;
use App\Models\Training;
use App\Models\Village;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Promise;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard SuperAdmin.
     */
    // public function index()
    // {
    //     // Count Dari Total Data Tabel
    //     $regency = Regency::count();
    //     $district = District::count();
    //     $village = Village::count();
    //     // $official = Official::count();

    //     // Ambil data pendidikan dari tabel studies
    //     $educationLevels = Study::pluck('name', 'id')->toArray();

    //     // Hitung total pejabat dengan status "validasi"
    //     $official = Official::where('status', 'validasi')
    //     ->count();

    //     // Status Pejabat
    //     $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
    //     $status_pejabat = array_map(function($status) {
    //         return Official::where('status', $status)->count();
    //     }, $statusOptions);

    //     // Jenis Kelamin
    //     $genderOptions = ['L', 'P'];
    //     $jenis_kelamin = array_map(function($gender) {
    //         return Official::where('jenis_kelamin', $gender)->count();
    //     }, $genderOptions);

    //     // Hitung total pejabat berdasarkan pendidikan dengan status "validasi"
    //     $pendidikan = [];
    //     // foreach ($educationLevels as $id => $education) {
    //     //     $pendidikan[$education] = Official::where('status', 'validasi')
    //     //         ->whereHas('identities', function ($q) use ($id) {
    //     //             $q->where('pendidikan', $id);
    //     //         })
    //     //         ->count();
    //     // }

    //     // Kirim data ke view
    //     return Inertia::render('Admin/Dashboard/Page', [
    //         'regency' => $regency,
    //         'district' => $district,
    //         'village' => $village,
    //         'official' => $official,
    //         'status_pejabat' => $status_pejabat,
    //         'jenis_kelamin' => $jenis_kelamin,
    //         'pendidikan' => $pendidikan,
    //     ]);
    // }

    // public function index(Request $request)
    // {
    //     // Count Dari Total Data Tabel
    //     $regency = Regency::count();
    //     $district = District::count();
    //     $village = Village::count();
    //      $villages = Village::all();
    //     // $official = Official::count();

    //     // Ambil data pendidikan dari tabel studies
    //     $educationLevels = Study::pluck('name', 'id')->toArray();

    //     // Hitung total pejabat dengan status "validasi"
    //     $official = Official::
    //     count();

    //     // Hitung total pejabat dengan status "validasi"
    //     $official_count = Official::whereIn('village_id', $villages->pluck('id'))
    //         // ->where('status', 'validasi')
    //         ->count();

    //     // Status Pejabat
    //     $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
    //     $status_pejabat = array_map(function($status) {
    //         return Official::where('status', $status)->count();
    //     }, $statusOptions);

    //     // Jenis Kelamin
    //     $genderOptions = ['L', 'P'];
    //     $jenis_kelamin = array_map(function($gender) {
    //         return Official::where('jenis_kelamin', $gender)->count();
    //     }, $genderOptions);

    //     // Hitung total pejabat berdasarkan pendidikan dengan status "validasi"
    //     $pendidikan = [];
    //     foreach ($educationLevels as $id => $education) {
    //         $pendidikan[$education] = Official::
    //             // ->where('status', 'validasi')
    //             whereHas('identities', function ($q) use ($id) {
    //                 $q->where('pendidikan_terakhir', $id);
    //             })
    //             ->count();
    //     }

    //     // Hitung Data Pelatihan
    //     $trainingLevels = Training::all();
    //     $trainings = [];

    //     foreach ($trainingLevels as $trainingLevel) {
    //         // Use training name or id as the array key
    //         $trainings[$trainingLevel->title] = Official::
    //             // ->where('status', 'validasi')
    //             whereHas('officialTrainings', function ($q) use ($trainingLevel) {
    //                 $q->where('training_id', $trainingLevel->id);
    //             })
    //             ->count();
    //     }

    //     // Hitung Data Organisasi
    //     $organizationLevels = \App\Models\Organization::all();
    //     $organizations = [];

    //     foreach ($organizationLevels as $organizationLevel) {
    //         // Use organization name or id as the array key
    //         $organizations[$organizationLevel->name] = Official::
    //         // ->where('status', 'validasi')
    //         whereHas('officialOrganizations', function ($q) use ($organizationLevel) {
    //             $q->where('organization_id', $organizationLevel->id);
    //         })
    //         ->count();
    //     }

    //     // Hitung Berdasarkan Agaman
    //     // Hitung total pejabat berdasarkan agama dengan status "validasi"
    //     $religionOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kosong'];
    //     $agama = array_map(function ($religion) use ($villages) {
    //         return Official::
    //             // ->where('status', 'validasi')
    //             where('agama', $religion)
    //             ->count();
    //     }, $religionOptions);

    //             // Golongan Darah
    //     // Hitung total pejabat berdasarkan golongan darah dengan status "validasi"
    //     $bloodTypeOptions = ['A', 'B', 'AB', 'O', 'Kosong'];
    //     $golongan_darah = array_map(function ($bloodType) use ($villages) {
    //         return Official::
    //             // ->where('status', 'validasi')
    //             whereHas('identities', function ($q) use ($bloodType) {
    //                 $q->where('gol_darah', $bloodType);
    //             })
    //             ->count();
    //     }, $bloodTypeOptions);

    //     // dd($golongan_darah);

    //             // Jabatan
    //     // Hitung total pejabat berdasarkan jabatan dengan status "validasi"
    //     $positions = Position::all();
    //     $jabatan = [];

    //     $total_posisi = 0;
    //     $total_terisi = 0;
    //     foreach ($positions as $position) {
    //         $jabatan[$position->name] = Official::
    //             // ->where('status', 'validasi')
    //             whereHas('position_current', function ($q) use ($position) {
    //                 $q->where('position_id', $position->id);
    //             })
    //             ->count();

    //         $total_posisi++;

    //         if($jabatan[$position->name] > 0){
    //             $total_terisi++;
    //         }
    //     }
    //     $kelengkapan_data = round($total_terisi/$total_posisi * 100);
    //     // dd($jabatan, $total_posisi, $total_terisi, round($total_terisi/$total_posisi * 100));
    //     // Hitung total pejabat berdasarkan status perkawinan dengan status "validasi"
    //     $maritalStatusOptions = ['Belum Kawin', 'Kawin', 'Duda', 'Janda', 'Kosong'];
    //     $status_perkawinan = array_map(function ($status) use ($villages) {
    //         return Official::
    //             // ->where('status', 'validasi')
    //             where('status_perkawinan', $status)
    //             ->count();
    //     }, $maritalStatusOptions);
    //             // dd($trainings, $trainingLevel);


    //     $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
    //         ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
    //             $query->where(function ($q) use ($request) {
    //                 $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
    //                     ->orWhere('nik', 'like', '%' . $request->search . '%')
    //                     ->orWhere('nipd', 'like', '%' . $request->search . '%');
    //             });
    //         })
    //         ->when($request->filled('filters'), function ($query) use ($request) {
    //             $query->whereHas('identities', function ($q) use ($request) {
    //                 $q->where('pendidikan_terakhir', $request->filters); // Filter berdasarkan ID village
    //             });
    //         })
    //         // ->when($role, function ($query) use ($role) {
    //         //     $query->whereHas('position_current.position', function ($q) use ($role) {
    //         //         $q->where('slug', $role); // Filter berdasarkan position->slug
    //         //     });
    //         // })
    //         ->orderBy(
    //             in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
    //             in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
    //         )
    //         ->paginate($request->per_page ?? 10);


    //     // Hitung total posisi
    //     $postions = Position::count();

    //     // Kirim data ke view
    //     return Inertia::render('Admin/Dashboard/Page', [
    //         'regency' => $regency,
    //         'district' => $district,
    //         'village' => $village,
    //         'official' => $official,
    //         'official_count' => $official_count,
    //         'status_pejabat' => $status_pejabat,
    //         'jenis_kelamin' => $jenis_kelamin,
    //         'pendidikan' => $pendidikan,
    //         'posisi' => $postions,
    //         'trainings' => $trainings,
    //         'organizations' => $organizations,
    //         'agama' => $agama,
    //         'golongan_darah' => $golongan_darah,
    //         'jabatan' => $jabatan,
    //         'status_perkawinan' => $status_perkawinan,
    //         'total_posisi' => $total_posisi,
    //         'total_terisi' => $total_terisi,
    //         'kelengkapan_data' => $kelengkapan_data,
    //         'officials' => [
    //             'current_page' => $officials->currentPage(),
    //             'data' => $officials->items(),
    //             'total' => $officials->total(),
    //             'per_page' => $officials->perPage(),
    //             'last_page' => $officials->lastPage(),
    //             'from' => $officials->firstItem(),
    //             'to' => $officials->lastItem(),
    //         ],
    //         'filters' => $request->filters,
    //         'sort' => $request->only(['sort_field', 'sort_direction']),
    //         'search' => $request->search,
    //     ]);
    // }

    public function index(Request $request)
    {
        // Ambil data desa yang terkait dengan user yang login
        // $village = Auth::user()->user_regency->regency ?? null;
        // dd($village);
        // $district = $village->district;
        $regencies = Regency::with('districts.villages')->get();
        $districts = $regencies->flatMap->districts;
        $villages = $districts->flatMap->villages; // Mengumpulkan
        // dd($villages);

        // Definisikan enum pendidikan
        $educationLevels = [
            'SD/MI' => 'SD/MI',
            'SMP/MTS/SLTP' => 'SMP/MTS/SLTP',
            'SMA/SMK/MA/SLTA/SMU' => 'SMA/SMK/MA/SLTA/SMU',
            'D1' => 'D1',
            'D2' => 'D2',
            'D3' => 'D3',
            'D4' => 'D4',
            'S1' => 'S1',
            'S2' => 'S2',
            'S3' => 'S3',
            'Lainnya' => 'Lainnya'
        ];

        // Parse filters dari request
        $filters = $request->filled('filters') ? json_decode($request->filters, true) : [];

        // Inisialisasi query untuk menghitung data dengan filter
        $baseQuery = Official::whereIn('village_id', $villages->pluck('id'));

        // Terapkan filter jika ada
        if (!empty($filters)) {
            // Filter berdasarkan kabupaten
            if (!empty($filters['kabupaten'])) {
                $baseQuery->whereHas('village.district.regency', function ($q) use ($filters) {
                    $q->where('id', $filters['kabupaten']);
                });
            }

            // Filter berdasarkan kecamatan
            if (!empty($filters['kecamatan'])) {
                $baseQuery->whereHas('village.district', function ($q) use ($filters) {
                    $q->where('id', $filters['kecamatan']);
                });
            }

            // Filter berdasarkan desa
            if (!empty($filters['desa'])) {
                $baseQuery->where('village_id', $filters['desa']);
            }

            // Filter berdasarkan pendidikan terakhir
            if (!empty($filters['education'])) {
                $baseQuery->whereHas('identities', function ($q) use ($filters) {
                    $q->where('pendidikan_terakhir', $filters['education']);
                });
            }

            // Filter berdasarkan jabatan
            if (!empty($filters['position'])) {
                $baseQuery->whereHas('position_current', function ($q) use ($filters) {
                    $q->whereHas('position', function ($subQ) use ($filters) {
                        $subQ->where('name', $filters['position']);
                    });
                });
            }

            // Filter berdasarkan jenis kelamin
            if (!empty($filters['jenis_kelamin'])) {
                $baseQuery->where('jenis_kelamin', $filters['jenis_kelamin'] === 'Laki-laki' ? 'L' : 'P');
            }

            // Filter berdasarkan agama
            if (!empty($filters['agama'])) {
                $baseQuery->where('agama', $filters['agama']);
            }

            // Filter berdasarkan golongan darah
            if (!empty($filters['golongan_darah'])) {
                $baseQuery->whereHas('identities', function ($q) use ($filters) {
                    $q->where('gol_darah', $filters['golongan_darah']);
                });
            }

            // Filter berdasarkan pelatihan
            if (!empty($filters['pelatihan'])) {
                if ($filters['pelatihan'] === 'Ya') {
                    $baseQuery->whereHas('officialTrainings');
                } elseif ($filters['pelatihan'] === 'Tidak') {
                    $baseQuery->whereDoesntHave('officialTrainings');
                }
            }

            // Filter berdasarkan organisasi
            if (!empty($filters['organisasi'])) {
                if ($filters['organisasi'] === 'Ya') {
                    $baseQuery->whereHas('officialOrganizations');
                } elseif ($filters['organisasi'] === 'Tidak') {
                    $baseQuery->whereDoesntHave('officialOrganizations');
                }
            }

            // Filter berdasarkan status aktif
            if (!empty($filters['status'])) {
                $baseQuery->where('status', $filters['status']);
            }

            // Filter pencarian
            if (!empty($filters['search'])) {
                $baseQuery->where(function ($q) use ($filters) {
                    $q->where('nama_lengkap', 'like', '%' . $filters['search'] . '%')
                        ->orWhere('nik', 'like', '%' . $filters['search'] . '%')
                        ->orWhere('nipd', 'like', '%' . $filters['search'] . '%');
                });
            }
        }

        // Hitung total pejabat
        $official_count = (clone $baseQuery)->count();

        // Hitung total pejabat berdasarkan status
        $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
        $status_pejabat = array_map(function ($status) use ($baseQuery) {
            return (clone $baseQuery)->where('status', $status)->count();
        }, $statusOptions);

        // Hitung total pejabat berdasarkan jenis kelamin
        $genderOptions = ['L', 'P'];
        $jenis_kelamin = array_map(function ($gender) use ($baseQuery) {
            return (clone $baseQuery)->where('jenis_kelamin', $gender)->count();
        }, $genderOptions);

        // Hitung total pejabat berdasarkan pendidikan
        $pendidikan = [];
        foreach ($educationLevels as $education) {
            $pendidikan[$education] = (clone $baseQuery)->whereHas('identities', function ($q) use ($education) {
                $q->where('pendidikan_terakhir', $education);
            })->count();
        }

        // Hitung Data Pelatihan
        $trainingLevels = Training::all();
        $trainings = [];
        foreach ($trainingLevels as $trainingLevel) {
            $trainings[$trainingLevel->title] = (clone $baseQuery)->whereHas('officialTrainings', function ($q) use ($trainingLevel) {
                $q->where('training_id', $trainingLevel->id);
            })->count();
        }

        // Hitung Data Organisasi
        $organizationLevels = Organization::all();
        $organizations = [];
        foreach ($organizationLevels as $organizationLevel) {
            $organizations[$organizationLevel->name] = (clone $baseQuery)->whereHas('officialOrganizations', function ($q) use ($organizationLevel) {
                $q->where('organization_id', $organizationLevel->id);
            })->count();
        }

        // Hitung total pejabat berdasarkan agama
        $religionOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kosong'];
        $agama = array_map(function ($religion) use ($baseQuery) {
            return (clone $baseQuery)->where('agama', $religion)->count();
        }, $religionOptions);

        // Hitung total pejabat berdasarkan golongan darah
        $bloodTypeOptions = ['A', 'B', 'AB', 'O', 'Kosong'];
        $golongan_darah = array_map(function ($bloodType) use ($baseQuery) {
            return (clone $baseQuery)->whereHas('identities', function ($q) use ($bloodType) {
                $q->where('gol_darah', $bloodType);
            })->count();
        }, $bloodTypeOptions);

        // Hitung total pejabat berdasarkan jabatan
        $positions = Position::all();
        $jabatan = [];
        $total_posisi = 0;
        $total_terisi = 0;
        foreach ($positions as $position) {
            $jabatan[$position->name] = (clone $baseQuery)->whereHas('position_current', function ($q) use ($position) {
                $q->where('position_id', $position->id);
            })->count();
            $total_posisi++;
            if ($jabatan[$position->name] > 0) {
                $total_terisi++;
            }
        }
        $kelengkapan_data = $total_posisi > 0 ? round($total_terisi / $total_posisi * 100) : 0;

        // Hitung total pejabat berdasarkan status perkawinan
        $maritalStatusOptions = ['Belum Kawin', 'Kawin', 'Duda', 'Janda', 'Kosong'];
        $status_perkawinan = array_map(function ($status) use ($baseQuery) {
            return (clone $baseQuery)->where('status_perkawinan', $status)->count();
        }, $maritalStatusOptions);

        // Ambil data pejabat dengan pagination dan filter
        $officials = (clone $baseQuery)
            ->with([
                'village.district.regency',
                'addresses',
                'contacts',
                'identities',
                'studies',
                'positions.position',
                'officialTrainings.training',
                'officialOrganizations.organization',
                'position_current.position',
                'statusLogs'
            ])
            ->orderBy(
                in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at'])
                    ? $request->sort_field
                    : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc'])
                    ? strtolower($request->sort_direction)
                    : 'asc'
            )
            ->paginate($request->per_page ?? 10);

        // dd($officials[0]);

        // Hitung total posisi
        $posisi = Position::count();

        // Kirim data ke view
        return Inertia::render('Admin/Dashboard/Page', [
            'regencies' => $regencies,
            'districts' => $districts,
            'villages' => $villages,
            'official' => $official_count,
            'official_count' => $official_count,
            'status_pejabat' => $status_pejabat,
            'jenis_kelamin' => $jenis_kelamin,
            'pendidikan' => $pendidikan,
            'posisi' => $posisi,
            'trainings' => $trainings,
            'organizations' => $organizations,
            'agama' => $agama,
            'golongan_darah' => $golongan_darah,
            'jabatan' => $jabatan,
            'status_perkawinan' => $status_perkawinan,
            'total_posisi' => $total_posisi,
            'total_terisi' => $total_terisi,
            'kelengkapan_data' => $kelengkapan_data,
            'officials' => [
                'current_page' => $officials->currentPage(),
                'data' => $officials->items(),
                'total' => $officials->total(),
                'per_page' => $officials->perPage(),
                'last_page' => $officials->lastPage(),
                'from' => $officials->firstItem(),
                'to' => $officials->lastItem(),
            ],
            'filters' => $filters,
            'sort' => $request->only(['sort_field', 'sort_direction']),
            'search' => $filters['search'] ?? '',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
