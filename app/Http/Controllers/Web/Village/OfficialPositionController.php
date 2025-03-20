<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OfficialPositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    // Validasi input
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255|unique:positions,name', // Pastikan nama posisi unik
        'description' => 'nullable|string|max:500', // Deskripsi opsional, maksimal 500 karakter
    ]);

    // Jika validasi gagal
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $validator->errors(),
        ], 422); // Kode status 422 untuk Unprocessable Entity
    }

    // Simpan data ke database
    try {
        $position = Position::create([
            'name' => $request->name,
            'description' => $request->description, // Tambahkan deskripsi
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Posisi berhasil ditambahkan',
            'data' => $position,
        ], 201); // Kode status 201 untuk Created
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal menambahkan posisi',
            'error' => $e->getMessage(),
        ], 500); // Kode status 500 untuk Internal Server Error
    }
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
