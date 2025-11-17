<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Regency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DistrictController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Log::info('Request parameters:', $request->all());

        $districts = District::with('regency')
            ->when($request->filled('regency_id'), function ($query) use ($request) {
                $query->where('regency_id', $request->regency_id);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('name_bps', 'like', '%' . $request->search . '%')
                      ->orWhere('name_dagri', 'like', '%' . $request->search . '%')
                      ->orWhere('code_bps', 'like', '%' . $request->search . '%')
                      ->orWhere('code_dagri', 'like', '%' . $request->search . '%');
                });
            })
            ->orderBy(
                $request->sort_field && in_array($request->sort_field, ['id', 'regency_id', 'name_bps', 'name_dagri', 'code_bps', 'code_dagri', 'active', 'code', 'created_at', 'updated_at'])
                    ? $request->sort_field
                    : 'id',
                $request->sort_direction && in_array(strtolower($request->sort_direction), ['asc', 'desc'])
                    ? strtolower($request->sort_direction)
                    : 'asc'
            )
            ->paginate($request->per_page ?? 10);

        return Inertia::render('Admin/District/Page', [
            'initialDistricts' => [
                'current_page' => $districts->currentPage(),
                'data' => $districts->items(),
                'total' => $districts->total(),
                'per_page' => $districts->perPage(),
                'last_page' => $districts->lastPage(),
                'from' => $districts->firstItem(),
                'to' => $districts->lastItem(),
            ],
            'regencies' => Regency::select('id', 'name_bps')->where('active', true)->get(),
            'sort' => $request->only(['sort_field', 'sort_direction']),
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/District/Create', [
            'regencies' => Regency::select('id', 'name_bps')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'regency_id' => 'required|exists:regencies,id',
            'code_bps' => 'required|string|max:255|unique:districts,code_bps',
            'name_bps' => 'required|string|max:255',
            'code_dagri' => 'required|string|max:255|unique:districts,code_dagri',
            'name_dagri' => 'required|string|max:255',
            'active' => 'required|boolean',
            'code' => 'required|string|max:255|unique:districts,code',
        ]);

        DB::beginTransaction();

        try {
            District::create($validated);
            DB::commit();

            return redirect()->route('admin.district.index')
                ->with('success', 'Kecamatan berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data.'])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $district = District::with('regency')->findOrFail($id);

        return Inertia::render('Admin/District/Show', [
            'district' => $district,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $district = District::findOrFail($id);

        return Inertia::render('Admin/District/Edit', [
            'district' => $district,
            'regencies' => Regency::select('id', 'name_bps')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'regency_id' => 'required|exists:regencies,id',
            'code_bps' => 'required|string|max:255|unique:districts,code_bps,' . $id,
            'name_bps' => 'required|string|max:255',
            'code_dagri' => 'required|string|max:255|unique:districts,code_dagri,' . $id,
            'name_dagri' => 'required|string|max:255',
            'active' => 'required|boolean',
            'code' => 'required|string|max:255|unique:districts,code,' . $id,
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        DB::beginTransaction();

        try {
            $district = District::findOrFail($id);
            $district->update($request->all());
            DB::commit();

            return redirect()->route('admin.district.index')
                ->with('success', 'Kecamatan berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat memperbarui data.'])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $district = District::findOrFail($id);
            if ($district->villages()->exists()) {
                return redirect()->back()
                    ->withErrors(['error' => 'Tidak dapat menghapus kecamatan karena memiliki desa terkait.']);
            }
            $district->delete();
            DB::commit();

            return redirect()->route('admin.district.index')
                ->with('success', 'Kecamatan berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data.']);
        }
    }
}
