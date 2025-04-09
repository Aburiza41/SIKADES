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
        // Gunakan eager loading untuk semua relasi
        $regencies = Regency::with(['districts.villages.officials'])->get();

        foreach ($regencies as $regency) {
            $districts = $regency->districts;
            $villages = $districts->flatMap->villages;
            $officials = $villages->flatMap->officials;

            $statusOptions = ['daftar', 'proses', 'validasi', 'tolak'];
            $statuses = array_map(function ($status) use ($officials) {
                return $officials->where('status', $status)->count();
            }, $statusOptions);

            $regency->districts_count = $districts->count();
            $regency->villages_count = $villages->count();
            $regency->officials_count = $officials->count();
            $regency->officials_statuses = $statuses;
        }
        // dd(($regencies));
        // dd($regencies->makeHidden(['districts', 'villages'])->toArray());
        // try {
        //     \Log::debug('Regencies Data:', $regencies->toArray());
        //     dd($regencies->first()); // Coba satu item saja
        // } catch (\Exception $e) {
        //     dd([
        //         'error' => $e->getMessage(),
        //         'trace' => $e->getTraceAsString()
        //     ]);
        // }

        // dd(\Log::debug($regencies->toArray()));
        // dd();
        // return Inertia::render('Admin/Aparatus/Page', [
        //     'regencies' => $regencies
        // ]);
        // Di controller
        return Inertia::render('Admin/Aparatus/Page', [
            'regencies' => $regencies->makeHidden(['districts', 'villages'])->toArray() // Konversi eksplisit
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
