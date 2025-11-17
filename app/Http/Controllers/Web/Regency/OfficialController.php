<?php

namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use App\Models\Official;
use App\Models\OfficialStatusLog;
use App\Models\Organization;
use App\Models\Position;
use App\Models\PositionOfficial;
use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index(Request $request, String $role)
    // {
    //     // // Ambil regency dari user yang login
    //     // $regency = Auth::user()->user_regency->regency;

    //     // // Ambil semua village_id di bawah regency
    //     // $villageIds = $regency->districts->flatMap(function ($district) {
    //     //     return $district->villages->pluck('id');
    //     // })->toArray();

    //     // // Debug request
    //     // Log::info('Request parameters:', $request->all());

    //     // // Query utama untuk officials dengan filter dan sorting
    //     // $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations'])
    //     //     ->whereIn('village_id', $villageIds) // Filter berdasarkan village_id di bawah regency
    //     //     ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
    //     //         $query->where(function ($q) use ($request) {
    //     //             $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
    //     //                 ->orWhere('nik', 'like', '%' . $request->search . '%')
    //     //                 ->orWhere('niad', 'like', '%' . $request->search . '%');
    //     //         });
    //     //     })
    //     //     ->when($request->filled('filters'), function ($query) use ($request) {
    //     //         $query->whereHas('village', function ($q) use ($request) {
    //     //             $q->where('pendidikan', $request->filters); // Filter berdasarkan pendidikan
    //     //         });
    //     //     })
    //     //     ->orderBy(
    //     //         in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
    //     //         in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
    //     //     )
    //     //     ->paginate($request->per_page ?? 10);

    //     // // dd($officials);

    //     // // Kembalikan data menggunakan Inertia
    //     // return Inertia::render('Regency/Official/Page', [
    //     //     'officials' => [
    //     //         'current_page' => $officials->currentPage(),
    //     //         'data' => $officials->items(),
    //     //         'total' => $officials->total(),
    //     //         'per_page' => $officials->perPage(),
    //     //         'last_page' => $officials->lastPage(),
    //     //         'from' => $officials->firstItem(),
    //     //         'to' => $officials->lastItem(),
    //     //     ],
    //     //     'filters' => $request->filters, // Kirim filter yang aktif
    //     //     'sort' => $request->only(['sort_field', 'sort_direction']), // Kirim sorting yang aktif
    //     //     'search' => $request->search, // Kirim pencarian yang aktif
    //     // ]);
    //     // dd($role);
    //     // Debug nid
    //     Log::info('Request parameters:', $request->all());


    //     $regency = Auth::user()->user_regency->regency ?? null;
    //     // dd($village);
    //     // $district = $village->district;
    //     // $regency = $district->regency;

    //     // dd(Official::with(['position_current.position'])->first());
    //     // Query utama untuk officials dengan filter dan sorting
    //     $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
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

    //         /* <--- BARU: filter kecamatan (kode bps) ---> */
    //         ->when($request->filled('kecamatan'), function ($query) use ($request) {
    //         $query->whereHas('village.district', function ($q) use ($request) {
    //         $q->where('code_bps', $request->kecamatan);
    //         });
    //         })

    //         /* <--- BARU: filter desa (kode bps) ---> */
    //             ->when($request->filled('desa'), function ($query) use ($request) {
    //             $query->whereHas('village', function ($q) use ($request) {
    //             $q->where('code_bps', $request->desa);
    //             });
    //             })

    //         ->when($regency->id, function ($query) use ($regency) {
    //             $query->whereHas('village.district.regency', function ($q) use ($regency) {
    //                 $q->where('id', $regency->id); // Filter berdasarkan ID village
    //             });
    //         })
    //         ->when($role, function ($query) use ($role) {
    //             $query->whereHas('position_current.position', function ($q) use ($role) {
    //                 $q->where('slug', $role); // Filter berdasarkan position->slug
    //             });
    //         })
    //         ->orderBy(
    //             in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
    //             in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
    //         )
    //         ->paginate($request->per_page ?? 10);

    //     // dd($officials[0]->identities);
    //     // dd($officials);
    //     // Cari Position
    //     $position = Position::where('slug', $role)->first();

    //     // dd($position, $officials);

    //     // Kembalikan data menggunakan Inertia
    //     return Inertia::render('Regency/Official/Page', [
    //         'officials' => [
    //             'current_page' => $officials->currentPage(),
    //             'data' => $officials->items(),
    //             'total' => $officials->total(),
    //             'per_page' => $officials->perPage(),
    //             'last_page' => $officials->lastPage(),
    //             'from' => $officials->firstItem(),
    //             'to' => $officials->lastItem(),
    //         ],
    //         'filters' => $request->filters, // Kirim filter yang aktif
    //         'sort' => $request->only(['sort_field', 'sort_direction']), // Kirim sorting yang aktif
    //         'search' => $request->search, // Kirim pencarian yang aktif
    //         'role' => $role,
    //         'position' => $position,
    //         'regency_code' => $regency
    //     ]);
    // }

    public function index(Request $request, String $role)
    {
        // Log request parameters for debugging
        Log::info('Request parameters:', $request->all());

        // Ambil data desa yang terkait dengan user yang login
        $regency = Auth::user()->user_regency->regency ?? null;
        if (!$regency) {
            return Inertia::render('Regency/Official/Page', [
                'error' => 'User tidak terkait dengan desa.',
            ]);
        }

        $districts = $regency->districts;
        $villages = $districts->flatMap->villages; // Mengumpulkan

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

        // In audiovisualsiasi query untuk menghitung data dengan filter
        $baseQuery = Official::whereIn('village_id', $villages->pluck('id'))
            ->when($role, function ($query) use ($role) {
                $query->whereHas('position_current.position', function ($q) use ($role) {
                    $q->where('slug', $role);
                });
            });

        // Terapkan filter jika ada
        if (!empty($filters)) {
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
                        ->orWhere('niad', 'like', '%' . $filters['search'] . '%');
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

        // Cari Position berdasarkan role
        $position = Position::where('slug', $role)->firstOrFail();

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

        // Filter officials aktif berdasarkan tmt_jabatan
        $selectFilteredOfficials = (clone $baseQuery)
            ->whereHas('position_current', function ($q) use ($role) {
                $q->whereHas('position', function ($subQ) use ($role) {
                    $subQ->where('slug', $role);
                })->whereNotNull('tmt_jabatan')->where('tmt_jabatan', '<=', now());
            })
            ->with(['position_current.position'])
            ->get()
            ->sortByDesc('position_current.tmt_jabatan')
            ->take($position->max)
            ->values();

        // dd($pendidikan);

        // Kirim data ke view
        return Inertia::render('Regency/Official/Page', [
            'initialOfficials' => $officials->items(),
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
            'role' => $role,
            'position' => [
                'name' => $position->name,
                'slug' => $position->slug,
                'max' => $position->max
            ],
            'selectFilteredOfficials' => $selectFilteredOfficials,
            'regency' => [
                'name_bps' => $regency->name_bps,
                'code_bps' => $regency->code_bps
            ],
            'districts' => $districts,
            'village' => $villages,
            'official_count' => $official_count,
            'total_posisi' => $total_posisi,
            'total_terisi' => $total_terisi,
            'kelengkapan_data' => $kelengkapan_data,
            'status_pejabat' => $status_pejabat,
            'jenis_kelamin' => $jenis_kelamin,
            'pendidikan' => $pendidikan,
            'jabatan' => $jabatan,
            'trainings' => $trainings,
            'organizations' => $organizations,
            'agama' => $agama,
            'golongan_darah' => $golongan_darah,
            'status_perkawinan' => $status_perkawinan
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
        $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations'])
            ->where('nik', $id)
            ->firstOrFail();

        return Inertia::render('Regency/Official/Show', [
            'official' => $officials,
        ]);
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
    /**
 * Update the specified resource in storage.
 */
public function update(Request $request, string $id, string $action)
{
    // Debugging
    // dd($request->all(), $id, $action);

    // Validasi $action, hanya bisa accept atau reject
    if (!in_array($action, ['accept', 'reject'])) {
        return response()->json(['message' => 'Invalid action'], 400);
    }

    // Ambil data official
    $official = Official::where('nik', $id)->firstOrFail();

    // Update status berdasarkan action
    switch ($action) {
        case 'accept':
            $official->status = 'validasi';
            break;
        case 'reject':
            $official->status = 'tolak';
            break;
    }

    // Simpan perubahan
    $official->save();

    // Kembalikan response dengan flash message
    return redirect()->back()->with('success', 'Official status updated successfully.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function accept(Request $request, $role, $nik, $status)
    {
        // Validasi input
        $request->validate([
            'notes' => 'nullable|string', // Catatan opsional
        ]);

        // Cari Official berdasarkan NIK dan role
        $official = Official::where('nik', $nik)
            ->whereHas('positionOfficials.position', function ($query) use ($role) {
                $query->where('slug', $role);
            })
            ->first();

        // Cek apakah official ditemukan
        if (!$official) {
            return Inertia::location(redirect()->back()->withErrors([
                'message' => 'Official dengan NIK dan role tersebut tidak ditemukan',
            ]));
        }

        // Simpan status sebelumnya untuk log
        $statusSebelumnya = $official->status;

        // Update status official menjadi 'validasi'
        if($status == 'reject'){
            $official->status = 'tolak';
        }else{
            $official->status = 'validasi';
        }

        // Update user_regency_id dengan ID pengguna yang sedang login (jika role adalah kabupaten)
        if ($role === 'regency') {
            $official->user_regency_id = Auth::id();
        }

        $official->save();

        // Tambahkan log ke tabel official_status_logs
        OfficialStatusLog::create([
            'official_id' => $official->id,
            'status_sebelumnya' => $statusSebelumnya,
            'status_baru' => 'validasi',
            'user_id' => Auth::id(), // ID pengguna yang melakukan perubahan
            'keterangan' => $request->input('notes'), // Catatan dari request (boleh kosong)
        ]);

        // Kembalikan respons sukses dengan flash message
        return redirect()->back()->with([
            'success' => [
                'message' => 'Verifikasi diterima',
                'nama_lengkap' => $official->nama_lengkap,
                'nik' => $official->nik,
                'status' => $official->status,
                'notes' => $request->input('notes'),
            ]
        ]);
    }
}
