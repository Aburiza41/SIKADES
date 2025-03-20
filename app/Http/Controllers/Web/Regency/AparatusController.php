<?php

namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use App\Models\Regency;
use App\Models\Village;
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
        $regency = Auth::user()->user_regency->regency()->with([
            'districts.villages.officials'
        ])->first();

        // $regency = Regency::where('id', $id)->with([
        //     'districts.villages.officials'
        // ])->first();
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

    /**
     * Show the form for creating a new resource.
     */
    public function district(string $id)
    {
        // Debugging
        // dd($id);

        // Ambil Semua Desa berdasarkan ID Kecamatan
        $villages = Village::where('district_id', $id)->get();
        // dd($villages);

        // Hitung Jumlah Kecamatan/District, Desa/Village, dan Pejabat/Offical dari setiap Kabupaten/Regency
        foreach ($villages as $village) {
            // dd($district->villages);
            // $villages = $district->villages; // Ambil semua villages dalam districts
            $officials = $village->officials; // Ambil semua officials dalam villages
            // dd($officials);
            $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
            $statuses = array_map(function ($status) use ($officials) {
                return $officials->where('status', $status)->count();
            }, $statusOptions);
            // dd($statuses);
            // Push atau merge ke dalam array $regency
            // $village->villages_count = $villages->count();
            $village->officials_count = $officials->count();
            $village->officials_statuses = $statuses;

        }
        // Return JSON
        // dd($villages);
        return Inertia::render('Regency/Aparatus/Show', [
            'villages' => $villages
        ]);
    }
}
