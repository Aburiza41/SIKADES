<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Official;
use App\Models\Position;
use App\Models\Regency;
use App\Models\Study;
use App\Models\Village;
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
        // Ambil data desa yang terkait dengan user yang login
        $village = Auth::user()->user_village->village;
        $district = $village->district;
        $regency = $district->regency;

        // Ambil data pendidikan dari tabel studies
        $educationLevels = Study::pluck('name', 'id')->toArray();

        // Hitung total pejabat dengan status "validasi"
        $official = Official::where('village_id', $village->id)
            ->where('status', 'validasi')
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
                ->where('status', 'validasi')
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
                ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan_terakhir', $id); // Ubah 'pendidikan' menjadi 'pendidikan_terakhir'
                })
                ->count();
        }

        // Hitung total posisi
        $postions = Position::count();

        // Kirim data ke view
        return Inertia::render('Village/Dashboard/Page', [
            'regency' => $regency,
            'district' => $district,
            'village' => $village,
            'official' => $official,
            'status_pejabat' => $status_pejabat,
            'jenis_kelamin' => $jenis_kelamin,
            'pendidikan' => $pendidikan,
            'posisi' => $postions,
        ]);
    }
}
