<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
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
use App\Models\Study;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        // Ambil village_id dari user yang login
        $village = Auth::user()->user_village->village;

        // Query utama untuk officials dengan filter dan sorting
        $officials = Official::with([
            'village.district.regency',
            'addresses',
            'contacts',
            'identities',
            'studies.study', // Relasi studies dengan study
            'positions',
            'officialTrainings',
            'officialOrganizations'
        ])
            ->where('village_id', $village->id) // Hanya ambil data dari village_id user yang login
            ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                        ->orWhere('nik', 'like', '%' . $request->search . '%')
                        ->orWhere('niad', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('filters'), function ($query) use ($request) {
                $query->whereHas('village', function ($q) use ($request) {
                    $q->where('pendidikan', $request->filters); // Filter berdasarkan ID village
                });
            })
            ->orderBy(
                in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
            )
            ->paginate($request->per_page ?? 10);

        // Proses data untuk menambahkan pendidikan tertinggi
        $officials->getCollection()->transform(function ($official) {
            // Ambil data studies
            $studies = $official->studies;

            // Cari pendidikan dengan level tertinggi
            $highestEducation = null;
            if ($studies->isNotEmpty()) {
                $highestEducation = $studies->sortByDesc('study.level')->first();
            }

            // Tambahkan properti pendidikan tertinggi ke official
            $official->highest_education = $highestEducation ? $highestEducation->study->name : '-';
            $official->highest_education_level = $highestEducation ? $highestEducation->study->level : 0;

            return $official;
        });

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
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // dd(
        //     'positions', \App\Models\Position::all(),
        //     'trainings', Training::all(),
        //     'organizations', Organization::all(),
        //     'studies', \App\Models\Study::all(),
        // );
        // // dd("create");
        // return Inertia::render('Village/Official/Create', [
        //     'positions' => \App\Models\Position::all(),
        //     'trainings' => Training::all(),
        //     'organizations' => Organization::all(),
        //     'studies' => \App\Models\Study::all(),
        // ]);
        return Inertia::render('Village/Official/Create', [
            'positions' => \App\Models\Position::all()->toArray(),
            'trainings' => Training::all()->toArray(),
            'organizations' => Organization::all()->toArray(),
            'studies' => \App\Models\Study::all()->toArray(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */


    public function store(Request $request)
    {
        // dd($request->all());
        // Validasi data yang diterima
        $validator = Validator::make($request->all(), [
            // Validasi untuk official
            'official.nik' => 'required|string|max:16|unique:officials,nik',
            'official.niad' => 'required|string|max:20|unique:officials,niad',
            'official.nama_lengkap' => 'required|string|max:100',
            'official.gelar_depan' => 'nullable|string|max:50',
            'official.gelar_belakang' => 'nullable|string|max:50',
            'official.tempat_lahir' => 'required|string|max:50',
            'official.tanggal_lahir' => 'required|date',
            'official.jenis_kelamin' => 'required|string|max:1|in:L,P',
            'official.status_perkawinan' => 'required|string|in:Belum Menikah,Menikah,Cerai,Duda,Janda',
            'official.agama' => 'nullable|string|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu',
            'official.status' => 'nullable|string|in:daftar,proses,validasi,tolak',

            // Validasi untuk alamat
            'address.alamat' => 'required|string|max:255',
            'address.rt' => 'nullable|integer',
            'address.rw' => 'nullable|integer',
            'address.province_code' => 'required|string|max:10',
            'address.province_name' => 'required|string|max:100',
            'address.regency_code' => 'required|string|max:10',
            'address.regency_name' => 'required|string|max:100',
            'address.district_code' => 'required|string|max:10',
            'address.district_name' => 'required|string|max:100',
            'address.village_code' => 'required|string|max:10',
            'address.village_name' => 'required|string|max:100',

            // Validasi untuk kontak
            'contact.handphone' => 'required|string|max:15|unique:official_contacts,handphone',
            'contact.email' => 'nullable|email|unique:official_contacts,email',

            // Validasi untuk identitas tambahan
            'identity.gol_darah' => 'nullable|string|max:2',
            'identity.pendidikan' => 'nullable|string|max:50',
            'identity.bpjs_kesehatan' => 'nullable|string|max:20|unique:official_identities,bpjs_kesehatan',
            'identity.bpjs_ketenagakerjaan' => 'nullable|string|max:20|unique:official_identities,bpjs_ketenagakerjaan',
            'identity.npwp' => 'nullable|string|max:20|unique:official_identities,npwp',

            // Validasi untuk studies
            'studies.*.study_id' => 'required|exists:studies,id',
            'studies.*.study_name' => 'required|string|max:100',
            'studies.*.nama_sekolah' => 'required|string|max:100',
            'studies.*.alamat_sekolah' => 'nullable|string|max:255',
            'studies.*.jurusan' => 'nullable|string|max:100',
            'studies.*.tahun_masuk' => 'required|integer',
            'studies.*.tahun_keluar' => 'nullable|integer',
            'studies.*.dokumen' => 'nullable|file|mimes:pdf,jpg,png|max:2048',

            // Validasi untuk positions
            'positions.*.position_id' => 'required|exists:positions,id',
            'positions.*.position_name' => 'required|string|max:100',
            'positions.*.penetap' => 'nullable|string|max:100',
            'positions.*.nomor_sk' => 'nullable|string|max:50',
            'positions.*.tanggal_sk' => 'nullable|date',
            'positions.*.mulai' => 'nullable|date',
            'positions.*.selesai' => 'nullable|date',
            'positions.*.keterangan' => 'nullable|string|max:255',
            'positions.*.file_sk' => 'nullable|file|mimes:pdf,jpg,png|max:2048',

            // Validasi untuk trainings
            'trainings.*.training_id' => 'required|exists:trainings,id',
            'trainings.*.training_title' => 'required|string|max:100',
            'trainings.*.nama' => 'nullable|string|max:100',
            'trainings.*.mulai' => 'nullable|date',
            'trainings.*.selesai' => 'nullable|date',
            'trainings.*.keterangan' => 'nullable|string|max:255',
            'trainings.*.doc_scan' => 'nullable|file|mimes:pdf,jpg,png|max:2048',

            // Validasi untuk organizations
            'organizations.*.organization_id' => 'required|exists:organizations,id',
            'organizations.*.organization_title' => 'required|string|max:100',
            'organizations.*.nama' => 'nullable|string|max:100',
            'organizations.*.posisi' => 'nullable|string|max:100',
            'organizations.*.keterangan' => 'nullable|string|max:255',
            'organizations.*.doc_scan' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        // Jika validasi gagal, kembalikan ke halaman sebelumnya dengan error
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator) // Kirim error validasi
                ->withInput(); // Pertahankan input yang sudah diisi
        }

        // Mulai transaksi database
        DB::beginTransaction();

        try {
            // Isi Village Id
            $village = Auth::user()->user_village->village;

            // Ambil data official dari request
            $officialData = $request->input('official');

            // Tambahkan village_id ke data official
            $officialData['village_id'] = $village->id;

            // Simpan data official ke tabel officials
            $official = Official::create($officialData);

            // Simpan data alamat ke tabel official_addresses
            $officialAddress = [
                'official_id' => $official->id,
                'alamat' => $request->input('address.alamat'),
                'rt' => $request->input('address.rt'),
                'rw' => $request->input('address.rw'),
                'province_code' => $request->input('address.province_code'),
                'province_name' => $request->input('address.province_name'),
                'regency_code' => $request->input('address.regency_code'),
                'regency_name' => $request->input('address.regency_name'),
                'district_code' => $request->input('address.district_code'),
                'district_name' => $request->input('address.district_name'),
                'village_code' => $request->input('address.village_code'),
                'village_name' => $request->input('address.village_name'),
            ];
            OfficialAddress::create($officialAddress);

            // Simpan data kontak ke tabel official_contacts
            $officialContact = [
                'official_id' => $official->id,
                'handphone' => $request->input('contact.handphone'),
                'email' => $request->input('contact.email') ?? null,
            ];
            OfficialContact::create($officialContact);

            // Simpan data identitas tambahan ke tabel official_identities
            $officialIdentity = [
                'official_id' => $official->id,
                'gol_darah' => $request->input('identity.gol_darah') ?? null,
                'pendidikan' => $request->input('identity.pendidikan') ?? null,
                'bpjs_kesehatan' => $request->input('identity.bpjs_kesehatan') ?? null,
                'bpjs_ketenagakerjaan' => $request->input('identity.bpjs_ketenagakerjaan') ?? null,
                'npwp' => $request->input('identity.npwp') ?? null,
            ];
            OfficialIdentity::create($officialIdentity);

            // Simpan data studies (pendidikan)
            $studies = $request->input('studies');
            foreach ($studies as $index => $study) {
                $study['official_id'] = $official->id; // Hubungkan dengan official

                // Simpan file dokumen jika ada
                if ($request->hasFile("studies.{$index}.dokumen")) {
                    $file = $request->file("studies.{$index}.dokumen");
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('public/uploads/studies', $fileName);
                    $study['dokumen'] = $fileName;
                }

                OfficialStudy::create($study);
            }

            // Simpan data positions (jabatan)
            $positions = $request->input('positions');
            foreach ($positions as $index => $position) {
                $position['official_id'] = $official->id; // Hubungkan dengan official

                // Simpan file SK jika ada
                if ($request->hasFile("positions.{$index}.file_sk")) {
                    $file = $request->file("positions.{$index}.file_sk");
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('public/uploads/positions', $fileName);
                    $position['file_sk'] = $fileName;
                }

                PositionOfficial::create($position);
            }

            // Simpan data trainings (pelatihan)
            $trainings = $request->input('trainings');
            foreach ($trainings as $index => $training) {
                $training['official_id'] = $official->id; // Hubungkan dengan official

                // Simpan file dokumen jika ada
                if ($request->hasFile("trainings.{$index}.doc_scan")) {
                    $file = $request->file("trainings.{$index}.doc_scan");
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('public/uploads/trainings', $fileName);
                    $training['doc_scan'] = $fileName;
                }

                OfficialTraining::create($training);
            }

            // Simpan data organizations (organisasi)
            $organizations = $request->input('organizations');
            foreach ($organizations as $index => $organization) {
                $organization['official_id'] = $official->id; // Hubungkan dengan official

                // Simpan file dokumen jika ada
                if ($request->hasFile("organizations.{$index}.doc_scan")) {
                    $file = $request->file("organizations.{$index}.doc_scan");
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('public/uploads/organizations', $fileName);
                    $organization['doc_scan'] = $fileName;
                }

                OfficialOrganization::create($organization);
            }

            // Commit transaksi jika semua berhasil
            DB::commit();

            // Redirect ke halaman index dengan pesan sukses
            return redirect()->route('village.official.index')->with('success', 'Data berhasil disimpan.');
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
        // Ambil data official berdasarkan ID
        $official = Official::with(['officialStudies', 'positionOfficial', 'officialTrainings', 'officialOrganizations'])
            ->where('nik', $id)
            ->firstOrFail();

        return Inertia::render('Village/Official/Show', [
            'official' => $official,
        ]);
    }

    public function edit($id)
    {
        // Ambil data official berdasarkan ID dengan relasi yang diperlukan
        $official = Official::where('nik', $id)
            ->with([
                'addresses', // Relasi alamat
                'contacts', // Relasi kontak
                'identities', // Relasi identitas
                'studies', // Relasi studi
                'positionOfficial', // Relasi posisi
                'officialTrainings', // Relasi pelatihan
                'officialOrganizations', // Relasi organisasi
            ])
            ->firstOrFail();

        // Ambil data posisi, pelatihan, dan organisasi untuk dropdown
        $opsPositions = Position::all();
        $opsTrainings = Training::all();
        $opsOrganizations = Organization::all();
        $opsStudies = Study::all();

        return Inertia::render('Village/Official/Update', [
            'official' => [
                'village_id' => $official->village_id,
                'nik' => $official->nik,
                'niad' => $official->niad,
                'nama_lengkap' => $official->nama_lengkap,
                'gelar_depan' => $official->gelar_depan,
                'gelar_belakang' => $official->gelar_belakang,
                'tempat_lahir' => $official->tempat_lahir,
                'tanggal_lahir' => $official->tanggal_lahir,
                'jenis_kelamin' => $official->jenis_kelamin,
                'status_perkawinan' => $official->status_perkawinan,
                'agama' => $official->agama,
            ],
            'addresses' => $official->addresses,
            'contacts' => $official->contacts,
            'identities' => $official->identities,
            'studies' => $official->studies,
            'positions' => $official->positionOfficial,
            'trainings' => $official->officialTrainings,
            'organizations' => $official->officialOrganizations,
            'opsPositions' => $opsPositions,
            'opsTrainings' => $opsTrainings,
            'opsOrganizations' => $opsOrganizations,
            'opsStudies' => $opsStudies,
        ]);
    }


    public function update(Request $request, $id)
    {
        // Validasi data yang diterima
        $validator = Validator::make($request->all(), [
            // Validasi untuk official
            'official.nik' => 'required|string|max:16',
            'official.niad' => 'required|string|max:20',
            'official.nama_lengkap' => 'required|string|max:100',
            'official.gelar_depan' => 'nullable|string|max:50',
            'official.gelar_belakang' => 'nullable|string|max:50',
            'official.tempat_lahir' => 'required|string|max:50',
            'official.tanggal_lahir' => 'required|date',
            'official.jenis_kelamin' => 'required|string|max:1|in:L,P',
            'official.status_perkawinan' => 'required|string|in:Belum Menikah,Menikah,Cerai,Duda,Janda',
            'official.agama' => 'nullable|string|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu',
            'official.status' => 'nullable|string|in:daftar,proses,validasi,tolak',

            // Validasi untuk alamat
            'address.alamat' => 'required|string|max:255',
            'address.rt' => 'nullable|integer',
            'address.rw' => 'nullable|integer',
            'address.province_code' => 'required|string|max:10',
            'address.province_name' => 'required|string|max:100',
            'address.regency_code' => 'required|string|max:10',
            'address.regency_name' => 'required|string|max:100',
            'address.district_code' => 'required|string|max:10',
            'address.district_name' => 'required|string|max:100',
            'address.village_code' => 'required|string|max:10',
            'address.village_name' => 'required|string|max:100',

            // Validasi untuk kontak
            'contact.handphone' => 'required|string|max:15',
            'contact.email' => 'nullable|email',

            // Validasi untuk identitas tambahan
            'identity.gol_darah' => 'nullable|string|max:2',
            'identity.pendidikan' => 'nullable|string|max:50',
            'identity.bpjs_kesehatan' => 'nullable|string|max:20',
            'identity.bpjs_ketenagakerjaan' => 'nullable|string|max:20',
            'identity.npwp' => 'nullable|string|max:20',

            // Validasi untuk studies
            'studies.*.study_id' => 'required|exists:studies,id',
            'studies.*.study_name' => 'required|string|max:100',
            'studies.*.nama_sekolah' => 'required|string|max:100',
            'studies.*.alamat_sekolah' => 'nullable|string|max:255',
            'studies.*.jurusan' => 'nullable|string|max:100',
            'studies.*.tahun_masuk' => 'required|integer',
            'studies.*.tahun_keluar' => 'nullable|integer',
            'studies.*.dokumen' => 'nullable',

            // Validasi untuk positions
            'positions.*.position_id' => 'required|exists:positions,id',
            'positions.*.position_name' => 'required|string|max:100',
            'positions.*.penetap' => 'nullable|string|max:100',
            'positions.*.nomor_sk' => 'nullable|string|max:50',
            'positions.*.tanggal_sk' => 'nullable|date',
            'positions.*.mulai' => 'nullable|date',
            'positions.*.selesai' => 'nullable|date',
            'positions.*.keterangan' => 'nullable|string|max:255',
            'positions.*.file_sk' => 'nullable',

            // Validasi untuk trainings
            'trainings.*.training_id' => 'required|exists:trainings,id',
            'trainings.*.training_title' => 'required|string|max:100',
            'trainings.*.nama' => 'nullable|string|max:100',
            'trainings.*.mulai' => 'nullable|date',
            'trainings.*.selesai' => 'nullable|date',
            'trainings.*.keterangan' => 'nullable|string|max:255',
            'trainings.*.doc_scan' => 'nullable',

            // Validasi untuk organizations
            'organizations.*.organization_id' => 'required|exists:organizations,id',
            'organizations.*.organization_title' => 'required|string|max:100',
            'organizations.*.nama' => 'nullable|string|max:100',
            'organizations.*.posisi' => 'nullable|string|max:100',
            'organizations.*.keterangan' => 'nullable|string|max:255',
            'organizations.*.doc_scan' => 'nullable',
        ]);

        // Jika validasi gagal, kembalikan ke halaman sebelumnya dengan error
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Mulai transaksi database
        DB::beginTransaction();

        try {
            // Ambil data official yang akan diupdate
            $official = Official::with(['addresses', 'contacts', 'identities', 'studies', 'positions', 'officialTrainings', 'officialOrganizations'])
                ->where('nik', $id)->firstOrFail();

            // Update data utama di tabel officials
            $official->update($request->input('official'));

            // Update data alamat di tabel official_addresses
            $official->addresses()->updateOrCreate(
                ['official_id' => $official->id],
                $request->input('address')
            );

            // Update data kontak di tabel official_contacts
            $official->contacts()->updateOrCreate(
                ['official_id' => $official->id],
                $request->input('contact')
            );

            // Update data identitas tambahan di tabel official_identities
            $official->identities()->updateOrCreate(
                ['official_id' => $official->id],
                $request->input('identity')
            );

            // Hapus data studies lama
            $official->studies()->delete();

            // Simpan data studies baru
            foreach ($request->input('studies', []) as $study) {
                $study['official_id'] = $official->id;
                OfficialStudy::create($study);
            }

            // Hapus data positions lama
            $official->positions()->delete();

            // Simpan data positions baru
            foreach ($request->input('positions', []) as $position) {
                $position['official_id'] = $official->id;
                PositionOfficial::create($position);
            }

            // Hapus data trainings lama
            $official->officialTrainings()->delete();

            // Simpan data trainings baru
            foreach ($request->input('trainings', []) as $training) {
                $training['official_id'] = $official->id;
                OfficialTraining::create($training);
            }

            // Hapus data organizations lama
            $official->officialOrganizations()->delete();

            // Simpan data organizations baru
            foreach ($request->input('organizations', []) as $organization) {
                $organization['official_id'] = $official->id;
                OfficialOrganization::create($organization);
            }

            // Commit transaksi jika semua berhasil
            DB::commit();

            // Redirect ke halaman index dengan pesan sukses
            return redirect()->route('village.official.index')->with('success', 'Data berhasil diperbarui.');
        } catch (\Exception $e) {
            dd($e);
            // Rollback transaksi jika terjadi error
            DB::rollBack();
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
    public function destroy(string $id)
    {
        // dd($id);
        //
        $official = Official::with(['addresses', 'contacts', 'identities', 'studies', 'positions', 'officialTrainings', 'officialOrganizations'])
            ->where('nik', $id)->firstOrFail();

            // Hapus Secara Berurutan
            $official->addresses()->delete();
            $official->contacts()->delete();
            $official->identities()->delete();
            $official->studies()->delete();
            $official->positions()->delete();
            $official->officialTrainings()->delete();
            $official->officialOrganizations()->delete();

            // Hapus Data Utama
            $official->delete();

            return redirect()->route('village.official.index')->with('success', 'Data berhasil dihapus.');
    }
}
