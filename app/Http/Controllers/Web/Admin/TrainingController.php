<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TrainingController extends Controller
{
    /**
     * Display a listing of the resource.
     */

public function index(Request $request)
{
    // Debug request
    Log::info('Request parameters:', $request->all());

    // Query utama untuk trainings dengan filter dan sorting
    $trainings = Training::when($request->filled('search'), function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        })
        ->orderBy(
            in_array($request->sort_field, ['id', 'title', 'description', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
            in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
        )
        ->paginate($request->per_page ?? 10);

    // Kembalikan data menggunakan Inertia
    return Inertia::render('Admin/Training/Page', [
        'trainings' => [
            'current_page' => $trainings->currentPage(),
            'data' => $trainings->items(),
            'total' => $trainings->total(),
            'per_page' => $trainings->perPage(),
            'last_page' => $trainings->lastPage(),
            'from' => $trainings->firstItem(),
            'to' => $trainings->lastItem(),
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
        return Inertia::render('Admin/Training/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:trainings,title',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $data = $request->only(['title', 'description']);

            Training::create($data);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Pelatihan berhasil ditambahkan.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating training: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data.'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $training = Training::findOrFail($id);

        return Inertia::render('Admin/Training/Show', [
            'training' => $training,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $training = Training::findOrFail($id);

        return Inertia::render('Admin/Training/Edit', [
            'training' => $training,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $training = Training::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:trainings,title,' . $id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $data = $request->only(['title', 'description']);

            $training->update($data);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Pelatihan berhasil diperbarui.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error updating training: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui data.'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $training = Training::findOrFail($id);

        DB::beginTransaction();
        try {
            $training->delete();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Pelatihan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error deleting training: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data.'
            ], 500);
        }
    }
}
