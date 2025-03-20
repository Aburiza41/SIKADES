<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\VillageDescription;
use App\Models\VillageIdm;
use Illuminate\Http\Request;

class ProfileDescriptionController extends Controller
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
        // dd($request->all());
        // Validasi data
        $validatedData = $request->validate([
            'village_id' => 'required|exists:villages,id', // Harus ada dan valid di tabel villages
            'score_idm' => 'nullable|max:255',
            'status_idm' => 'nullable|max:255',
            'score_prodeskel' => 'nullable|max:255',
            'score_epdeskel' => 'nullable|max:255',
            'status' => 'nullable|max:255', // Status Pengembangan
            'classification' => 'nullable|string', // Klasifikasi (longText)
            'year' => 'required', // Tahun harus unik
        ], [
            // Custom error messages
            'village_id.required' => 'ID Desa wajib diisi.',
            'village_id.exists' => 'ID Desa tidak valid.',
            'year.required' => 'Tahun wajib diisi.',
            'year.unique' => 'Tahun sudah digunakan.',
            'score_idm.max' => 'Score IDM tidak boleh lebih dari 255 karakter.',
            'status_idm.max' => 'Status IDM tidak boleh lebih dari 255 karakter.',
            'score_prodeskel.max' => 'Score Prodeskel tidak boleh lebih dari 255 karakter.',
            'score_epdeskel.max' => 'Score Epdeskel tidak boleh lebih dari 255 karakter.',
            'status.max' => 'Status tidak boleh lebih dari 255 karakter.',
        ]);

        // Simpan data ke database
        VillageIdm::create($validatedData);

        // Redirect atau kembalikan response
        return redirect()->back()->with('success', 'Data berhasil disimpan!');
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
        // Validasi data
        $validatedData = $request->validate([
            'village_id' => 'required|exists:villages,id', // Harus ada dan valid di tabel villages
            'score_idm' => 'nullable|max:255',
            'status_idm' => 'nullable|max:255',
            'score_prodeskel' => 'nullable|max:255',
            'score_epdeskel' => 'nullable|max:255',
            'status' => 'nullable|max:255', // Status Pengembangan
            'classification' => 'nullable|string', // Klasifikasi (longText)
            'year' => 'required|string', // Tahun harus unik
        ], [
            // Custom error messages
            'village_id.required' => 'ID Desa wajib diisi.',
            'village_id.exists' => 'ID Desa tidak valid.',
            'year.required' => 'Tahun wajib diisi.',
            'year.unique' => 'Tahun sudah digunakan.',
            'score_idm.max' => 'Score IDM tidak boleh lebih dari 255 karakter.',
            'status_idm.max' => 'Status IDM tidak boleh lebih dari 255 karakter.',
            'score_prodeskel.max' => 'Score Prodeskel tidak boleh lebih dari 255 karakter.',
            'score_epdeskel.max' => 'Score Epdeskel tidak boleh lebih dari 255 karakter.',
            'status.max' => 'Status tidak boleh lebih dari 255 karakter.',
        ]);

        // Simpan data ke database
        VillageIdm::findOrFail($id)->update($validatedData);
        return redirect()->back()->with('success', 'Data berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Debugging
        // dd($id);
        // Hapus data dari database
        VillageIdm::destroy($id);

        // Redirect atau kembalikan response
        return redirect()->back()->with('success', 'Data berhasil dihapus!');
    }
}
