<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\ChildrenOfficial;
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
use App\Models\SpouseOfficial;
use App\Models\Study;
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
        // dd($role);
        // Debug nid
        Log::info('Request parameters:', $request->all());

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
            // 'trainings' => \App\Models\Training::all()->toArray(),
            // 'organizations' => \App\Models\Organization::all()->toArray(),
            // Dummy data organizations
            'initialOrganizations' => Organization::all()->toArray(),
            'position' => $role,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */


    public function store(Request $request, string $role)
    {
        // Jika User role adalah village maka akan ada data village
        if (Auth::user()->role == 'village') {
            $village = Auth::user()->user_village->village;
        }

        // Jika Tidak ada data village maka lempar ke halaman login
        if (!$village) {
            return redirect()->route('login');
        }

        // Mulai transaksi database
        DB::beginTransaction();

        try {
            // Isi Village Id
            $village = Auth::user()->user_village->village;

            // Ambil data official dari request
            // Ambil data official dari request
            $officialData = [
                'village_id' => $village->id,
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
                'status' => 'daftar', // Default status
                // Informasi alamat tambahan (jika diperlukan)
                // 'pendidikan' => $request->input('official.pendidikan'),
                // 'gol_darah' => $request->input('official.gol_darah'),
            ];

            // Simpan data official ke tabel officials
            $official = Official::create($officialData);

            // Simpan data alamat ke tabel official_addresses
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

            // Simpan data kontak ke tabel official_contacts
            $officialContact = [
                'official_id' => $official->id,
                'handphone' => $request->input('official.handphone'),
            ];
            OfficialContact::create($officialContact);

            // Handle file upload (foto)


            // Simpan data identitas tambahan ke tabel official_identities
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

            try {
                // Simpan data studies (pendidikan)
                $studies = $request->input('studies');
                foreach ($studies as $index => $study) {
                    $inputStudy = [
                        'official_id' => $official->id,
                        'pendidikan_umum' => $study['tingkatPendidikan'],
                        'nama_sekolah' => $study['namaSekolah'],
                        'alamat_sekolah' => $study['tempat'],
                        'nomor_ijazah' => $study['nomorIjazah'],
                        'tanggal' => $study['tanggalIjazah']
                    ];

                    // Simpan file dokumen jika ada
                    if ($request->hasFile("studies.{$index}.dokumenIjazah")) {
                        $file = $request->file("studies.{$index}.dokumenIjazah");
                        $fileName = time() . '_' . $file->getClientOriginalName();
                        $file->storeAs('public/uploads/studies', $fileName);
                        $inputStudy['dokumen'] = $fileName;
                    }

                    OfficialStudy::create($inputStudy);
                }
            } catch (\Throwable $th) {
                //throw $th;
            }

            // Simpan Tempat Kerja
            // Cari Regency berdasarkan Codebps
            $regency = \App\Models\Regency::where('code_bps', $request->input('tempat_kerja.regency_code'))->first();
            // Cari District berdasarkan Codebps
            $district = \App\Models\District::where('code_bps', $request->input('tempat_kerja.district_code'))->first();
            // Cari Village berdasarkan Codebps
            $village = \App\Models\Village::where('code_bps', $request->input('tempat_kerja.village_code'))->first();
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

            // Simpan data positions (jabatan)
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

            try {
                // Simpan data trainings (pelatihan)
                $trainings = $request->input('trainings');
                foreach ($trainings as $index => $training) {
                    $trainingInput = [
                        'official_id' => $official->id,
                        'nama' => $training['nama'],
                        'alamat' => $training['tempat'],
                        'pelatihan' => $training['pelatihan'],
                        'penyelenggara' => $training['penyelenggara'],
                        'nomor_sertifikat' => $training['nomor'],
                        'tanggal_sertifikat' => $training['tanggal'],
                    ];
                    // Simpan file dokumen jika ada
                    if ($request->hasFile("trainings.{$index}.docScan")) {
                        $file = $request->file("trainings.{$index}.docScan");
                        $fileName = time() . '_' . $file->getClientOriginalName();
                        $file->storeAs('public/uploads/trainings', $fileName);
                        $trainingInput['doc_scan'] = $fileName;
                    }

                    OfficialTraining::create($trainingInput);
                }
            } catch (\Throwable $th) {
                //throw $th;
            }

            try {
                // Simpan data organizations (organisasi)
                $organizations = $request->input('organizations');
                foreach ($organizations as $index => $organization) {
                    $organizationInput = [
                        'official_id' => $official->id,
                        'organization_id' => $organization['organization_id'],
                        'nama' => $organization['nama'],
                        'posisi' => $organization['posisi'],
                        'mulai' => $organization['mulai'],
                        'selesai' => $organization['selesai'],
                        'pimpinan' => $organization['pimpinan'],
                        'alamat' => $organization['tempat'],


                    ];
                    // Simpan file dokumen jika ada
                    if ($request->hasFile("organizations.{$index}.doc_scan")) {
                        $file = $request->file("organizations.{$index}.doc_scan");
                        $fileName = time() . '_' . $file->getClientOriginalName();
                        $file->storeAs('public/uploads/organizations', $fileName);
                        $organizationInput['doc_scan'] = $fileName;
                    }

                    OfficialOrganization::create($organizationInput);
                }
            } catch (\Throwable $th) {
                //throw $th;
            }

            try {
                // parent_officials data Orang Tua
                $parents = $request->input('orang_tua');
                foreach ($parents as $index => $parent) {
                    // 0 = ayah, 1 = ibu
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

                    ParentOfficial::create($parentInput);
                }
            } catch (\Throwable $th) {
                //throw $th;
            }

            // Simpan Pasangan
            try {
                $pasangan = $request->input('pasangan');
                if ($pasangan) {
                    // Jika Official memiliki pasangan dan official adalah laki-laki maka pasanganya adalah istri
                    if ($pasangan['jenis_kelamin'] == 'Laki-laki') {
                        $hubungan = 'istri';
                    } else {
                        $hubungan = 'suami';
                    }
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
            } catch (\Throwable $th) {
                //throw $th;
            }

            // Simpan Anak
            try {
                $anakList = $request->input('anak');
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
            } catch (\Throwable $th) {
                //throw $th;
            }

            // Jika Data sudah lengkap maka ubah status menjadi proses
            if (isset($official) && $official->identities != null && $official->positions != null && $official->addresses != null && $official->contacts != null && $official->work_place != null) {
                $official->status = 'proses';
                $official->save();
            }

            // Commit transaksi jika semua berhasil
            DB::commit();

            // Redirect ke halaman index dengan pesan sukses
            return redirect()->route('village.official.index', [$role])->with('success', 'Data berhasil disimpan.');
        } catch (\Exception $e) {

            dd($e);
            // Rollback transaksi jika terjadi error
            DB::rollBack();

            // Log error untuk debugging
            Log::error('Error storing official data: ' . $e->getMessage());

            // Redirect ke halaman sebelumnya dengan pesan error
            return redirect()->back()
                ->with('error', 'Gagal menyimpan data. Silakan coba lagi.')
                ->withInput(); // Pertahankan input yang sudah diisi
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

        // Format data studies sesuai input
        $formattedStudies = [];
        foreach ($official->studies as $study) {
            $formattedStudies[] = [
                'tingkatPendidikan' => $study->pendidikan_umum,
                'namaSekolah' => $study->nama_sekolah,
                'tempat' => $study->alamat_sekolah,
                'nomorIjazah' => $study->nomor_ijazah,
                'tanggalIjazah' => $study->tanggal,
                // 'dokumenIjazah' => $study->dokumen ? 'exists' : null // Flag untuk menunjukkan dokumen ada
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

        // Format data organizations
        $formattedOrganizations = [];
        foreach ($official->officialOrganizations as $org) {
            $formattedOrganizations[] = [
                'organization_id' => $org->organization_id,
                'nama' => $org->nama,
                'posisi' => $org->posisi,
                'mulai' => $org->mulai,
                'selesai' => $org->selesai,
                'pimpinan' => $org->pimpinan,
                'tempat' => $org->alamat,
                // 'doc_scan' => $org->doc_scan ? 'exists' : null
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
        ] : null;

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
            'regency_code' => $official->work_place->regency->code_bps,
            'regency_name' => $official->work_place->regency->name,
            'district_code' => $official->work_place->district->code_bps,
            'district_name' => $official->work_place->district->name,
            'village_code' => $official->work_place->village->code_bps,
            'village_name' => $official->work_place->village->name,
            // 'regency_code' => "",
            // 'regency_name' => "",
            // 'district_code' => "",
            // 'district_name' => "",
            // 'village_code' => "",
            'village_name' => "",
            'alamat' => $official->work_place->alamat,
            'rt' => $official->work_place->rt,
            'rw' => $official->work_place->rw,
            'postal' => $official->work_place->kode_pos,
        ] : null;

        // Position
        $formattedPosition = $official->position ? [
            // 'position_id',
            // 'official_id',
            // 'penetap',
            // 'nomor_sk',
            // 'tanggal_sk',
            // 'file_sk',
            // 'tmt_jabatan',
            // 'period',
            // 'keterangan',
            'penetap' => $official->position->penetap,
            'nomorSk' => $official->position->nomor_sk,
            'tanggalSk' => $official->position->tanggal_sk,
            'period' => $official->position->period,
            'tmtJabatan' => $official->position->tmt_jabatan,
            ] : null;
            // dd($formattedPosition);
        // dd($official->position->toArray());

        return Inertia::render('Village/Official/Edit', [
            'official' => $official,
            // 'official' => [
            //     'nik' => $official->nik,
            //     'nipd' => $official->nipd,
            //     'nama_lengkap' => $official->nama_lengkap,
            //     'gelar_depan' => $official->gelar_depan,
            //     'gelar_belakang' => $official->gelar_belakang,
            //     'tempat_lahir' => $official->tempat_lahir,
            //     'tanggal_lahir' => $official->tanggal_lahir,
            //     'jenis_kelamin' => $official->jenis_kelamin,
            //     'agama' => $official->agama,
            //     'status_perkawinan' => $official->status_perkawinan,
            //     'status' => $official->status,
            //     'rt' => $official->addresses->rt ?? null,
            //     'rw' => $official->addresses->rw ?? null,
            //     'postal' => $official->addresses->kode_pos ?? null,
            //     'alamat' => $official->addresses->alamat ?? null,
            //     'province_code' => $official->addresses->province_code ?? null,
            //     'province_name' => $official->addresses->province_name ?? null,
            //     'regency_code' => $official->addresses->regency_code ?? null,
            //     'regency_name' => $official->addresses->regency_name ?? null,
            //     'district_code' => $official->addresses->district_code ?? null,
            //     'district_name' => $official->addresses->district_name ?? null,
            //     'village_code' => $official->addresses->village_code ?? null,
            //     'village_name' => $official->addresses->village_name ?? null,
            //     'handphone' => $official->contacts->handphone ?? null,
            //     'gol_darah' => $official->identities->gol_darah ?? null,
            //     'pendidikan' => $official->identities->pendidikan ?? null,
            //     'bpjs_kesehatan' => $official->identities->bpjs_kesehatan ?? null,
            //     'bpjs_ketenagakerjaan' => $official->identities->bpjs_ketenagakerjaan ?? null,
            //     'npwp' => $official->identities->npwp ?? null,
            //     'foto' => $official->identities->foto ?? null,
            // ],
            'studies' => $formattedStudies,
            'tempat_kerja' => $formattedWorkPlace,
            'position' => PositionOfficial::where('official_id', $official->id)->with(['position'])->first(),
            'currentPosition' => $formattedPosition,
            'trainings' => $formattedTrainings,
            'organizations' => $formattedOrganizations,
            'orang_tua' => $formattedParents,
            'pasangan' => $formattedSpouse,
            'anak' => $formattedChildren,
            'initialPositions' => Position::all()->toArray(),
            'initialOrganizations' => Organization::all()->toArray(),
            'role' => $role,
            'id' => $id,
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
    public function update(Request $request, string $role, $id)
    {
        // dd($request->all());
        // Mulai transaksi database
        // DB::beginTransaction();

        try {
            // Ambil data official yang akan diupdate
            $official = Official::with([
                'addresses',
                'contacts',
                'identities',
                'studies',
                'work_place',
                'positions',
                'trainings',
                'organizations',
                'parents',
                'spouse',
                'children'
            ])->where('nik', $id)->firstOrFail();
            // dd($official);

            // Update data official
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
                'status' => $request->input('official.status') ?? 'daftar',
            ];

            $official->update($officialData);
            // dd($official);

            // Update data alamat
            $officialAddress = [
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
            ];
            $official->addresses()->updateOrCreate(['official_id' => $official->id], $officialAddress);

            // Update data kontak
            $officialContact = [
                'handphone' => $request->input('official.handphone'),
            ];
            $official->contacts()->updateOrCreate(['official_id' => $official->id], $officialContact);

            // Update data identitas tambahan
            $officialIdentity = [
                'gol_darah' => $request->input('official.gol_darah') ?? null,
                'pendidikan_terakhir' => $request->input('official.pendidikan') ?? null,
                'bpjs_kesehatan' => $request->input('official.bpjs_kesehatan') ?? null,
                'bpjs_ketenagakerjaan' => $request->input('official.bpjs_ketenagakerjaan') ?? null,
                'npwp' => $request->input('official.npwp') ?? null,
            ];

            if ($request->hasFile('official.foto')) {
                // Hapus foto lama jika ada
                if ($official->identities && $official->identities->foto) {
                    Storage::delete('public/' . $official->identities->foto);
                }

                $foto = $request->file('official.foto');
                $filename = time() . '_' . $foto->getClientOriginalName();
                $path = $foto->storeAs('public/officials', $filename);
                $officialIdentity['foto'] = 'officials/' . $filename;
            }

            $official->identities()->updateOrCreate(['official_id' => $official->id], $officialIdentity);

            try {
                // Update data studies (pendidikan)
                $official->studies()->delete();
                $studies = $request->input('studies');
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
            } catch (\Throwable $th) {
                //throw $th;
            }

            // Update Tempat Kerja
            $regency = \App\Models\Regency::where('code_bps', $request->input('tempat_kerja.regency_code'))->first();
            $district = \App\Models\District::where('code_bps', $request->input('tempat_kerja.district_code'))->first();
            $village = \App\Models\Village::where('code_bps', $request->input('tempat_kerja.village_code'))->first();

            $tempatKerja = [
                'rt' => $request->input('tempat_kerja.rt'),
                'rw' => $request->input('tempat_kerja.rw'),
                'kode_pos' => $request->input('tempat_kerja.postal'),
                'alamat' => $request->input('tempat_kerja.alamat'),
                'regency_id' => $regency->id,
                'district_id' => $district->id,
                'village_id' => $village->id
            ];
            $official->work_place()->updateOrCreate(['official_id' => $official->id], $tempatKerja);

            // Update data positions (jabatan)
            $positionOfficial = [
                'position_id' => $request->input('position.jabatanId') ?? null,
                'penetap' => $request->input('position.penetap') ?? null,
                'nomor_sk' => $request->input('position.nomorSk') ?? null,
                'tanggal_sk' => $request->input('position.tanggalSk') ?? null,
                'tmt_jabatan' => $request->input('position.tmtJabatan') ?? null,
                'periode' => $request->input('position.period') ?? null
            ];

            if ($request->hasFile('position.file')) {
                // Hapus file lama jika ada
                if ($official->positions && $official->positions->file_sk) {
                    Storage::delete('public/' . $official->positions->file_sk);
                }

                $foto = $request->file('position.file');
                $filename = time() . '_' . $foto->getClientOriginalName();
                $path = $foto->storeAs('public/officials', $filename);
                $positionOfficial['file_sk'] = 'officials/' . $filename;
            }

            $official->positions()->updateOrCreate(['official_id' => $official->id], $positionOfficial);

            try {
                // Update data trainings (pelatihan)
            $official->trainings()->delete();
            $trainings = $request->input('trainings');
            foreach ($trainings as $index => $training) {
                $trainingInput = [
                    'official_id' => $official->id,
                    'nama' => $training['nama'],
                    'alamat' => $training['tempat'],
                    'pelatihan' => $training['pelatihan'],
                    'penyelenggara' => $training['penyelenggara'],
                    'nomor_sertifikat' => $training['nomor'],
                    'tanggal_sertifikat' => $training['tanggal'],
                ];

                if ($request->hasFile("trainings.{$index}.docScan")) {
                    $file = $request->file("trainings.{$index}.docScan");
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('public/uploads/trainings', $fileName);
                    $trainingInput['doc_scan'] = $fileName;
                }

                OfficialTraining::create($trainingInput);
            }
            } catch (\Throwable $th) {
                //throw $th;
            }

            try {
                // Update data organizations (organisasi)
            $official->organizations()->delete();
            $organizations = $request->input('organizations');
            foreach ($organizations as $index => $organization) {
                $organizationInput = [
                    'official_id' => $official->id,
                    'organization_id' => $organization['organization_id'],
                    'nama' => $organization['nama'],
                    'posisi' => $organization['posisi'],
                    'mulai' => $organization['mulai'],
                    'selesai' => $organization['selesai'],
                    'pimpinan' => $organization['pimpinan'],
                    'alamat' => $organization['tempat'],
                ];

                if ($request->hasFile("organizations.{$index}.doc_scan")) {
                    $file = $request->file("organizations.{$index}.doc_scan");
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('public/uploads/organizations', $fileName);
                    $organizationInput['doc_scan'] = $fileName;
                }

                OfficialOrganization::create($organizationInput);
            }
            } catch (\Throwable $th) {
                //throw $th;
            }

            try {
                // Update data Orang Tua
            $official->parents()->delete();
            $parents = $request->input('orang_tua');
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

                ParentOfficial::create($parentInput);
            }
            } catch (\Throwable $th) {
                //throw $th;
            }

            try {
                // Update Pasangan
            $official->spouse()->delete();
            $pasangan = $request->input('pasangan');
            if ($pasangan) {
                $hubungan = ($pasangan['jenis_kelamin'] == 'Laki-laki') ? 'istri' : 'suami';
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
            } catch (\Throwable $th) {
                //throw $th;
            }

            try {
                // Update Anak
            $official->children()->delete();
            $anakList = $request->input('anak');
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
            } catch (\Throwable $th) {
                //throw $th;
            }

            // Jika Data sudah lengkap maka ubah status menjadi proses
            if (isset($official) && $official->identities != null && $official->positions != null && $official->addresses != null && $official->contacts != null && $official->work_place != null) {
                $official->status = 'proses';
                $official->save();
            }

            // Commit transaksi jika semua berhasil
            // DB::commit();


            // Redirect ke halaman index dengan pesan sukses
            return redirect()->route('village.official.index', [$role])->with('success', 'Data berhasil diperbarui.');
        } catch (\Exception $e) {
            // Rollback transaksi jika terjadi error
            // DB::rollBack();
            dd($e);
            // Log error untuk debugging
            Log::error('Error updating official data: ' . $e->getMessage());

            // Redirect ke halaman sebelumnya dengan pesan error
            return redirect()->back()
                ->with('error', 'Gagal memperbarui data. Silakan coba lagi.')
                ->withInput();
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
