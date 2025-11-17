<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\ChildrenOfficial;
use App\Models\District;
use App\Models\Official;
use App\Models\OfficialOrganization;
use App\Models\OfficialStudy;
use App\Models\OfficialTraining;
use App\Models\Organization;
use App\Models\PositionOfficial;
use App\Models\Position;
use App\Models\Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Models\OfficialAddress;
use App\Models\OfficialContact;
use App\Models\OfficialIdentity;
use App\Models\ParentOfficial;
use App\Models\Regency;
use App\Models\Role;
use App\Models\SpouseOfficial;
use App\Models\Study;
use App\Models\Village;
use App\Models\WorkPlaceOfficial;
use COM;
use Illuminate\Support\Facades\Storage;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request, String $role)
    {
        // Log request parameters for debugging
        Log::info('Request parameters:', $request->all());

        // Ambil data desa yang terkait dengan user yang login
        $village = Auth::user()->user_village->village ?? null;
        if (!$village) {
            return Inertia::render('Village/Official/Page', [
                'error' => 'User tidak terkait dengan desa.',
            ]);
        }
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

        // In audiovisualsiasi query untuk menghitung data dengan filter
        $baseQuery = Official::where('village_id', $village->id)
            ->when($role, function ($query) use ($role) {
                $query->whereHas('position_current.position', function ($q) use ($role) {
                    $q->where('slug', $role);
                });
            });

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
        return Inertia::render('Village/Official/Page', [
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
            'district' => [
                'name_bps' => $district->name_bps,
                'code_bps' => $district->code_bps
            ],
            'village' => [
                'name_bps' => $village->name_bps,
                'code_bps' => $village->code_bps,
                'name_dagri' => $village->name_dagri
            ],
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
    public function create(String $role)
    {
        // Periksa User Login
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // Jika User role adalah village maka akan ada data village
        if (Auth::user()->role == 'village') {
            $village = Auth::user()->user_village->village;
        }

        // Jika Tidak ada data village maka lempar ke halaman login
        if (!$village) {
            return redirect()->route('login');
        }

        // dd($role, $village);

        return Inertia::render('Village/Official/Create', [
            'initialPositions' => \App\Models\Position::all()->toArray(),
            'initialTrainings' => \App\Models\Training::all()->toArray(),
            // 'organizations' => \App\Models\Organization::all()->toArray(),
            // Dummy data organizations
            'initialOrganizations' => Organization::all()->toArray(),
            'position' => $role,
            'jabatan' => Position::where('slug', $role)->first(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */


    public function store(Request $request, string $role)
    {
        // dd($request->all());
        // Check if user has village access
        if (Auth::user()->role == 'village') {
            $village = Auth::user()->user_village->village;
        }

        if (!$village) {
            return redirect()->route('login');
        }

        DB::beginTransaction();

        try {
            $village = Auth::user()->user_village->village;

            // Create official
            $official = $this->createOfficial($request, $village->id);

            // Create related records
            $this->createOfficialAddress($request, $official);
            $this->createOfficialContact($request, $official);
            $this->createOfficialIdentity($request, $official);
            $this->createStudies($request, $official);

            // Create workplace
            $this->createWorkplace($request, $official);

            // Create position
            $this->createPosition($request, $official);

            // Create trainings
            $this->createTrainings($request, $official);

            // Create organizations
            $this->createOrganizations($request, $official);

            // Create family records
            $this->createParents($request, $official);
            $this->createSpouse($request, $official);
            $this->createChildren($request, $official);

            // Update status if all required data is present
            $this->updateOfficialStatus($official);

            DB::commit();

            return redirect()
                ->route('village.official.index', [$role])
                ->with('success', 'Data berhasil disimpan.');
        } catch (\Exception $e) {

            DB::rollBack();
            dd($e, $request->all());
            Log::error('Error storing official data: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Gagal menyimpan data. Silakan coba lagi.')
                ->withInput();
        }
    }

    protected function createOfficial(Request $request, $villageId)
    {
        $officialData = [
            'village_id' => $villageId,
            'nik' => $request->input('official.nik'),
            'nipd' => $request->input('official.nipd'),
            'nama_lengkap' => $request->input('official.nama_lengkap'),
            'gelar_depan' => $request->input('official.gelar_depan'),
            'gelar_belakang' => $request->input('official.gelar_belakang'),
            'tempat_lahir' => $request->input('official.tempat_lahir'),
            'tanggal_lahir' => $request->input('official.tanggal_lahir'),
            'jenis_kelamin' => $request->input('official.jenis_kelamin'),
            'agama' => $request->input('official.agama'),
            'status_perkawinan' => $request->input('official.status_perkawinan'),
            'status' => 'daftar',
        ];

        return Official::create($officialData);
    }

    protected function createOfficialAddress(Request $request, $official)
    {
        $officialAddress = [
            'official_id' => $official->id,
            'rt' => $request->input('official.rt'),
            'rw' => $request->input('official.rw'),
            'kode_pos' => $request->input('official.postal'),
            'alamat' => $request->input('official.alamat'),
            'province_code' => $request->input('official.province_code'),
            'province_name' => $request->input('official.province_name'),
            'regency_code' => $request->input('official.regency_code'),
            'regency_name' => $request->input('official.regency_name'),
            'district_code' => $request->input('official.district_code'),
            'district_name' => $request->input('official.district_name'),
            'village_code' => $request->input('official.village_code'),
            'village_name' => $request->input('official.village_name'),
            'user_village_id' => Auth::user()->id
        ];

        OfficialAddress::create($officialAddress);
    }

    protected function createOfficialContact(Request $request, $official)
    {
        $officialContact = [
            'official_id' => $official->id,
            'handphone' => $request->input('official.handphone'),
        ];

        OfficialContact::create($officialContact);
    }

    protected function createOfficialIdentity(Request $request, $official)
    {
        $officialIdentity = [
            'official_id' => $official->id,
            'gol_darah' => $request->input('official.gol_darah') ?? null,
            'pendidikan_terakhir' => $request->input('official.pendidikan') ?? null,
            'bpjs_kesehatan' => $request->input('official.bpjs_kesehatan') ?? null,
            'bpjs_ketenagakerjaan' => $request->input('official.bpjs_ketenagakerjaan') ?? null,
            'npwp' => $request->input('official.npwp') ?? null,
        ];

        if ($request->hasFile('official.foto')) {
            $foto = $request->file('official.foto');
            $filename = time() . '_' . $foto->getClientOriginalName();
            $path = $foto->storeAs('public/officials', $filename);
            $officialIdentity['foto'] = 'officials/' . $filename;
        }

        OfficialIdentity::create($officialIdentity);
    }

    protected function createStudies(Request $request, $official)
    {
        $studies = $request->input('studies', []);

        foreach ($studies as $index => $study) {
            $inputStudy = [
                'official_id' => $official->id,
                'pendidikan_umum' => $study['tingkatPendidikan'],
                'nama_sekolah' => $study['namaSekolah'],
                'alamat_sekolah' => $study['tempat'],
                'nomor_ijazah' => $study['nomorIjazah'],
                'tanggal' => $study['tanggalIjazah']
            ];

            if ($request->hasFile("studies.{$index}.dokumenIjazah")) {
                $file = $request->file("studies.{$index}.dokumenIjazah");
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('public/uploads/studies', $fileName);
                $inputStudy['dokumen'] = $fileName;
            }

            OfficialStudy::create($inputStudy);
        }
    }

    protected function createWorkplace(Request $request, $official)
    {

        // $regency = Regency::where('code_bps', $request->input('tempat_kerja.regency_code'))->first();
        // $district = District::where('code_bps', $request->input('tempat_kerja.district_code'))->first();
        // $village = Village::where('code_bps', $request->input('tempat_kerja.village_code'))->first();

        // Auth
        // dd(Auth::user()->user_village->village->district->regency);

        // dd($regency, $district, $village, $request->all());

        $village = Auth::user()->user_village->village;
        $district = Auth::user()->user_village->village->district;
        $regency = Auth::user()->user_village->village->district->regency;

        $tempatKerja = [
            'official_id' => $official->id,
            'rt' => $request->input('tempat_kerja.rt'),
            'rw' => $request->input('tempat_kerja.rw'),
            'kode_pos' => $request->input('tempat_kerja.postal'),
            'alamat' => $request->input('tempat_kerja.alamat'),
            'regency_id' => $regency->id,
            'district_id' => $district->id,
            'village_id' => $village->id
        ];

        WorkPlaceOfficial::create($tempatKerja);
    }

    protected function createPosition(Request $request, $official)
    {
        $positionOfficial = [
            'official_id' => $official->id,
            'position_id' => $request->input('position.jabatanId') ?? null,
            'penetap' => $request->input('position.penetap') ?? null,
            'nomor_sk' => $request->input('position.nomorSk') ?? null,
            'tanggal_sk' => $request->input('position.tanggalSk') ?? null,
            'tmt_jabatan' => $request->input('position.tmtJabatan') ?? null,
            'periode' => $request->input('position.period') ?? null
        ];

        if ($request->hasFile('position.file')) {
            $foto = $request->file('position.file');
            $filename = time() . '_' . $foto->getClientOriginalName();
            $path = $foto->storeAs('public/officials', $filename);
            $positionOfficial['file_sk'] = 'officials/' . $filename;
        }

        PositionOfficial::create($positionOfficial);
    }

    protected function createTrainings(Request $request, $official)
    {
        $trainings = $request->input('trainings', []);

        foreach ($trainings as $index => $training) {
            $trainingModel = Training::firstOrCreate(
                ['title' => $training['pelatihan_title']],
                ['description' => $training['description'] ?? null]
            );

            $trainingInput = [
                'official_id' => $official->id,
                'training_id' => $trainingModel->id,
                'nama' => $training['nama'] ?? null,
                'alamat' => $training['tempat'] ?? null,
                'penyelenggara' => $training['penyelenggara'] ?? null,
                'nomor_sertifikat' => $training['nomor'] ?? null,
                'tanggal_sertifikat' => $training['tanggal'] ?? null,
                'keterangan' => $training['keterangan'] ?? null,
            ];

            if ($request->hasFile("trainings.{$index}.docScan")) {
                $file = $request->file("trainings.{$index}.docScan");
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('public/uploads/trainings', $fileName);
                $trainingInput['doc_scan'] = $fileName;
            }

            OfficialTraining::create($trainingInput);
        }
    }

    protected function createOrganizations(Request $request, $official)
    {
        $organizations = $request->input('organizations', []);

        foreach ($organizations as $index => $organization) {
            $organizationModel = Organization::firstOrCreate(
                ['title' => $organization['organization_title']],
                ['description' => $organization['organization_title'] ?? null]
            );

            $organizationInput = [
                'official_id' => $official->id,
                'organization_id' => $organizationModel->id,
                'nama' => $organization['nama'] ?? null,
                'posisi' => $organization['posisi'] ?? null,
                'mulai' => $organization['mulai'] ?? null,
                'selesai' => $organization['selesai'] ?? null,
                'pimpinan' => $organization['pimpinan'] ?? null,
                'alamat' => $organization['tempat'] ?? null,
                'keterangan' => $organization['keterangan'] ?? null,
            ];

            if ($request->hasFile("organizations.{$index}.doc_scan")) {
                $file = $request->file("organizations.{$index}.doc_scan");
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->storeAs('public/uploads/organizations', $fileName);
                $organizationInput['doc_scan'] = $fileName;
            }

            OfficialOrganization::create($organizationInput);
        }
    }

    protected function createParents(Request $request, $official)
    {
        $parents = $request->input('orang_tua', []);

        foreach ($parents as $index => $parent) {
            $parentInput = [
                'official_id' => $official->id,
                'nama' => $parent['nama'],
                'tempat_lahir' => $parent['tempat_lahir'],
                'tanggal_lahir' => $parent['tanggal_lahir'],
                'pekerjaan' => $parent['pekerjaan'],
                'hubungan' => $index == 0 ? "ayah" : "ibu",
                'alamat' => $parent['alamat'],
                'rt' => $parent['rt'],
                'rw' => $parent['rw'],
                'no_telepon' => $parent['telp'],
                'kode_pos' => $parent['kode_pos'],
                'province_code' => $parent['province_code'],
                'province_name' => $parent['province_name'],
                'regency_code' => $parent['regency_code'],
                'regency_name' => $parent['regency_name'],
                'district_code' => $parent['district_code'],
                'district_name' => $parent['district_name'],
                'village_code' => $parent['village_code'],
                'village_name' => $parent['village_name'],
            ];

            ParentOfficial::create($parentInput);
        }
    }

    protected function createSpouse(Request $request, $official)
    {
        $pasangan = $request->input('pasangan');

        if ($pasangan) {
            $hubungan = $pasangan['jenis_kelamin'] == 'Laki-laki' ? 'istri' : 'suami';

            $pasanganInput = [
                'official_id' => $official->id,
                'hubungan' => $hubungan,
                'nama' => $pasangan['nama'],
                'tempat_lahir' => $pasangan['tempat_lahir'],
                'tanggal_lahir' => $pasangan['tanggal_lahir'],
                'tanggal_nikah' => $pasangan['tanggal_nikah'],
                'pendidikan_umum' => $pasangan['pendidikan'],
                'pekerjaan' => $pasangan['pekerjaan'],
            ];

            SpouseOfficial::create($pasanganInput);
        }
    }

    protected function createChildren(Request $request, $official)
    {
        $anakList = $request->input('anak', []);

        foreach ($anakList as $index => $anak) {
            $anakInput = [
                'official_id' => $official->id,
                'nama' => $anak['nama'],
                'tempat_lahir' => $anak['tempat'],
                'tanggal_lahir' => $anak['tanggalLahir'],
                'jenis_kelamin' => $anak['jenisKelamin'],
                'status' => $anak['status'],
                'pendidikan_umum' => $anak['pendidikan'],
                'pekerjaan' => $anak['pekerjaan'],
            ];

            ChildrenOfficial::create($anakInput);
        }
    }

    protected function updateOfficialStatus($official)
    {
        if ($official->identities &&
            $official->positions &&
            $official->addresses &&
            $official->contacts &&
            $official->work_place) {
            $official->status = 'proses';
            $official->save();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // dd($id);
        // Ambil data official berdasarkan ID
        $official = Official::with(['officialStudies', 'positionOfficial', 'officialTrainings', 'officialOrganizations'])
            ->where('nik', $id)
            ->firstOrFail();

        return Inertia::render('Village/Official/Show', [
            'official' => $official,
        ]);
    }

    // public function edit(string $role, string $id)
    // {
    //     // Ambil data official berdasarkan ID dengan relasi yang diperlukan
    //     $official = Official::where('nik', $id)
    //         ->with([
    //             'addresses',
    //             'contacts',
    //             'identities',
    //             'studies',
    //             'positions.position',
    //             'officialTrainings',
    //             'officialOrganizations.organization',
    //             'work_place',
    //             'parents',
    //             'spouse',
    //             'children'
    //         ])
    //         ->firstOrFail();

    //     // Format data studies sesuai input
    //     $formattedStudies = [];
    //     foreach ($official->studies as $study) {
    //         $formattedStudies[] = [
    //             'tingkatPendidikan' => $study->pendidikan_umum,
    //             'namaSekolah' => $study->nama_sekolah,
    //             'tempat' => $study->alamat_sekolah,
    //             'nomorIjazah' => $study->nomor_ijazah,
    //             'tanggalIjazah' => $study->tanggal,
    //             // 'dokumenIjazah' => $study->dokumen ? 'exists' : null // Flag untuk menunjukkan dokumen ada
    //         ];
    //     }

    //     // dd($formattedStudies);

    //     // Format data trainings
    //     $formattedTrainings = [];
    //     foreach ($official->officialTrainings as $training) {
    //         $formattedTrainings[] = [
    //             'nama' => $training->nama,
    //             'tempat' => $training->alamat,
    //             'pelatihan' => $training->pelatihan,
    //             'penyelenggara' => $training->penyelenggara,
    //             'nomor' => $training->nomor_sertifikat,
    //             'tanggal' => $training->tanggal_sertifikat,
    //             'doc_scan' => $training->doc_scan ? 'exists' : null
    //         ];
    //     }

    //     // dd($formattedTrainings);

    //     // Format data organizations
    //     $formattedOrganizations = [];
    //     foreach ($official->officialOrganizations as $org) {
    //         $formattedOrganizations[] = [
    //             'organization_id' => $org->organization_id,
    //             'nama' => $org->nama,
    //             'posisi' => $org->posisi,
    //             'mulai' => $org->mulai,
    //             'selesai' => $org->selesai,
    //             'pimpinan' => $org->pimpinan,
    //             'tempat' => $org->alamat,
    //             // 'doc_scan' => $org->doc_scan ? 'exists' : null
    //         ];
    //     }

    //     // dd($formattedOrganizations);

    //     // Format data orang tua
    //     $formattedParents = [];
    //     foreach ($official->parents as $parent) {
    //         $formattedParents[] = [
    //             'nama' => $parent->nama,
    //             'tempatLahir' => $parent->tempat_lahir,
    //             'tanggalLahir' => $parent->tanggal_lahir,
    //             'pekerjaan' => $parent->pekerjaan,
    //             'alamat' => $parent->alamat,
    //             'rt' => $parent->rt,
    //             'rw' => $parent->rw,
    //             'telp' => $parent->no_telepon,
    //             'kodePos' => $parent->kode_pos,
    //             'province_code' => $parent->province_code,
    //             'province_name' => $parent->province_name,
    //             'regency_code' => $parent->regency_code,
    //             'regency_name' => $parent->regency_name,
    //             'district_code' => $parent->district_code,
    //             'district_name' => $parent->district_name,
    //             'village_code' => $parent->village_code,
    //             'village_name' => $parent->village_name,
    //         ];
    //     }

    //     // Format data pasangan
    //     $formattedSpouse = $official->spouse ? [
    //         'nama' => $official->spouse->nama,
    //         'tempat_lahir' => $official->spouse->tempat_lahir,
    //         'tanggal_lahir' => $official->spouse->tanggal_lahir,
    //         'tanggal_nikah' => $official->spouse->tanggal_nikah,
    //         'pendidikan' => $official->spouse->pendidikan_umum,
    //         'pekerjaan' => $official->spouse->pekerjaan,
    //         'jenis_kelamin' => $official->spouse->hubungan == 'istri' ? 'Perempuan' : 'Laki-laki'
    //     ] : null;

    //     // Format data anak
    //     $formattedChildren = [];
    //     foreach ($official->children as $child) {
    //         $formattedChildren[] = [
    //             'nama' => $child->nama,
    //             'tempat' => $child->tempat_lahir,
    //             'tanggalLahir' => $child->tanggal_lahir,
    //             'jenisKelamin' => $child->jenis_kelamin,
    //             'status' => $child->status,
    //             'pendidikan' => $child->pendidikan_umum,
    //             'pekerjaan' => $child->pekerjaan,
    //         ];
    //     }

    //     // dd($official->work_place->village);
    //     // Format tempat kerja
    //     $formattedWorkPlace = $official->work_place ? [
    //         'regency_code' => $official->work_place->regency->code_bps ??  $official->work_place->village->district->regency->code_bps,
    //         'regency_name' => $official->work_place->regency->name ??  $official->work_place->village->district->regency->code_bps,
    //         'district_code' => $official->work_place->district->code_bps ??  $official->work_place->village->district->code_bps,
    //         'district_name' => $official->work_place->district->name ??  $official->work_place->village->district->name,
    //         'village_code' => $official->work_place->village->code_bps,
    //         'village_name' => $official->work_place->village->name,
    //         // 'regency_code' => "",
    //         // 'regency_name' => "",
    //         // 'district_code' => "",
    //         // 'district_name' => "",
    //         // 'village_code' => "",
    //         'village_name' => "",
    //         'alamat' => $official->work_place->alamat,
    //         'rt' => $official->work_place->rt,
    //         'rw' => $official->work_place->rw,
    //         'postal' => $official->work_place->kode_pos,
    //     ] : null;

    //     // Position
    //     $formattedPosition = $official->position ? [
    //         // 'position_id',
    //         // 'official_id',
    //         // 'penetap',
    //         // 'nomor_sk',
    //         // 'tanggal_sk',
    //         // 'file_sk',
    //         // 'tmt_jabatan',
    //         // 'period',
    //         // 'keterangan',
    //         'penetap' => $official->position->penetap,
    //         'nomorSk' => $official->position->nomor_sk,
    //         'tanggalSk' => $official->position->tanggal_sk,
    //         'period' => $official->position->period,
    //         'tmtJabatan' => $official->position->tmt_jabatan,
    //     ] : null;
    //     // dd($formattedPosition);
    //     // dd($official->position->toArray());

    //     // return Inertia::render('Village/Official/Create', [
    //     //     'initialPositions' => \App\Models\Position::all()->toArray(),
    //     //     'initialTrainings' => \App\Models\Training::all()->toArray(),
    //     //     // 'organizations' => \App\Models\Organization::all()->toArray(),
    //     //     // Dummy data organizations
    //     //     'initialOrganizations' => Organization::all()->toArray(),
    //     //     'position' => $role,
    //     //     'jabatan' => Position::where('slug', $role)->first(),
    //     // ]);
    //     return Inertia::render('Village/Official/Edit', [
    //         'official' => $official,
    //         // 'official' => [
    //         //     'nik' => $official->nik,
    //         //     'nipd' => $official->nipd,
    //         //     'nama_lengkap' => $official->nama_lengkap,
    //         //     'gelar_depan' => $official->gelar_depan,
    //         //     'gelar_belakang' => $official->gelar_belakang,
    //         //     'tempat_lahir' => $official->tempat_lahir,
    //         //     'tanggal_lahir' => $official->tanggal_lahir,
    //         //     'jenis_kelamin' => $official->jenis_kelamin,
    //         //     'agama' => $official->agama,
    //         //     'status_perkawinan' => $official->status_perkawinan,
    //         //     'status' => $official->status,
    //         //     'rt' => $official->addresses->rt ?? null,
    //         //     'rw' => $official->addresses->rw ?? null,
    //         //     'postal' => $official->addresses->kode_pos ?? null,
    //         //     'alamat' => $official->addresses->alamat ?? null,
    //         //     'province_code' => $official->addresses->province_code ?? null,
    //         //     'province_name' => $official->addresses->province_name ?? null,
    //         //     'regency_code' => $official->addresses->regency_code ?? null,
    //         //     'regency_name' => $official->addresses->regency_name ?? null,
    //         //     'district_code' => $official->addresses->district_code ?? null,
    //         //     'district_name' => $official->addresses->district_name ?? null,
    //         //     'village_code' => $official->addresses->village_code ?? null,
    //         //     'village_name' => $official->addresses->village_name ?? null,
    //         //     'handphone' => $official->contacts->handphone ?? null,
    //         //     'gol_darah' => $official->identities->gol_darah ?? null,
    //         //     'pendidikan' => $official->identities->pendidikan ?? null,
    //         //     'bpjs_kesehatan' => $official->identities->bpjs_kesehatan ?? null,
    //         //     'bpjs_ketenagakerjaan' => $official->identities->bpjs_ketenagakerjaan ?? null,
    //         //     'npwp' => $official->identities->npwp ?? null,
    //         //     'foto' => $official->identities->foto ?? null,
    //         // ],
    //         'studies' => $formattedStudies,
    //         'tempat_kerja' => $formattedWorkPlace,
    //         'position' => PositionOfficial::where('official_id', $official->id)->with(['position'])->first(),
    //         'currentPosition' => $formattedPosition,
    //         'trainings' => $formattedTrainings,
    //         'organizations' => $formattedOrganizations,
    //         'orang_tua' => $formattedParents,
    //         'pasangan' => $formattedSpouse,
    //         'anak' => $formattedChildren,
    //         'initialPositions' => Position::all()->toArray(),
    //         'initialOrganizations' => Organization::all()->toArray(),
    //         'role' => $role,
    //         'id' => $id,
    //         'jabatan' => Position::where('slug', $role)->first(),
    //     ]);
    // }
    public function edit(string $role, string $id)
{
    // Ambil data official berdasarkan ID dengan relasi yang diperlukan
    $official = Official::where('nik', $id)
        ->with([
            'addresses',
            'contacts',
            'identities',
            'studies',
            'positions.position',
            'officialTrainings',
            'officialOrganizations.organization',
            'work_place',
            'parents',
            'spouse',
            'children'
        ])
        ->firstOrFail();

    // Format official data to match frontend expectations
    $formattedOfficial = [
        'nik' => $official->nik,
        'nipd' => $official->nipd,
        'nama_lengkap' => $official->nama_lengkap,
        'gelar_depan' => $official->gelar_depan,
        'gelar_belakang' => $official->gelar_belakang,
        'tempat_lahir' => $official->tempat_lahir,
        'tanggal_lahir' => $official->tanggal_lahir,
        'jenis_kelamin' => $official->jenis_kelamin,
        'agama' => $official->agama,
        'status_perkawinan' => $official->status_perkawinan,
        'status' => $official->status,
        'rt' => $official->addresses->rt ?? null,
        'rw' => $official->addresses->rw ?? null,
        'kode_pos' => $official->addresses->kode_pos ?? null,
        'alamat' => $official->addresses->alamat ?? null,
        'province_code' => $official->addresses->province_code ?? null,
        'province_name' => $official->addresses->province_name ?? null,
        'regency_code' => $official->addresses->regency_code ?? null,
        'regency_name' => $official->addresses->regency_name ?? null,
        'district_code' => $official->addresses->district_code ?? null,
        'district_name' => $official->addresses->district_name ?? null,
        'village_code' => $official->addresses->village_code ?? null,
        'village_name' => $official->addresses->village_name ?? null,
        'handphone' => $official->contacts->handphone ?? null,
        'gol_darah' => $official->identities->gol_darah ?? null,
        'pendidikan' => $official->identities->pendidikan ?? null,
        'bpjs_kesehatan' => $official->identities->bpjs_kesehatan ?? null,
        'bpjs_ketenagakerjaan' => $official->identities->bpjs_ketenagakerjaan ?? null,
        'npwp' => $official->identities->npwp ?? null,
        'foto' => $official->identities->foto ?? null,
    ];

    // Format data studies sesuai input
    $formattedStudies = [];
    foreach ($official->studies as $study) {
        $formattedStudies[] = [
            'tingkatPendidikan' => $study->pendidikan_umum,
            'namaSekolah' => $study->nama_sekolah,
            'tempat' => $study->alamat_sekolah,
            'nomorIjazah' => $study->nomor_ijazah,
            'tanggalIjazah' => $study->tanggal,
            'doc_scan' => $study->dokumen ? 'exists' : null
        ];
    }

    // Format data trainings
    $formattedTrainings = [];
    foreach ($official->officialTrainings as $training) {
        $formattedTrainings[] = [
            'nama' => $training->nama,
            'tempat' => $training->alamat,
            'pelatihan' => $training->pelatihan,
            'penyelenggara' => $training->penyelenggara,
            'nomor' => $training->nomor_sertifikat,
            'tanggal' => $training->tanggal_sertifikat,
            'doc_scan' => $training->doc_scan ? 'exists' : null
        ];
    }

    // dd(OfficialOrganization::with(['official'])->first());
    // dd($official->officialOrganizations);
    // Format data organizations
    $formattedOrganizations = [];
    foreach ($official->officialOrganizations as $org) {
        $formattedOrganizations[] = [
            'organization_id' => $org->organization_id,
            'organization_title' => $org->organization ? $org->organization->title : $org->nama, // Tambahkan organization_title
            'nama' => $org->nama,
            'posisi' => $org->posisi,
            'mulai' => $org->mulai,
            'selesai' => $org->selesai,
            'pimpinan' => $org->pimpinan,
            'tempat' => $org->alamat,
            'doc_scan' => $org->doc_scan ? 'exists' : null,
        ];
    }

    // Format data orang tua
    $formattedParents = [];
    foreach ($official->parents as $parent) {
        $formattedParents[] = [
            'nama' => $parent->nama,
            'tempatLahir' => $parent->tempat_lahir,
            'tanggalLahir' => $parent->tanggal_lahir,
            'pekerjaan' => $parent->pekerjaan,
            'alamat' => $parent->alamat,
            'rt' => $parent->rt,
            'rw' => $parent->rw,
            'telp' => $parent->no_telepon,
            'kodePos' => $parent->kode_pos,
            'province_code' => $parent->province_code,
            'province_name' => $parent->province_name,
            'regency_code' => $parent->regency_code,
            'regency_name' => $parent->regency_name,
            'district_code' => $parent->district_code,
            'district_name' => $parent->district_name,
            'village_code' => $parent->village_code,
            'village_name' => $parent->village_name,
        ];
    }

    // Format data pasangan
    $formattedSpouse = $official->spouse ? [
        'nama' => $official->spouse->nama,
        'tempat_lahir' => $official->spouse->tempat_lahir,
        'tanggal_lahir' => $official->spouse->tanggal_lahir,
        'tanggal_nikah' => $official->spouse->tanggal_nikah,
        'pendidikan' => $official->spouse->pendidikan_umum,
        'pekerjaan' => $official->spouse->pekerjaan,
        'jenis_kelamin' => $official->spouse->hubungan == 'istri' ? 'Perempuan' : 'Laki-laki'
    ] : [];

    // Format data anak
    $formattedChildren = [];
    foreach ($official->children as $child) {
        $formattedChildren[] = [
            'nama' => $child->nama,
            'tempat' => $child->tempat_lahir,
            'tanggalLahir' => $child->tanggal_lahir,
            'jenisKelamin' => $child->jenis_kelamin,
            'status' => $child->status,
            'pendidikan' => $child->pendidikan_umum,
            'pekerjaan' => $child->pekerjaan,
        ];
    }

    // Format tempat kerja
    $formattedWorkPlace = $official->work_place ? [
        'regency_code' => $official->work_place->regency->code_bps ?? null,
        'regency_name' => $official->work_place->regency->name ?? null,
        'district_code' => $official->work_place->district->code_bps ?? null,
        'district_name' => $official->work_place->district->name ?? null,
        'village_code' => $official->work_place->village->code_bps ?? null,
        'village_name' => $official->work_place->village->name ?? null,
        'alamat' => $official->work_place->alamat ?? null,
        'rt' => $official->work_place->rt ?? null,
        'rw' => $official->work_place->rw ?? null,
        'postal' => $official->work_place->kode_pos ?? null,
    ] : [
        'regency_code' => null,
        'regency_name' => null,
        'district_code' => null,
        'district_name' => null,
        'village_code' => null,
        'village_name' => null,
        'alamat' => null,
        'rt' => null,
        'rw' => null,
        'postal' => null,
    ];

    // Position
    $formattedPosition = $official->positions->first() ? [
        'penetap' => $official->positions->first()->penetap,
        'nomorSk' => $official->positions->first()->nomor_sk,
        'tanggalSk' => $official->positions->first()->tanggal_sk,
        'period' => $official->positions->first()->period,
        'tmtJabatan' => $official->positions->first()->tmt_jabatan,
    ] : [];

    return Inertia::render('Village/Official/Edit', [
        'official' => $formattedOfficial,
        'studies' => $formattedStudies,
        'tempat_kerja' => $formattedWorkPlace,
        'position' => PositionOfficial::where('official_id', $official->id)->with(['position'])->first() ?? [],
        'currentPosition' => $formattedPosition,
        'initialTrainings' => $formattedTrainings,
        'initialOrganizations' => $formattedOrganizations,
        'officialOrganizations' => $formattedOrganizations, // Gunakan officialOrganizations
        'allOrganizations' => Organization::all()->toArray(), // Daftar semua organisasi untuk dropdown
        'orang_tua' => $formattedParents,
        'pasangan' => $formattedSpouse,
        'anak' => $formattedChildren,
        'initialPositions' => Position::all()->toArray(),
        'role' => $role,
        'id' => $id,
        'jabatan' => Position::where('slug', $role)->first() ?? [],
    ]);
}


    // public function update(Request $request, $id)
    // {
    //     // Validasi data yang diterima
    //     $validator = Validator::make($request->all(), [
    //         // Validasi untuk official
    //         'official.nik' => 'required|string|max:16',
    //         'official.niad' => 'required|string|max:20',
    //         'official.nama_lengkap' => 'required|string|max:100',
    //         'official.gelar_depan' => 'nullable|string|max:50',
    //         'official.gelar_belakang' => 'nullable|string|max:50',
    //         'official.tempat_lahir' => 'required|string|max:50',
    //         'official.tanggal_lahir' => 'required|date',
    //         'official.jenis_kelamin' => 'required|string|max:1|in:L,P',
    //         'official.status_perkawinan' => 'required|string|in:Belum Menikah,Menikah,Cerai,Duda,Janda',
    //         'official.agama' => 'nullable|string|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu',
    //         'official.status' => 'nullable|string|in:daftar,proses,validasi,tolak',

    //         // Validasi untuk alamat
    //         'address.alamat' => 'required|string|max:255',
    //         'address.rt' => 'nullable|string',
    //         'address.rw' => 'nullable|string',
    //         'address.province_code' => 'required|string|max:10',
    //         'address.province_name' => 'required|string|max:100',
    //         'address.regency_code' => 'required|string|max:10',
    //         'address.regency_name' => 'required|string|max:100',
    //         'address.district_code' => 'required|string|max:10',
    //         'address.district_name' => 'required|string|max:100',
    //         'address.village_code' => 'required|string|max:10',
    //         'address.village_name' => 'required|string|max:100',

    //         // Validasi untuk kontak
    //         'contact.handphone' => 'required|string|max:15',
    //         'contact.email' => 'nullable|email',

    //         // Validasi untuk identitas tambahan
    //         'identity.gol_darah' => 'nullable|string|max:2',
    //         'identity.pendidikan' => 'nullable|string|max:50',
    //         'identity.bpjs_kesehatan' => 'nullable|string|max:20',
    //         'identity.bpjs_ketenagakerjaan' => 'nullable|string|max:20',
    //         'identity.npwp' => 'nullable|string|max:20',

    //         // Validasi untuk studies
    //         'studies.*.study_id' => 'required|exists:studies,id',
    //         'studies.*.study_name' => 'required|string|max:100',
    //         'studies.*.nama_sekolah' => 'required|string|max:100',
    //         'studies.*.alamat_sekolah' => 'nullable|string|max:255',
    //         'studies.*.jurusan' => 'nullable|string|max:100',
    //         'studies.*.tahun_masuk' => 'required|integer',
    //         'studies.*.tahun_keluar' => 'nullable|integer',
    //         'studies.*.dokumen' => 'nullable',

    //         // Validasi untuk positions
    //         'positions.*.position_id' => 'required|exists:positions,id',
    //         'positions.*.position_name' => 'required|string|max:100',
    //         'positions.*.penetap' => 'nullable|string|max:100',
    //         'positions.*.nomor_sk' => 'nullable|string|max:50',
    //         'positions.*.tanggal_sk' => 'nullable|date',
    //         'positions.*.mulai' => 'nullable|date',
    //         'positions.*.selesai' => 'nullable|date',
    //         'positions.*.keterangan' => 'nullable|string|max:255',
    //         'positions.*.file_sk' => 'nullable',

    //         // Validasi untuk trainings
    //         'trainings.*.training_id' => 'required|exists:trainings,id',
    //         'trainings.*.training_title' => 'required|string|max:100',
    //         'trainings.*.nama' => 'nullable|string|max:100',
    //         'trainings.*.mulai' => 'nullable|date',
    //         'trainings.*.selesai' => 'nullable|date',
    //         'trainings.*.keterangan' => 'nullable|string|max:255',
    //         'trainings.*.doc_scan' => 'nullable',

    //         // Validasi untuk organizations
    //         'organizations.*.organization_id' => 'required|exists:organizations,id',
    //         'organizations.*.organization_title' => 'required|string|max:100',
    //         'organizations.*.nama' => 'nullable|string|max:100',
    //         'organizations.*.posisi' => 'nullable|string|max:100',
    //         'organizations.*.keterangan' => 'nullable|string|max:255',
    //         'organizations.*.doc_scan' => 'nullable',
    //     ]);

    //     // Jika validasi gagal, kembalikan ke halaman sebelumnya dengan error
    //     if ($validator->fails()) {
    //         return redirect()->back()
    //             ->withErrors($validator)
    //             ->withInput();
    //     }

    //     // Mulai transaksi database
    //     DB::beginTransaction();

    //     try {
    //         // Ambil data official yang akan diupdate
    //         $official = Official::with(['addresses', 'contacts', 'identities', 'studies', 'positions', 'officialTrainings', 'officialOrganizations'])
    //             ->where('nik', $id)->firstOrFail();

    //         // Update data utama di tabel officials
    //         $official->update($request->input('official'));

    //         // Update data alamat di tabel official_addresses
    //         $official->addresses()->updateOrCreate(
    //             ['official_id' => $official->id],
    //             $request->input('address')
    //         );

    //         // Update data kontak di tabel official_contacts
    //         $official->contacts()->updateOrCreate(
    //             ['official_id' => $official->id],
    //             $request->input('contact')
    //         );

    //         // Update data identitas tambahan di tabel official_identities
    //         $official->identities()->updateOrCreate(
    //             ['official_id' => $official->id],
    //             $request->input('identity')
    //         );

    //         // Hapus data studies lama
    //         $official->studies()->delete();

    //         // Simpan data studies baru
    //         foreach ($request->input('studies', []) as $study) {
    //             $study['official_id'] = $official->id;
    //             OfficialStudy::create($study);
    //         }

    //         // Hapus data positions lama
    //         $official->positions()->delete();

    //         // Simpan data positions baru
    //         foreach ($request->input('positions', []) as $position) {
    //             $position['official_id'] = $official->id;
    //             PositionOfficial::create($position);
    //         }

    //         // Hapus data trainings lama
    //         $official->officialTrainings()->delete();

    //         // Simpan data trainings baru
    //         foreach ($request->input('trainings', []) as $training) {
    //             $training['official_id'] = $official->id;
    //             OfficialTraining::create($training);
    //         }

    //         // Hapus data organizations lama
    //         $official->officialOrganizations()->delete();

    //         // Simpan data organizations baru
    //         foreach ($request->input('organizations', []) as $organization) {
    //             $organization['official_id'] = $official->id;
    //             OfficialOrganization::create($organization);
    //         }

    //         // Commit transaksi jika semua berhasil
    //         DB::commit();

    //         // Redirect ke halaman index dengan pesan sukses
    //         return redirect()->route('village.official.index')->with('success', 'Data berhasil diperbarui.');
    //     } catch (\Exception $e) {
    //         dd($e);
    //         // Rollback transaksi jika terjadi error
    //         DB::rollBack();
    //         // Log error untuk debugging
    //         Log::error('Error updating official data: ' . $e->getMessage());

    //         // Redirect ke halaman sebelumnya dengan pesan error
    //         return redirect()->back()
    //             ->with('error', 'Gagal memperbarui data. Silakan coba lagi.')
    //             ->withInput();
    //     }
    // }
    public function update(Request $request, string $role, string $id)
{
    // dd($request->all());
    // Check if user has village access
    if (Auth::user()->role == 'village') {
        $village = Auth::user()->user_village->village;
    }

    if (!$village) {
        return redirect()->route('login');
    }

    DB::beginTransaction();

    try {
        $official = Official::where('nik', $id)->firstOrFail();
        $village = Auth::user()->user_village->village;

        // Update official
        $this->updateOfficial($request, $official);

        // Update related records
        $this->updateOfficialAddress($request, $official);
        $this->updateOfficialContact($request, $official);
        $this->updateOfficialIdentity($request, $official);
        $this->updateStudies($request, $official);

        // Update workplace
        $this->updateWorkplace($request, $official);

        // Update position
        $this->updatePosition($request, $official);

        // Update trainings
        $this->updateTrainings($request, $official);

        // Update organizations
        $this->updateOrganizations($request, $official);

        // Update family records
        $this->updateParents($request, $official);
        $this->updateSpouse($request, $official);
        $this->updateChildren($request, $official);

        // Update status if all required data is present
        $this->updateOfficialStatus($official);

        DB::commit();

        return redirect()
            ->route('village.official.index', [$role])
            ->with('success', 'Data berhasil diperbarui.');
    } catch (\Exception $e) {
        DB::rollBack();
        dd($e);
        Log::error('Error updating official data: ' . $e->getMessage());

        return redirect()
            ->back()
            ->with('error', 'Gagal memperbarui data. Silakan coba lagi.')
            ->withInput();
    }
}

protected function updateOfficial(Request $request, $official)
{
    $officialData = [
        'nik' => $request->input('official.nik'),
        'nipd' => $request->input('official.nipd'),
        'nama_lengkap' => $request->input('official.nama_lengkap'),
        'gelar_depan' => $request->input('official.gelar_depan'),
        'gelar_belakang' => $request->input('official.gelar_belakang'),
        'tempat_lahir' => $request->input('official.tempat_lahir'),
        'tanggal_lahir' => $request->input('official.tanggal_lahir'),
        'jenis_kelamin' => $request->input('official.jenis_kelamin'),
        'agama' => $request->input('official.agama'),
        'status_perkawinan' => $request->input('official.status_perkawinan'),
    ];

    $official->update($officialData);
}

protected function updateOfficialAddress(Request $request, $official)
{
    $officialAddressData = [
        'rt' => $request->input('official.rt'),
        'rw' => $request->input('official.rw'),
        'kode_pos' => $request->input('official.postal'),
        'alamat' => $request->input('official.alamat'),
        'province_code' => $request->input('official.province_code'),
        'province_name' => $request->input('official.province_name'),
        'regency_code' => $request->input('official.regency_code'),
        'regency_name' => $request->input('official.regency_name'),
        'district_code' => $request->input('official.district_code'),
        'district_name' => $request->input('official.district_name'),
        'village_code' => $request->input('official.village_code'),
        'village_name' => $request->input('official.village_name'),
        'user_village_id' => Auth::user()->id
    ];

    $official->addresses()->updateOrCreate(
        ['official_id' => $official->id],
        $officialAddressData
    );
}

protected function updateOfficialContact(Request $request, $official)
{
    $officialContactData = [
        'handphone' => $request->input('official.handphone'),
    ];

    $official->contacts()->updateOrCreate(
        ['official_id' => $official->id],
        $officialContactData
    );
}

protected function updateOfficialIdentity(Request $request, $official)
{
    $officialIdentityData = [
        'gol_darah' => $request->input('official.gol_darah') ?? null,
        'pendidikan_terakhir' => $request->input('official.pendidikan') ?? null,
        'bpjs_kesehatan' => $request->input('official.bpjs_kesehatan') ?? null,
        'bpjs_ketenagakerjaan' => $request->input('official.bpjs_ketenagakerjaan') ?? null,
        'npwp' => $request->input('official.npwp') ?? null,
    ];

    if ($request->hasFile('official.foto')) {
        // Delete old photo if exists
        if ($official->identities && $official->identities->foto) {
            Storage::delete('public/' . $official->identities->foto);
        }

        $foto = $request->file('official.foto');
        $filename = time() . '_' . $foto->getClientOriginalName();
        $path = $foto->storeAs('public/officials', $filename);
        $officialIdentityData['foto'] = 'officials/' . $filename;
    }

    $official->identities()->updateOrCreate(
        ['official_id' => $official->id],
        $officialIdentityData
    );
}

protected function updateStudies(Request $request, $official)
{
    $studies = $request->input('studies', []);
    $existingStudyIds = $official->studies()->pluck('id')->toArray();
    $updatedStudyIds = [];

    foreach ($studies as $index => $study) {
        $inputStudy = [
            'official_id' => $official->id,
            'pendidikan_umum' => $study['tingkatPendidikan'],
            'nama_sekolah' => $study['namaSekolah'],
            'alamat_sekolah' => $study['tempat'],
            'nomor_ijazah' => $study['nomorIjazah'],
            'tanggal' => $study['tanggalIjazah']
        ];

        if ($request->hasFile("studies.{$index}.dokumenIjazah")) {
            $file = $request->file("studies.{$index}.dokumenIjazah");
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('public/uploads/studies', $fileName);
            $inputStudy['dokumen'] = $fileName;
        }

        // Update or create study record
        if (isset($study['id'])) {
            $studyRecord = OfficialStudy::where('id', $study['id'])
                ->where('official_id', $official->id)
                ->first();

            if ($studyRecord) {
                $studyRecord->update($inputStudy);
                $updatedStudyIds[] = $studyRecord->id;
            }
        } else {
            $newStudy = OfficialStudy::create($inputStudy);
            $updatedStudyIds[] = $newStudy->id;
        }
    }

    // Delete studies that were removed
    $toDelete = array_diff($existingStudyIds, $updatedStudyIds);
    if (!empty($toDelete)) {
        OfficialStudy::whereIn('id', $toDelete)->delete();
    }
}

protected function updateWorkplace(Request $request, $official)
{
    $village = Auth::user()->user_village->village;
    $district = Auth::user()->user_village->village->district;
    $regency = Auth::user()->user_village->village->district->regency;

    $tempatKerjaData = [
        'rt' => $request->input('tempat_kerja.rt'),
        'rw' => $request->input('tempat_kerja.rw'),
        'kode_pos' => $request->input('tempat_kerja.postal'),
        'alamat' => $request->input('tempat_kerja.alamat'),
        'regency_id' => $regency->id,
        'district_id' => $district->id,
        'village_id' => $village->id
    ];

    $official->work_place()->updateOrCreate(
        ['official_id' => $official->id],
        $tempatKerjaData
    );
}

protected function updatePosition(Request $request, $official)
{
    $positionOfficialData = [
        'position_id' => $request->input('position.jabatanId') ?? null,
        'penetap' => $request->input('position.penetap') ?? null,
        'nomor_sk' => $request->input('position.nomorSk') ?? null,
        'tanggal_sk' => $request->input('position.tanggalSk') ?? null,
        'tmt_jabatan' => $request->input('position.tmtJabatan') ?? null,
        'periode' => $request->input('position.period') ?? null
    ];

    if ($request->hasFile('position.file')) {
        // Delete old file if exists
        if ($official->positions && $official->positions->file_sk) {
            Storage::delete('public/' . $official->positions->file_sk);
        }

        $file = $request->file('position.file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('public/officials', $filename);
        $positionOfficialData['file_sk'] = 'officials/' . $filename;
    }

    $official->positions()->updateOrCreate(
        ['official_id' => $official->id],
        $positionOfficialData
    );
}

protected function updateTrainings(Request $request, $official)
{
    $trainings = $request->input('trainings', []);
    $existingTrainingIds = $official->trainings()->pluck('id')->toArray();
    $updatedTrainingIds = [];

    foreach ($trainings as $index => $training) {
        $trainingModel = Training::firstOrCreate(
            ['title' => $training['pelatihan_title']],
            ['description' => $training['description'] ?? null]
        );

        $trainingInput = [
            'official_id' => $official->id,
            'training_id' => $trainingModel->id,
            'nama' => $training['nama'] ?? null,
            'alamat' => $training['tempat'] ?? null,
            'penyelenggara' => $training['penyelenggara'] ?? null,
            'nomor_sertifikat' => $training['nomor'] ?? null,
            'tanggal_sertifikat' => $training['tanggal'] ?? null,
            'keterangan' => $training['keterangan'] ?? null,
        ];

        if ($request->hasFile("trainings.{$index}.docScan")) {
            $file = $request->file("trainings.{$index}.docScan");
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('public/uploads/trainings', $fileName);
            $trainingInput['doc_scan'] = $fileName;
        }

        // Update or create training record
        if (isset($training['id'])) {
            $trainingRecord = OfficialTraining::where('id', $training['id'])
                ->where('official_id', $official->id)
                ->first();

            if ($trainingRecord) {
                $trainingRecord->update($trainingInput);
                $updatedTrainingIds[] = $trainingRecord->id;
            }
        } else {
            $newTraining = OfficialTraining::create($trainingInput);
            $updatedTrainingIds[] = $newTraining->id;
        }
    }

    // Delete trainings that were removed
    $toDelete = array_diff($existingTrainingIds, $updatedTrainingIds);
    if (!empty($toDelete)) {
        OfficialTraining::whereIn('id', $toDelete)->delete();
    }
}

protected function updateOrganizations(Request $request, $official)
{
    $organizations = $request->input('organizations', []);
    $existingOrganizationIds = $official->organizations()->pluck('id')->toArray();
    $updatedOrganizationIds = [];

    foreach ($organizations as $index => $organization) {
        $organizationModel = Training::firstOrCreate(
            ['title' => $organization['pelatihan_title']],
            ['description' => $organization['pelatihan_title'] ?? null]
        );

        $organizationInput = [
            'official_id' => $official->id,
            'organization_id' => $organizationModel->id,
            'nama' => $organization['nama'] ?? null,
            'posisi' => $organization['posisi'] ?? null,
            'mulai' => $organization['mulai'] ?? null,
            'selesai' => $organization['selesai'] ?? null,
            'pimpinan' => $organization['pimpinan'] ?? null,
            'alamat' => $organization['tempat'] ?? null,
            'keterangan' => $organization['keterangan'] ?? null,
        ];

        if ($request->hasFile("organizations.{$index}.doc_scan")) {
            $file = $request->file("organizations.{$index}.doc_scan");
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('public/uploads/organizations', $fileName);
            $organizationInput['doc_scan'] = $fileName;
        }

        // Update or create organization record
        if (isset($organization['id'])) {
            $orgRecord = OfficialOrganization::where('id', $organization['id'])
                ->where('official_id', $official->id)
                ->first();

            if ($orgRecord) {
                $orgRecord->update($organizationInput);
                $updatedOrganizationIds[] = $orgRecord->id;
            }
        } else {
            $newOrg = OfficialOrganization::create($organizationInput);
            $updatedOrganizationIds[] = $newOrg->id;
        }
    }

    // Delete organizations that were removed
    $toDelete = array_diff($existingOrganizationIds, $updatedOrganizationIds);
    if (!empty($toDelete)) {
        OfficialOrganization::whereIn('id', $toDelete)->delete();
    }
}

protected function updateParents(Request $request, $official)
{
    $parents = $request->input('orang_tua', []);
    $existingParentIds = $official->parents()->pluck('id')->toArray();
    $updatedParentIds = [];

    foreach ($parents as $index => $parent) {
        $parentInput = [
            'official_id' => $official->id,
            'nama' => $parent['nama'],
            'tempat_lahir' => $parent['tempatLahir'],
            'tanggal_lahir' => $parent['tanggalLahir'],
            'pekerjaan' => $parent['pekerjaan'],
            'hubungan' => $index == 0 ? "ayah" : "ibu",
            'alamat' => $parent['alamat'],
            'rt' => $parent['rt'],
            'rw' => $parent['rw'],
            'no_telepon' => $parent['telp'],
            'kode_pos' => $parent['kodePos'],
            'province_code' => $parent['province_code'],
            'province_name' => $parent['province_name'],
            'regency_code' => $parent['regency_code'],
            'regency_name' => $parent['regency_name'],
            'district_code' => $parent['district_code'],
            'district_name' => $parent['district_name'],
            'village_code' => $parent['village_code'],
            'village_name' => $parent['village_name'],
        ];

        // Update or create parent record
        if (isset($parent['id'])) {
            $parentRecord = ParentOfficial::where('id', $parent['id'])
                ->where('official_id', $official->id)
                ->first();

            if ($parentRecord) {
                $parentRecord->update($parentInput);
                $updatedParentIds[] = $parentRecord->id;
            }
        } else {
            $newParent = ParentOfficial::create($parentInput);
            $updatedParentIds[] = $newParent->id;
        }
    }

    // Delete parents that were removed
    $toDelete = array_diff($existingParentIds, $updatedParentIds);
    if (!empty($toDelete)) {
        ParentOfficial::whereIn('id', $toDelete)->delete();
    }
}

protected function updateSpouse(Request $request, $official)
{
    $pasangan = $request->input('pasangan');

    if ($pasangan) {
        $hubungan = $pasangan['jenis_kelamin'] == 'Laki-laki' ? 'istri' : 'suami';

        $pasanganInput = [
            'official_id' => $official->id,
            'hubungan' => $hubungan,
            'nama' => $pasangan['nama'],
            'tempat_lahir' => $pasangan['tempat_lahir'],
            'tanggal_lahir' => $pasangan['tanggal_lahir'],
            'tanggal_nikah' => $pasangan['tanggal_nikah'],
            'pendidikan_umum' => $pasangan['pendidikan'],
            'pekerjaan' => $pasangan['pekerjaan'],
        ];

        $official->spouse()->updateOrCreate(
            ['official_id' => $official->id],
            $pasanganInput
        );
    } else {
        // Remove spouse if exists but not in request
        $official->spouse()->delete();
    }
}

protected function updateChildren(Request $request, $official)
{
    $anakList = $request->input('anak', []);
    $existingChildrenIds = $official->children()->pluck('id')->toArray();
    $updatedChildrenIds = [];

    foreach ($anakList as $index => $anak) {
        $anakInput = [
            'official_id' => $official->id,
            'nama' => $anak['nama'],
            'tempat_lahir' => $anak['tempat'],
            'tanggal_lahir' => $anak['tanggalLahir'],
            'jenis_kelamin' => $anak['jenisKelamin'],
            'status' => $anak['status'],
            'pendidikan_umum' => $anak['pendidikan'],
            'pekerjaan' => $anak['pekerjaan'],
        ];

        // Update or create child record
        if (isset($anak['id'])) {
            $childRecord = ChildrenOfficial::where('id', $anak['id'])
                ->where('official_id', $official->id)
                ->first();

            if ($childRecord) {
                $childRecord->update($anakInput);
                $updatedChildrenIds[] = $childRecord->id;
            }
        } else {
            $newChild = ChildrenOfficial::create($anakInput);
            $updatedChildrenIds[] = $newChild->id;
        }
    }

    // Delete children that were removed
    $toDelete = array_diff($existingChildrenIds, $updatedChildrenIds);
    if (!empty($toDelete)) {
        ChildrenOfficial::whereIn('id', $toDelete)->delete();
    }
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $role, $id)
    {
        // dd($id);
        //
        $official = Official::where('nik', $id)->firstOrFail();
        // dd($official);
        // Hapus Secara Berurutan
        try {
            $official->addresses()->delete();
            $official->contacts()->delete();
            $official->identities()->delete();
            $official->studies()->delete();
            $official->positions()->delete();
            $official->officialTrainings()->delete();
            $official->officialOrganizations()->delete();
        } catch (\Throwable $th) {
            throw $th;
        }

        // Hapus Data Utama
        $official->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
