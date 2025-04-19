<?php

namespace App\Http\Controllers\Web\All;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Custom
use App\Models\Position;
use App\Http\Resources\PositionResource;

class PositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            // 1. Ambil semua posisi dengan paginasi (untuk menghindari overload data)
            // $positions = Position::paginate(10); // Ubah angka sesuai kebutuhan
            $positions = Position::all();

            // 2. Format respons menggunakan Resource untuk kontrol output JSON
            return PositionResource::collection($positions);
        } catch (\Exception $e) {
            // 3. Tangani error secara aman
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data posisi.',
                'error' => $e->getMessage(),
            ], 500); // HTTP status code 500 untuk server error
        }
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
