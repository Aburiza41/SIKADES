<?php

namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use App\Models\Official;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OfficialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    // Ambil regency dari user yang login
    $regency = Auth::user()->user_regency->regency;

    // Ambil semua village_id di bawah regency
    $villageIds = $regency->districts->flatMap(function ($district) {
        return $district->villages->pluck('id');
    })->toArray();

    // Debug request
    Log::info('Request parameters:', $request->all());

    // Query utama untuk officials dengan filter dan sorting
    $officials = Official::with(['village.district.regency'])
        ->whereIn('village_id', $villageIds) // Filter berdasarkan village_id di bawah regency
        ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                    ->orWhere('nik', 'like', '%' . $request->search . '%')
                    ->orWhere('niad', 'like', '%' . $request->search . '%');
            });
        })
        ->when($request->filled('filters'), function ($query) use ($request) {
            $query->whereHas('village', function ($q) use ($request) {
                $q->where('pendidikan', $request->filters); // Filter berdasarkan pendidikan
            });
        })
        ->orderBy(
            in_array($request->sort_field, ['id', 'nama_lengkap', 'nik', 'niad', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
            in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
        )
        ->paginate($request->per_page ?? 10);

    // Kembalikan data menggunakan Inertia
    return Inertia::render('Regency/Official/Page', [
        'officials' => [
            'current_page' => $officials->currentPage(),
            'data' => $officials->items(),
            'total' => $officials->total(),
            'per_page' => $officials->perPage(),
            'last_page' => $officials->lastPage(),
            'from' => $officials->firstItem(),
            'to' => $officials->lastItem(),
        ],
        'filters' => $request->filters, // Kirim filter yang aktif
        'sort' => $request->only(['sort_field', 'sort_direction']), // Kirim sorting yang aktif
        'search' => $request->search, // Kirim pencarian yang aktif
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
    /**
 * Update the specified resource in storage.
 */
public function update(Request $request, string $id, string $action)
{
    // Debugging
    // dd($request->all(), $id, $action);

    // Validasi $action, hanya bisa accept atau reject
    if (!in_array($action, ['accept', 'reject'])) {
        return response()->json(['message' => 'Invalid action'], 400);
    }

    // Ambil data official
    $official = Official::where('nik', $id)->firstOrFail();

    // Update status berdasarkan action
    switch ($action) {
        case 'accept':
            $official->status = 'validasi';
            break;
        case 'reject':
            $official->status = 'tolak';
            break;
    }

    // Simpan perubahan
    $official->save();

    // Kembalikan response dengan flash message
    return redirect()->back()->with('success', 'Official status updated successfully.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
