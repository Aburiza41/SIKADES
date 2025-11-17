<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PositionController extends Controller
{
    /**
     * Validasi rules untuk store dan update
     */
    protected function validationRules($id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'slug')->ignore($id)
            ],
            'description' => 'required|string|max:255',
            'min' => 'required|integer|min:0',
            'max' => 'required|integer|min:1|gt:min',
            'level' => 'required|integer|min:1|max:99',
            'parent_id' => 'nullable|exists:positions,id',
            'keterangan' => 'nullable|string',
        ];
    }

    /**
     * Field yang diizinkan untuk mass assignment
     */
    protected function allowedFields(): array
    {
        return [
            'name',
            'slug',
            'description',
            'min',
            'max',
            'level',
            'parent_id',
            'keterangan'
        ];
    }

    /**
     * Field yang diizinkan untuk sorting
     */
    protected function sortableFields(): array
    {
        return [
            'id', 'name', 'slug', 'description', 'level',
            'min', 'max', 'created_at', 'updated_at'
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Log::debug('Position index request', $request->all());

        $perPage = $request->per_page ?? 10;
        $sortField = in_array($request->sort_field, $this->sortableFields())
            ? $request->sort_field
            : 'id';
        $sortDirection = in_array(strtolower($request->sort_direction), ['asc', 'desc'])
            ? strtolower($request->sort_direction)
            : 'asc';

        $positions = Position::with('parent')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        return Inertia::render('Admin/Position/Page', [
            'positions' => $positions,
            'filters' => $request->only(['search', 'sort_field', 'sort_direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentPositions = Position::where('level', '<', 3)->get();

        return Inertia::render('Admin/Position/Create', [
            'parent_positions' => $parentPositions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->validationRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            Position::create($request->only($this->allowedFields()));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jabatan berhasil ditambahkan.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error creating position: ' . $e->getMessage());

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
        $position = Position::with(['parent', 'children'])->findOrFail($id);

        return Inertia::render('Admin/Position/Show', [
            'position' => $position,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $position = Position::findOrFail($id);
        $parentPositions = Position::where('level', '<', 3)
            ->where('id', '!=', $id)
            ->get();

        return Inertia::render('Admin/Position/Edit', [
            'position' => $position,
            'parent_positions' => $parentPositions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $position = Position::findOrFail($id);

        $validator = Validator::make($request->all(), $this->validationRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            $position->update($request->only($this->allowedFields()));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jabatan berhasil diperbarui.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error updating position: ' . $e->getMessage());

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
        $position = Position::findOrFail($id);

        DB::beginTransaction();

        try {
            $position->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jabatan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error deleting position: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data.'
            ], 500);
        }
    }
}
