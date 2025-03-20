<?php

namespace App\Http\Controllers\Web\Village;

use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Models\VillageDescription;
use App\Models\VillageIdm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get Village
        $village = Auth::user()->user_village->village;
        $village->load('district.regency');

        // Description Latest
        $descriptionLatest = $village->villageIdmLatest()->first();
        if ($descriptionLatest) {
            $descriptionLatest->load('village.district.regency');
        }
        // dd($descriptionLatest);

        // Query descriptions dengan pencarian
        $descriptions = VillageIdm::with(['village.district.regency'])
            ->where('village_id', $village->id) // Filter by village_id
            ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('score_idm', 'like', '%' . $request->search . '%')
                        ->orWhere('status_idm', 'like', '%' . $request->search . '%')
                        ->orWhere('score_prodeskel', 'like', '%' . $request->search . '%')
                        ->orWhere('score_epdeskel', 'like', '%' . $request->search . '%')
                        ->orWhere('status', 'like', '%' . $request->search . '%')
                        ->orWhere('classification', 'like', '%' . $request->search . '%')
                        ->orWhere('year', 'like', '%' . $request->search . '%');
                });
            })
            ->orderBy(
                in_array($request->sort_field, ['id', 'score_idm']) ? $request->sort_field : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'desc'
            )
            ->paginate($request->per_page ?? 10);

        return Inertia::render('Village/Profile/Page', [
            'village' => $village,
            'descriptionLatest' => $descriptionLatest,
            'descriptions' => [
                'current_page' => $descriptions->currentPage(),
                'data' => $descriptions->items(),
                'total' => $descriptions->total(),
                'per_page' => $descriptions->perPage(),
                'last_page' => $descriptions->lastPage(),
                'from' => $descriptions->firstItem(),
                'to' => $descriptions->lastItem(),
            ],
            'search' => $request->search, // Kirim nilai pencarian ke frontend
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validatedData = $request->validate([
            'description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048', // Tambahkan validasi logo
        ]);

        // Cari data berdasarkan ID
        $village = Village::findOrFail($id);

        // Jika ada file logo yang diunggah, hapus logo lama dan simpan yang baru
        if ($request->hasFile('logo')) {
            // Hapus logo lama jika ada
            if ($village->logo_path && Storage::disk('public')->exists($village->logo_path)) {
                Storage::disk('public')->delete($village->logo_path);
            }

            // Simpan logo baru
            $logoPath = $request->file('logo')->store('logos', 'public'); // Simpan di storage/app/public/logos
            $validatedData['logo_path'] = $logoPath; // Simpan path ke database
        } else {
            // Debugging: Log jika tidak ada file yang diupload
            Log::info('No logo file uploaded.');
        }
        // Debugging Logo Path

        // dd( $validatedData['logo_path']);

        // Perbarui data
        $village->update([
            'description' => $validatedData['description'],
            'website' => $validatedData['website'],
            'logo_path' => $validatedData['logo_path'], // Jika tidak ada file logo yang diunggah, gunakan path yang sudah ada
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diperbarui!',
            'data' => $village,
        ]);
    }
}
