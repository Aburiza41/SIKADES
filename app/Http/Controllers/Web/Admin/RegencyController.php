<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Regency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RegencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Log::info('Request parameters:', $request->all());

        $regencies = Regency::when($request->filled('search'), function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('name_bps', 'like', '%' . $request->search . '%')
                  ->orWhere('name_dagri', 'like', '%' . $request->search . '%')
                  ->orWhere('code_bps', 'like', '%' . $request->search . '%')
                  ->orWhere('code_dagri', 'like', '%' . $request->search . '%');
            });
        })
        ->orderBy(
            in_array($request->sort_field, ['id', 'name_bps', 'name_dagri', 'code_bps', 'code_dagri', 'active', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
            in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
        )
        ->paginate($request->per_page ?? 10);

        return Inertia::render('Admin/Regency/Page', [
            'initialRegencies' => [
                'current_page' => $regencies->currentPage(),
                'data' => $regencies->items(),
                'total' => $regencies->total(),
                'per_page' => $regencies->perPage(),
                'last_page' => $regencies->lastPage(),
                'from' => $regencies->firstItem(),
                'to' => $regencies->lastItem(),
            ],
            'sort' => $request->only(['sort_field', 'sort_direction']),
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Regency/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code_bps' => 'required|string|max:255|unique:regencies,code_bps',
            'name_bps' => 'required|string|max:255',
            'code_dagri' => 'required|string|max:255|unique:regencies,code_dagri',
            'name_dagri' => 'required|string|max:255',
            'active' => 'required|boolean',
            'code' => 'required|string|max:255|unique:regencies,code',
        ]);

        DB::beginTransaction();

        try {
            Regency::create($validated);
            DB::commit();

            return redirect()->route('admin.regency.index')
                ->with('success', 'Regency berhasil ditambahkan.');
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
        $regency = Regency::with('districts')->findOrFail($id);

        return Inertia::render('Admin/Regency/Show', [
            'regency' => $regency,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $regency = Regency::findOrFail($id);

        return Inertia::render('Admin/Regency/Edit', [
            'regency' => $regency,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'code_bps' => 'required|string|max:255|unique:regencies,code_bps,' . $id,
            'name_bps' => 'required|string|max:255',
            'code_dagri' => 'required|string|max:255|unique:regencies,code_dagri,' . $id,
            'name_dagri' => 'required|string|max:255',
            'active' => 'required|boolean',
            'code' => 'required|string|max:255|unique:regencies,code,' . $id,
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        DB::beginTransaction();

        try {
            $regency = Regency::findOrFail($id);
            $regency->update($request->all());
            DB::commit();

            return redirect()->route('admin.regency.index')
                ->with('success', 'Regency berhasil diperbarui.');
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
            $regency = Regency::findOrFail($id);
            $regency->delete();
            DB::commit();

            return redirect()->route('admin.regency.index')
                ->with('success', 'Regency berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan saat menghapus data.']);
        }
    }
}
