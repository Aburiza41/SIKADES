<?php

namespace App\Http\Controllers\Web\Village;

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
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Ambil data desa yang terkait dengan user yang login
        $village = Auth::user()->user_village->village ?? null;
        $district = $village->district;
        $regency = $district->regency;

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
        $baseQuery = Official::where('village_id', $village->id);

        // Terapkan filter jika ada
        if (!empty($filters)) {
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
            if (!empty($filters['gender'])) {
                $baseQuery->where('jenis_kelamin', $filters['gender']);
            }

            // Filter berdasarkan agama
            if (!empty($filters['religion'])) {
                $baseQuery->where('agama', $filters['religion']);
            }

            // Filter berdasarkan golongan darah
            if (!empty($filters['blood_type'])) {
                $baseQuery->whereHas('identities', function ($q) use ($filters) {
                    $q->where('gol_darah', $filters['blood_type']);
                });
            }

            // Filter berdasarkan pelatihan
            if (!empty($filters['training'])) {
                $baseQuery->whereHas('officialTrainings', function ($q) use ($filters) {
                    $q->whereHas('training', function ($subQ) use ($filters) {
                        $subQ->where('title', $filters['training']);
                    });
                });
            }

            // Filter berdasarkan organisasi
            if (!empty($filters['organization'])) {
                $baseQuery->whereHas('officialOrganizations', function ($q) use ($filters) {
                    $q->whereHas('organization', function ($subQ) use ($filters) {
                        $subQ->where('name', $filters['organization']);
                    });
                });
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
            ->with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies', 'positions.position', 'officialTrainings', 'officialOrganizations', 'positionCurrent.position'])
            ->orderBy(
                in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'nipd', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
            )
            ->paginate($request->per_page ?? 10);

        // dd($officials[0]);

        // Hitung total posisi
        $posisi = Position::count();

        // Kirim data ke view
        return Inertia::render('Village/Dashboard/Page', [
            'regency' => $regency,
            'district' => $district,
            'village' => $village,
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

    public function official(Request $request, String $role)
    {
        // dd($role);
        // Debug nid
        Log::info('Request parameters:', $request->all());

        $village = Auth::user()->user_village->village ?? null;

        // dd(Official::with(['position_current.position'])->first());
        // Query utama untuk officials dengan filter dan sorting
        $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
            ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                        ->orWhere('nik', 'like', '%' . $request->search . '%')
                        ->orWhere('nipd', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('filters'), function ($query) use ($request) {
                $query->whereHas('identities', function ($q) use ($request) {
                    $q->where('pendidikan_terakhir', $request->filters); // Filter berdasarkan ID village
                });
            })
            ->when($village->id, function ($query) use ($village) {
                $query->whereHas('village', function ($q) use ($village) {
                    $q->where('id', $village->id); // Filter berdasarkan ID village
                });
            })
            ->when($role, function ($query) use ($role) {
                $query->whereHas('position_current.position', function ($q) use ($role) {
                    $q->where('slug', $role); // Filter berdasarkan position->slug
                });
            })
            ->orderBy(
                in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
            )
            ->paginate($request->per_page ?? 10);

        // dd($officials[0]->identities);
        // dd($officials);
        // Cari Position
        $position = Position::where('slug', $role)->first();

        // dd($position, $officials);

        // Kembalikan data menggunakan Inertia
        // return Inertia::render('Village/Official/Page', [
        //     'officials' => [
        //         'current_page' => $officials->currentPage(),
        //         'data' => $officials->items(),
        //         'total' => $officials->total(),
        //         'per_page' => $officials->perPage(),
        //         'last_page' => $officials->lastPage(),
        //         'from' => $officials->firstItem(),
        //         'to' => $officials->lastItem(),
        //     ],
        //     'filters' => $request->filters, // Kirim filter yang aktif
        //     'sort' => $request->only(['sort_field', 'sort_direction']), // Kirim sorting yang aktif
        //     'search' => $request->search, // Kirim pencarian yang aktif
        //     'role' => $role,
        //     'position' => $position
        // ]);
        return Inertia::render('Village/Official/Page', [
            'officials' => [
                'current_page' => $officials->currentPage(),
                'data' => $officials->items(),
                'total' => $officials->total(),
                'per_page' => $officials->perPage(),
                'last_page' => $officials->lastPage(),
                'from' => $officials->firstItem(),
                'to' => $officials->lastItem(),
            ],
            'filters' => $request->filters, // Kirim filter yang aktif
            'sort' => $request->only(['sort_field', 'sort_direction']), // Kirim sorting yang aktif
            'search' => $request->search, // Kirim pencarian yang aktif
            'role' => $role,
            'position' => $position
        ]);
    }
}
