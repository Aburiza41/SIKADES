<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Official;
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
        // dd(Auth::user()->name);
        $village = Auth::user()->user_village->village ?? null;
        $district = $village->district;
        $regency = $district->regency;

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Hitung total pejabat dengan status "validasi"
        $official_count = Official::where('village_id', $village->id)
            // ->where('status', 'validasi')
            ->count();

            // Hitung total pejabat dengan status "validasi"
        $official = Official::where('village_id', $village->id)
            // ->where('status', 'validasi')
            ->count();

        // Hitung total pejabat berdasarkan status
        $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
        $status_pejabat = array_map(function ($status) use ($village) {
            return Official::where('village_id', $village->id)
                ->where('status', $status)
                ->count();
        }, $statusOptions);

        // Hitung total pejabat berdasarkan jenis kelamin dengan status "validasi"
        $genderOptions = ['L', 'P'];
        $jenis_kelamin = array_map(function ($gender) use ($village) {
            return Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->where('jenis_kelamin', $gender)
                ->count();
        }, $genderOptions);

        // Hitung total pejabat berdasarkan pendidikan dengan status "validasi"
        // $pendidikan = [];
        // foreach ($educationLevels as $id => $education) {
        //     $pendidikan[$education] = Official::where('village_id', $village->id)
        //         ->where('status', 'validasi')
        //         ->whereHas('identities', function ($q) use ($id) {
        //             $q->where('pendidikan', $id);
        //         })
        //         ->count();
        // }

        // Hitung total pejabat berdasarkan pendidikan dengan status "validasi"
        $pendidikan = [];
        foreach ($educationLevels as $id => $education) {
            $pendidikan[$education] = Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan_terakhir', $id); // Ubah 'pendidikan' menjadi 'pendidikan_terakhir'
                })
                ->count();
        }

        // Hitung Data Pelatihan
        $trainingLevels = Training::all();
        $trainings = [];

        foreach ($trainingLevels as $trainingLevel) {
            // Use training name or id as the array key
            $trainings[$trainingLevel->title] = Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->whereHas('officialTrainings', function ($q) use ($trainingLevel) {
                    $q->where('training_id', $trainingLevel->id);
                })
                ->count();
        }

        // Hitung Data Organisasi
        $organizationLevels = \App\Models\Organization::all();
        $organizations = [];

        foreach ($organizationLevels as $organizationLevel) {
            // Use organization name or id as the array key
            $organizations[$organizationLevel->name] = Official::where('village_id', $village->id)
            // ->where('status', 'validasi')
            ->whereHas('officialOrganizations', function ($q) use ($organizationLevel) {
                $q->where('organization_id', $organizationLevel->id);
            })
            ->count();
        }

        // Hitung Berdasarkan Agaman
        // Hitung total pejabat berdasarkan agama dengan status "validasi"
        $religionOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kosong'];
        $agama = array_map(function ($religion) use ($village) {
            return Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->where('agama', $religion)
                ->count();
        }, $religionOptions);

                // Golongan Darah
        // Hitung total pejabat berdasarkan golongan darah dengan status "validasi"
        $bloodTypeOptions = ['A', 'B', 'AB', 'O', 'Kosong'];
        $golongan_darah = array_map(function ($bloodType) use ($village) {
            return Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($bloodType) {
                    $q->where('gol_darah', $bloodType);
                })
                ->count();
        }, $bloodTypeOptions);

        // dd($golongan_darah);

                // Jabatan
        // Hitung total pejabat berdasarkan jabatan dengan status "validasi"
        $positions = Position::all();
        $jabatan = [];

        $total_posisi = 0;
        $total_terisi = 0;
        foreach ($positions as $position) {
            $jabatan[$position->name] = Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->whereHas('position_current', function ($q) use ($position) {
                    $q->where('position_id', $position->id);
                })
                ->count();

            $total_posisi++;

            if($jabatan[$position->name] > 0){
                $total_terisi++;
            }
        }
        $kelengkapan_data = round($total_terisi/$total_posisi * 100);
        // dd($jabatan, $total_posisi, $total_terisi, round($total_terisi/$total_posisi * 100));
        // Hitung total pejabat berdasarkan status perkawinan dengan status "validasi"
        $maritalStatusOptions = ['Belum Kawin', 'Kawin', 'Duda', 'Janda', 'Kosong'];
        $status_perkawinan = array_map(function ($status) use ($village) {
            return Official::where('village_id', $village->id)
                // ->where('status', 'validasi')
                ->where('status_perkawinan', $status)
                ->count();
        }, $maritalStatusOptions);
                // dd($trainings, $trainingLevel);


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
            // ->when($role, function ($query) use ($role) {
            //     $query->whereHas('position_current.position', function ($q) use ($role) {
            //         $q->where('slug', $role); // Filter berdasarkan position->slug
            //     });
            // })
            ->orderBy(
                in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
            )
            ->paginate($request->per_page ?? 10);


        // Hitung total posisi
        $postions = Position::count();

        // Kirim data ke view
        return Inertia::render('Village/Dashboard/Page', [
            'regency' => $regency,
            'district' => $district,
            'village' => $village,
            'official' => $official,
            'official_count' => $official_count,
            'status_pejabat' => $status_pejabat,
            'jenis_kelamin' => $jenis_kelamin,
            'pendidikan' => $pendidikan,
            'posisi' => $postions,
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
            'filters' => $request->filters,
            'sort' => $request->only(['sort_field', 'sort_direction']),
            'search' => $request->search,
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
