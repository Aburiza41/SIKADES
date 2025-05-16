<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Official;
use App\Models\TempatKerja;
use App\Models\Position;
use App\Models\Organization;
use App\Models\Training;
use App\Models\OrangTua;
use App\Models\Hubungan;
use App\Models\Anak;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */


    public function index(Request $request, String $role)
    {
        // dd($role);
        // Debug request
        Log::info('Request parameters:', $request->all());

        // dd(Official::with(['position_current.position'])->first());
        // Query utama untuk officials dengan filter dan sorting
        $officials = Official::with(['village.district.regency', 'addresses', 'contacts', 'identities', 'studies.study', 'positions.position', 'officialTrainings', 'officialOrganizations', 'position_current.position'])
            ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                    ->orWhere('nik', 'like', '%' . $request->search . '%')
                    ->orWhere('niad', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('filters'), function ($query) use ($request) {
                $query->whereHas('identities', function ($q) use ($request) {
                    $q->where('pendidikan', $request->filters); // Filter berdasarkan ID village
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

        // Cari Position
        $position = Position::where('slug', $role)->first();

        // Kembalikan data menggunakan Inertia
        return Inertia::render('Admin/Official/Page', [
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

    /**
     * Show the form for creating a new resource.
     */
    public function create(String $role)
    {
        // dd(\App\Models\Position::where('slug', $role)->first()->toArray());
        return Inertia::render('Admin/Official/Create', [
            'initialPositions' => \App\Models\Position::all()->toArray(),
            'trainings' => \App\Models\Training::all()->toArray(),
            // 'organizations' => \App\Models\Organization::all()->toArray(),
            // Dummy data organizations
            'initialOrganizations' => [
                [
                    'id' => 1,
                    'title' => 'Organisasi A',
                ],
                [
                    'id' => 2,
                    'title' => 'Organisasi B',
                ],
                [
                    'id' => 3,
                    'title' => 'Organisasi C',
                ],
            ],
            'studies' => \App\Models\Study::all()->toArray(),
            'position' => $role,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, string $role)
    {
        dd($role, $request->all());
        // Validasi data utama
        $validator = $this->validateOfficialData($request);
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Mulai transaction database
        DB::beginTransaction();

        try {
            // Simpan data official
            $official = $this->saveOfficialData($request->input('official'), $role);

            // Simpan data tempat kerja
            $this->saveTempatKerjaData($request->input('tempat_kerja'), $official->id);

            // Simpan data position jika ada
            if ($request->has('position')) {
                $this->savePositionData($request->input('position'), $official->id);
            }

            // Simpan data organizations jika ada
            if ($request->has('organizations')) {
                $this->saveOrganizationsData($request->input('organizations'), $official->id);
            }

            // Simpan data trainings jika ada
            if ($request->has('trainings')) {
                $this->saveTrainingsData($request->input('trainings'), $official->id);
            }

            // Simpan data orang tua jika ada
            if ($request->has('orang_tua')) {
                $this->saveOrangTuaData($request->input('orang_tua'), $official->id);
            }

            // Simpan data hubungan jika ada
            if ($request->has('hubungan')) {
                $this->saveHubunganData($request->input('hubungan'), $official->id);
            }

            // Simpan data anak jika ada
            if ($request->has('anak')) {
                $this->saveAnakData($request->input('anak'), $official->id);
            }

            // Commit transaction jika semua berhasil
            DB::commit();

            return redirect()->back()->with('success', 'Data berhasil disimpan.');
        } catch (\Exception $e) {
            // Rollback transaction jika ada error
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Validasi data official
     */
    protected function validateOfficialData(Request $request)
    {
        return Validator::make($request->all(), [
            'official.nik' => 'required|string|max:255|unique:officials,nik',
            'official.nipd' => 'required|string|max:255|unique:officials,nipd',
            'official.nama_lengkap' => 'required|string|max:255',
            // ... tambahkan validasi lainnya sesuai kebutuhan
        ]);
    }

    /**
     * Simpan data official
     */
    protected function saveOfficialData(array $data, string $role)
    {
        $official = new Official();
        $official->fill([
            'nik' => $data['nik'],
            'nipd' => $data['nipd'],
            'nama_lengkap' => $data['nama_lengkap'],
            'gelar_depan' => $data['gelar_depan'] ?? null,
            'gelar_belakang' => $data['gelar_belakang'] ?? null,
            'tempat_lahir' => $data['tempat_lahir'],
            'tanggal_lahir' => $data['tanggal_lahir'],
            'jenis_kelamin' => $data['jenis_kelamin'],
            'agama' => $data['agama'],
            'status_perkawinan' => $data['status_perkawinan'],
            'alamat' => $data['alamat'],
            'rt' => $data['rt'],
            'rw' => $data['rw'],
            'postal' => $data['postal'],
            'province_code' => $data['province_code'],
            'province_name' => $data['province_name'],
            'regency_code' => $data['regency_code'],
            'regency_name' => $data['regency_name'],
            'district_code' => $data['district_code'],
            'district_name' => $data['district_name'],
            'village_code' => $data['village_code'],
            'village_name' => $data['village_name'],
            'gol_darah' => $data['gol_darah'] ?? null,
            'handphone' => $data['handphone'] ?? null,
            'pendidikan' => $data['pendidikan'] ?? null,
            'bpjs_kesehatan' => $data['bpjs_kesehatan'] ?? null,
            'bpjs_ketenagakerjaan' => $data['bpjs_ketenagakerjaan'] ?? null,
            'npwp' => $data['npwp'] ?? null,
            'role' => $role,
        ]);

        // Handle file upload foto
        if (isset($data['foto']) && $data['foto'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['foto']->store('public/officials/foto');
            $official->foto = str_replace('public/', '', $path);
        }

        $official->save();
        return $official;
    }

    /**
     * Simpan data tempat kerja
     */
    protected function saveTempatKerjaData(array $data, int $officialId)
    {
        TempatKerja::create([
            'official_id' => $officialId,
            'rt' => $data['rt'],
            'rw' => $data['rw'],
            'postal' => $data['postal'],
            'alamat' => $data['alamat'],
            'province_code' => $data['province_code'],
            'province_name' => $data['province_name'],
            'regency_code' => $data['regency_code'],
            'regency_name' => $data['regency_name'],
            'district_code' => $data['district_code'],
            'district_name' => $data['district_name'],
            'village_code' => $data['village_code'],
            'village_name' => $data['village_name'],
        ]);
    }

    /**
     * Simpan data position/jabatan
     */
    protected function savePositionData(array $data, int $officialId)
    {
        $position = new Position();
        $position->official_id = $officialId;
        $position->jabatan_id = $data['jabatanId'];
        $position->nama_jabatan = $data['namaJabatan'];
        $position->penetap = $data['penetap'];
        $position->nomor_sk = $data['nomorSk'];
        $position->tanggal_sk = $data['tanggalSk'];
        $position->period = $data['period'];
        $position->tmt_jabatan = $data['tmtJabatan'];

        // Handle file upload
        if (isset($data['file']) && $data['file'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['file']->store('public/officials/positions');
            $position->file_path = str_replace('public/', '', $path);
        }

        $position->save();
    }

    /**
     * Simpan data organizations
     */
    protected function saveOrganizationsData(array $organizations, int $officialId)
    {
        foreach ($organizations as $org) {
            $organization = new Organization();
            $organization->official_id = $officialId;
            $organization->organization_id = $org['organization_id'];
            $organization->organization_title = $org['organization_title'];
            $organization->nama = $org['nama'];
            $organization->posisi = $org['posisi'];
            $organization->mulai = $org['mulai'];
            $organization->selesai = $org['selesai'];
            $organization->pimpinan = $org['pimpinan'];
            $organization->tempat = $org['tempat'];

            // Handle file upload
            if (isset($org['doc_scan']) && $org['doc_scan'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $org['doc_scan']->store('public/officials/organizations');
                $organization->doc_scan = str_replace('public/', '', $path);
            }

            $organization->save();
        }
    }

    /**
     * Simpan data trainings
     */
    protected function saveTrainingsData(array $trainings, int $officialId)
    {
        foreach ($trainings as $training) {
            $train = new Training();
            $train->official_id = $officialId;
            $train->nama = $training['nama'];
            $train->tempat = $training['tempat'];
            $train->pelatihan = $training['pelatihan'];
            $train->penyelenggara = $training['penyelenggara'];
            $train->nomor = $training['nomor'];
            $train->tanggal = $training['tanggal'];

            // Handle file upload
            if (isset($training['docScan']) && $training['docScan'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $training['docScan']->store('public/officials/trainings');
                $train->doc_scan = str_replace('public/', '', $path);
            }

            $train->save();
        }
    }

    /**
     * Simpan data orang tua
     */
    protected function saveOrangTuaData(array $orangTua, int $officialId)
    {
        foreach ($orangTua as $ortu) {
            OrangTua::create([
                'official_id' => $officialId,
                'jenis' => $ortu['jenis'],
                'nama' => $ortu['nama'],
                'tempat_lahir' => $ortu['tempatLahir'],
                'tanggal_lahir' => $ortu['tanggalLahir'],
                'pekerjaan' => $ortu['pekerjaan'],
                'alamat' => $ortu['alamat'],
                'rt' => $ortu['rt'],
                'rw' => $ortu['rw'],
                'telp' => $ortu['telp'],
                'kode_pos' => $ortu['kodePos'],
                'province_code' => $ortu['province_code'],
                'province_name' => $ortu['province_name'],
                'regency_code' => $ortu['regency_code'],
                'regency_name' => $ortu['regency_name'],
                'district_code' => $ortu['district_code'],
                'district_name' => $ortu['district_name'],
                'village_code' => $ortu['village_code'],
                'village_name' => $ortu['village_name'],
            ]);
        }
    }

    /**
     * Simpan data hubungan
     */
    protected function saveHubunganData(array $data, int $officialId)
    {
        Hubungan::create([
            'official_id' => $officialId,
            'nama' => $data['nama'],
            'tempat_lahir' => $data['tempat_lahir'],
            'tanggal_lahir' => $data['tanggal_lahir'],
            'tanggal_kawin' => $data['tanggal_kawin'],
            'pekerjaan' => $data['pekerjaan'],
            'pendidikan' => $data['pendidikan'],
        ]);
    }

    /**
     * Simpan data anak
     */
    protected function saveAnakData(array $anakList, int $officialId)
    {
        foreach ($anakList as $anak) {
            Anak::create([
                'official_id' => $officialId,
                'nama' => $anak['nama'],
                'tempat' => $anak['tempat'],
                'tanggal_lahir' => $anak['tanggalLahir'],
                'jenis_kelamin' => $anak['jenisKelamin'],
                'status' => $anak['status'],
                'pendidikan' => $anak['pendidikan'],
                'pekerjaan' => $anak['pekerjaan'],
            ]);
        }
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
