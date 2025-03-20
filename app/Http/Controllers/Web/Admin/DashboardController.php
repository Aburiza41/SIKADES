<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Official;
use App\Models\Regency;
use App\Models\Study;
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
    public function index()
    {
        // Count Dari Total Data Tabel
        $regency = Regency::count();
        $district = District::count();
        $village = Village::count();
        // $official = Official::count();

// Ambil data pendidikan dari tabel studies
$educationLevels = Study::pluck('name', 'id')->toArray();

// Hitung total pejabat dengan status "validasi"
        $official = Official::where('status', 'validasi')
        ->count();

        // Status Pejabat
        $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
        $status_pejabat = array_map(function($status) {
            return Official::where('status', $status)->count();
        }, $statusOptions);

        // Jenis Kelamin
        $genderOptions = ['L', 'P'];
        $jenis_kelamin = array_map(function($gender) {
            return Official::where('jenis_kelamin', $gender)->count();
        }, $genderOptions);

        // Hitung total pejabat berdasarkan pendidikan dengan status "validasi"
        $pendidikan = [];
        foreach ($educationLevels as $id => $education) {
            $pendidikan[$education] = Official::where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan', $id);
                })
                ->count();
        }

        // Kirim data ke view
        return Inertia::render('Admin/Dashboard/Page', [
            'regency' => $regency,
            'district' => $district,
            'village' => $village,
            'official' => $official,
            'status_pejabat' => $status_pejabat,
            'jenis_kelamin' => $jenis_kelamin,
            'pendidikan' => $pendidikan,
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
