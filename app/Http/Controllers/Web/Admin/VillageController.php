<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Models\District;
use App\Models\Regency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class VillageController extends Controller
{
    /**
     * Display a listing of villages with filtering, sorting, and pagination.
     */
    public function index(Request $request)
    {
        Log::info('Request parameters:', $request->all());

        $villages = Village::with(['district.regency'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $search = $request->search;
                    $q->where('name_bps', 'like', "%{$search}%")
                      ->orWhere('name_dagri', 'like', "%{$search}%")
                      ->orWhere('code_bps', 'like', "%{$search}%")
                      ->orWhere('code_dagri', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('regency_id'), function ($query) use ($request) {
                $query->whereHas('district', function ($q) use ($request) {
                    $q->where('regency_id', $request->regency_id);
                });
            })
            ->when($request->filled('district_id'), function ($query) use ($request) {
                $query->where('district_id', $request->district_id);
            })
            ->orderBy(
                $request->sort_field && in_array($request->sort_field, ['id', 'district_id', 'name_bps', 'code'])
                    ? $request->sort_field
                    : 'id',
                $request->sort_direction && in_array(strtolower($request->sort_direction), ['asc', 'desc'])
                    ? strtolower($request->sort_direction)
                    : 'asc'
            )
            ->select('villages.id', 'villages.district_id', 'villages.name_bps', 'villages.code',
                     'villages.code_bps', 'villages.name_dagri', 'villages.code_dagri',
                     'villages.logo_path', 'villages.description', 'villages.website',
                     'villages.active')
            ->paginate($request->per_page ?? 10);

        return Inertia::render('Admin/Village/Page', [
            'initialVillages' => [
                'current_page' => $villages->currentPage(),
                'data' => $villages->items(),
                'total' => $villages->total(),
                'per_page' => $villages->perPage(),
                'last_page' => $villages->lastPage(),
                'from' => $villages->firstItem(),
                'to' => $villages->lastItem(),
            ],
            'sort' => $request->only(['sort_field', 'sort_direction']),
            'search' => $request->search,
            'filters' => $request->only(['regency_id', 'district_id']),
        ]);
    }

    /**
     * Get all regencies for dropdown options.
     */
    public function getRegencies()
    {
        try {
            $regencies = Regency::select('id', 'name_bps')
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
            Log::error('Error fetching regencies: ' . $e->getMessage());
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
            Log::error('Error fetching districts: ' . $e->getMessage());
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
            Log::error('Error fetching villages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data desa.',
            ], 500);
        }
    }

    /**
     * Store a newly created village in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'district_id' => 'required|exists:districts,id',
            'code_bps' => 'required|string|max:255|unique:villages,code_bps',
            'name_bps' => 'required|string|max:255',
            'code_dagri' => 'required|string|max:255|unique:villages,code_dagri',
            'name_dagri' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'description' => 'nullable|string',
            'website' => 'nullable|string|max:255|url',
            'active' => 'required|boolean',
            'code' => 'required|string|max:255|unique:villages,code',
        ]);

        DB::beginTransaction();

        try {
            $data = $validated;
            if ($request->hasFile('logo')) {
                $data['logo_path'] = $request->file('logo')->store('logos', 'public');
            }
            unset($data['logo']); // Remove logo from data as it's stored in logo_path
            Village::create($data);
            DB::commit();

            return redirect()->route('admin.village.index')
                ->with('success', 'Desa berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Error storing village: ' . $e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data.'])
                ->withInput();
        }
    }

    /**
     * Display the specified village.
     */
    public function show(string $id)
    {
        try {
            $village = Village::with(['district.regency'])
                ->select('id', 'district_id', 'code_bps', 'name_bps', 'code_dagri',
                        'name_dagri', 'logo_path', 'description', 'website', 'active', 'code')
                ->findOrFail($id);

            return Inertia::render('Admin/Village/Show', [
                'village' => $village,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching village: ' . $e->getMessage());
            return redirect()->route('admin.village.index')
                ->withErrors(['error' => 'Desa tidak ditemukan.']);
        }
    }

    /**
     * Show the form for editing the specified village.
     */
    public function edit(string $id)
    {
        try {
            $village = Village::with(['district.regency'])
                ->select('id', 'district_id', 'code_bps', 'name_bps', 'code_dagri',
                        'name_dagri', 'logo_path', 'description', 'website', 'active', 'code')
                ->findOrFail($id);

            return Inertia::render('Admin/Village/Edit', [
                'village' => $village,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching village for edit: ' . $e->getMessage());
            return redirect()->route('admin.village.index')
                ->withErrors(['error' => 'Desa tidak ditemukan.']);
        }
    }

    /**
     * Update the specified village in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'district_id' => 'required|exists:districts,id',
            'code_bps' => 'required|string|max:255|unique:villages,code_bps,' . $id,
            'name_bps' => 'required|string|max:255',
            'code_dagri' => 'required|string|max:255|unique:villages,code_dagri,' . $id,
            'name_dagri' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'description' => 'nullable|string',
            'website' => 'nullable|string|max:255|url',
            'active' => 'required|boolean',
            'code' => 'required|string|max:255|unique:villages,code,' . $id,
        ]);

        DB::beginTransaction();

        try {
            $village = Village::findOrFail($id);
            $data = $validated;
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($village->logo_path) {
                    Storage::disk('public')->delete($village->logo_path);
                }
                $data['logo_path'] = $request->file('logo')->store('logos', 'public');
            }
            unset($data['logo']);
            $village->update($data);
            DB::commit();

            return redirect()->route('admin.village.index')
                ->with('success', 'Desa berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating village: ' . $e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data.'])
                ->withInput();
        }
    }

    /**
     * Remove the specified village from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $village = Village::findOrFail($id);
            if ($village->officials()->exists() ||
                $village->villageDemographics()->exists() ||
                $village->villageEconomy()->exists() ||
                $village->villageInfrastructure()->exists() ||
                $village->villageEducation()->exists() ||
                $village->villageHealth()->exists() ||
                $village->villageEnvironment()->exists() ||
                $village->villageInstitution()->exists() ||
                $village->villageDevelopment()->exists() ||
                $village->villageIdm()->exists() ||
                $village->userVillages()->exists()) {
                return redirect()->back()
                    ->withErrors(['error' => 'Tidak dapat menghapus desa karena memiliki data terkait.']);
            }
            if ($village->logo_path) {
                Storage::disk('public')->delete($village->logo_path);
            }
            $village->delete();
            DB::commit();

            return redirect()->route('admin.village.index')
                ->with('success', 'Desa berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting village: ' . $e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data.']);
        }
    }


}
