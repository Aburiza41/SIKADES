<?php

namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use App\Models\Official;
use App\Models\Position;
use App\Models\Study;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil regency dari user yang login
        $regency = Auth::user()->user_regency->regency;
        $districts = $regency->districts;
        $villages = $districts->flatMap->villages; // Mengumpulkan semua desa dalam satu array

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Hitung total pejabat dengan status "validasi"
        $official = Official::whereIn('village_id', $villages->pluck('id'))
            ->where('status', 'validasi')
            ->count();

        // Hitung total pejabat berdasarkan status
        $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
        $status_pejabat = array_map(function($status) use ($villages) {
            return Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', $status)
                ->count();
        }, $statusOptions);

        // Hitung total pejabat berdasarkan jenis kelamin dengan status "validasi"
        $genderOptions = ['L', 'P'];
        $jenis_kelamin = array_map(function($gender) use ($villages) {
            return Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->where('jenis_kelamin', $gender)
                ->count();
        }, $genderOptions);

        // Hitung total pejabat berdasarkan pendidikan dengan status "validasi"
        $pendidikan = [];
        foreach ($educationLevels as $id => $education) {
            $pendidikan[$education] = Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan', $id);
                })
                ->count();
        }

        // Hitung total posisi
        $postions = Position::count();

        // Kirim data ke view
        return Inertia::render('Regency/Dashboard/Page', [
            'regency' => $regency->name_bps,
            'district' => $districts->count(),
            'village' => $villages->count(),
            'official' => $official,
            'status_pejabat' => $status_pejabat,
            'jenis_kelamin' => $jenis_kelamin,
            'pendidikan' => $pendidikan,
            'posisi' => $postions,
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
