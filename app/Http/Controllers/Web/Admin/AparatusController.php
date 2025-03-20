<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Regency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AparatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get Data Kecamatan
        $regencies = Regency::all();
        // dd($regencies);
        // dd(Auth::user()->hasAdmin());

        // Hitung Jumlah Kecamatan/District, Desa/Village, dan Pejabat/Offical dari setiap Kabupaten/Regency
        foreach ($regencies as $regency) {
            $districts = $regency->districts; // Ambil semua district dalam regency
            $villages = $districts->flatMap->villages; // Ambil semua villages dalam districts
            $officials = $villages->flatMap->officials; // Ambil semua officials dalam villages
            $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
            $statuses = array_map(function ($status) use ($officials) {
                return $officials->where('status', $status)->count();
            }, $statusOptions);

            // Push atau merge ke dalam array $regency
            $regency->districts_count = $districts->count();
            $regency->villages_count = $villages->count();
            $regency->officials_count = $officials->count();
            $regency->officials_statuses = $statuses;

        }
            // dd($regencies);

        return Inertia::render('Admin/Aparatus/Page', [
            'regencies' => $regencies
        ]);
    }

    public function regency (string $id)
    {
        // $regency = Auth::user()->user_regency->regency()->with([
        //     'districts.villages.officials'
        // ])->first();

        $regency = Regency::where('id', $id)->with([
            'districts.villages.officials'
        ])->first();
        // Get Data Kecamatan
        // $regencies = Regency::all();
        // dd($regencies);
        // dd(Auth::user()->hasAdmin());

        // Hitung Jumlah Kecamatan/District, Desa/Village, dan Pejabat/Offical dari setiap Kabupaten/Regency
        foreach ($regency->districts as $district) {
            // dd($district->villages);
            $villages = $district->villages; // Ambil semua villages dalam districts
            $officials = $villages->flatMap->officials; // Ambil semua officials dalam villages
            // dd($officials);
            $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
            $statuses = array_map(function ($status) use ($officials) {
                return $officials->where('status', $status)->count();
            }, $statusOptions);
            // dd($statuses);
            // Push atau merge ke dalam array $regency
            $district->villages_count = $villages->count();
            $district->officials_count = $officials->count();
            $district->officials_statuses = $statuses;

        }
            // dd($regency->districts);

        return Inertia::render('Regency/Aparatus/Page', [
            'districts' => $regency->districts
        ]);
    }
}
