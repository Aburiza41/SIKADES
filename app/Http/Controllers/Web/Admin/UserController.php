<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Regency;
use App\Models\District;
use App\Models\UserDistrict;
use App\Models\UserRegency;
use App\Models\UserVillage;
use App\Models\Village;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Debug request
        // dd($request->filters);
        Log::info('Request parameters:', $request->all());

        // Get Regency data
        $regencies = Regency::all();

        // Get District data
        $districts = District::all();

        // Get Village data
        $villages = Village::all();

        // Query utama
        $users = User::with(['user_regency.regency', 'user_village.village'])->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%')
                ->orWhere('role', 'like', '%' . $request->search . '%');
            });
        })
        ->when($request->filled('filters'), function ($query) use ($request) {
            $query->where('role', $request->filters);
        })
        ->orderBy(
            in_array($request->sort_field, ['id', 'name', 'email', 'role', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
            in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
        )
        ->paginate($request->per_page ?? 10);

        // Kembalikan data menggunakan Inertia
        return Inertia::render('Admin/User/Page', [
            'initialUsers' => [
                'current_page' => $users->currentPage(),
                'data' => $users->items(),
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
            'filters' => $request->filters, // Kirim semua filter
            'sort' => $request->only(['sort_field', 'sort_direction']),
            'search' => $request->search,
            'regencies' => $regencies,
            'districts' => $districts,
            'villages' => $villages,
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
    // Validasi data input
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'role' => 'required|in:admin,regency,district,village',
        'regency_id' => 'nullable|exists:regencies,id|required_if:role,regency',
        'district_id' => 'nullable|exists:districts,id|required_if:role,district',
        'village_id' => 'nullable|exists:villages,id|required_if:role,village',
    ]);

    DB::beginTransaction();

    try {
        // Simpan data user ke database
        $user = User::create([
            'username' => $validated['name'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make('password'), // Default password
        ]);

        // Buat relasi berdasarkan role
        switch ($validated['role']) {
            case 'regency':
                UserRegency::create([
                    'user_id' => $user->id,
                    'regency_id' => $validated['regency_id'],
                ]);
                break;
            case 'district':
                UserDistrict::create([
                    'user_id' => $user->id,
                    'district_id' => $validated['district_id'],
                ]);
                break;
            case 'village':
                UserVillage::create([
                    'user_id' => $user->id,
                    'village_id' => $validated['village_id'],
                ]);
                break;
        }

        DB::commit();

        return redirect()->route('admin.user.index')
            ->with('success', 'User berhasil ditambahkan.');
    } catch (\Exception $e) {
        Log::error($e->getMessage());

        DB::rollBack();
        dd($e->getMessage());
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
    // Validasi data input
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $id,
        'role' => 'required|in:admin,regency,district,village',
        'regency_id' => 'nullable|exists:regencies,id',
        'district_id' => 'nullable|exists:districts,id',
        'village_id' => 'nullable|exists:villages,id',
    ]);

    // Jika validasi gagal
    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator) // Kirim error validasi
            ->withInput(); // Kirim kembali data input
    }

    // Temukan user berdasarkan ID
    $user = User::findOrFail($id);

    // Update data user
    $user->update([
        'name' => $request->name,
        'email' => $request->email,
        'role' => $request->role,
    ]);

    // Update atau buat data di tabel relasional berdasarkan role
    switch ($request->role) {
        case 'regency':
            // Update atau buat data di tabel user_regency
            $user->user_regency()->updateOrCreate(
                ['user_id' => $user->id],
                ['regency_id' => $request->regency_id]
            );
            // Hapus data di tabel user_district dan user_village jika ada
            $user->user_district()->delete();
            $user->user_village()->delete();
            break;

        case 'district':
            // Update atau buat data di tabel user_district
            $user->user_district()->updateOrCreate(
                ['user_id' => $user->id],
                ['district_id' => $request->district_id]
            );
            // Hapus data di tabel user_regency dan user_village jika ada
            $user->user_regency()->delete();
            $user->user_village()->delete();
            break;

        case 'village':
            // Update atau buat data di tabel user_village
            $user->user_village()->updateOrCreate(
                ['user_id' => $user->id],
                ['village_id' => $request->village_id]
            );
            // Hapus data di tabel user_regency dan user_district jika ada
            $user->user_regency()->delete();
            $user->user_district()->delete();
            break;

        default:
            // Jika role adalah admin, hapus semua data relasional
            $user->user_regency()->delete();
            $user->user_district()->delete();
            $user->user_village()->delete();
            break;
    }

    // Redirect dengan pesan sukses
    return redirect()->route('admin.user.index')
        ->with('success', 'User updated successfully.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
