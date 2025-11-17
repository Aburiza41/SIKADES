<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Regency;
use App\Models\District;
use App\Models\Village;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Get all regencies for dropdown options.
     */
    public function getRegencies()
    {
        try {
            $regencies = Regency::select('id', 'name_bps')
                ->where('active', true)
                ->orderBy('name_bps')
                ->get()
                ->map(fn($regency) => [
                    'value' => $regency->id,
                    'label' => $regency->name_bps,
                ]);

            return response()->json([
                'success' => true,
                'data' => $regencies,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kabupaten.',
            ], 500);
        }
    }

    /**
     * Get districts, optionally filtered by regency_id, for dropdown options.
     */
    public function getDistricts(Request $request, $regency_id = null)
    {
        try {
            $districts = District::select('id', 'name_bps', 'regency_id')
                ->where('active', true)
                ->when($regency_id, fn($query) => $query->where('regency_id', $regency_id))
                ->orderBy('name_bps')
                ->get()
                ->map(fn($district) => [
                    'value' => $district->id,
                    'label' => $district->name_bps,
                ]);

            return response()->json([
                'success' => true,
                'data' => $districts,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kecamatan.',
            ], 500);
        }
    }

    /**
     * Get villages, optionally filtered by district_id, for dropdown options.
     */
    public function getVillages(Request $request, $district_id = null)
    {
        try {
            $villages = Village::select('id', 'name_bps', 'district_id')
                ->where('active', true)
                ->when($district_id, fn($query) => $query->where('district_id', $district_id))
                ->orderBy('name_bps')
                ->get()
                ->map(fn($village) => [
                    'value' => $village->id,
                    'label' => $village->name_bps,
                ]);

            return response()->json([
                'success' => true,
                'data' => $villages,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data desa.',
            ], 500);
        }
    }
}
