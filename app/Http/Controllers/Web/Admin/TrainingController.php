<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\OfficialTraining;
use App\Models\Training;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TrainingController extends Controller
{
    /**
     * Display a listing of the resource.
     */

public function index(Request $request)
{
    // Debug request
    Log::info('Request parameters:', $request->all());

    // Get all trainings untuk dropdown filter
    $trainings = Training::all();

    // Query utama untuk official_trainings dengan filter dan sorting
    $official_trainings = OfficialTraining::with(['official.village.district.regency', 'training', 'official'])
        ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('training', function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%');
                })
                ->orWhere('nama', 'like', '%' . $request->search . '%');
            });
        })
        ->when($request->filled('filters'), function ($query) use ($request) {
            $query->whereHas('training', function ($q) use ($request) {
                $q->where('id', $request->filters); // Filter berdasarkan ID training
            });
        })
        ->orderBy(
            in_array($request->sort_field, ['id', 'nama', 'mulai', 'selesai', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
            in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
        )
        ->paginate($request->per_page ?? 10);

    // Kembalikan data menggunakan Inertia
    return Inertia::render('Admin/Training/Page', [
        'trainings' => $trainings, // Data untuk dropdown filter
        'official_trainings' => [
            'current_page' => $official_trainings->currentPage(),
            'data' => $official_trainings->items(),
            'total' => $official_trainings->total(),
            'per_page' => $official_trainings->perPage(),
            'last_page' => $official_trainings->lastPage(),
            'from' => $official_trainings->firstItem(),
            'to' => $official_trainings->lastItem(),
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
