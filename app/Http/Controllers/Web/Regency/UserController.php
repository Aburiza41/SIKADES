<?php

namespace App\Http\Controllers\Web\Regency;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Regency;
use App\Models\User;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Ambil data regency beserta districts dan villages dari user yang terotentikasi
        $regency = Auth::user()->user_regency->regency()->with([
            'districts.villages.officials'
        ])->first();

        // Debug request
        Log::info('Request parameters:', $request->all());

        // Query utama
        $users = User::with(['user_regency.regency', 'user_village.village.district.regency'])
            ->where('role', 'village')
            ->when($request->has('search') && $request->search !== '', function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                        ->orWhere('email', 'like', '%' . $request->search . '%')
                        ->orWhere('role', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('filters'), function ($query) use ($request) {
                $query->where('role', $request->filters);
            })
            ->when($regency, function ($query) use ($regency) {
                $query->whereHas('user_village.village.district.regency', function ($q) use ($regency) {
                    $q->where('id', $regency->id); // Filter berdasarkan ID regency
                });
            })
            ->orderBy(
                in_array($request->sort_field, ['id', 'name', 'email', 'role', 'created_at', 'updated_at']) ? $request->sort_field : 'id',
                in_array(strtolower($request->sort_direction), ['asc', 'desc']) ? strtolower($request->sort_direction) : 'asc'
            )
            ->paginate($request->per_page ?? 10);

        // Kembalikan data menggunakan Inertia
        return Inertia::render('Regency/User/Page', [
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
            'regencies' => Regency::all(), // Mengembalikan semua regencies
            'districts' => District::all(), // Mengembalikan semua districts
            'villages' => Village::all(), // Mengembalikan semua villages
            'userRegency' => $regency, // Mengembalikan regency beserta districts dan villages dari user yang terotentikasi
        ]);
    }

    // 'regencies' => Regency::all(), // Mengembalikan semua regencies
    // 'districts' => District::all(), // Mengembalikan semua districts
    // 'villages' => Village::all(), // Mengembalikan semua villages

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

    /**
     * Reset password for a user.
     */
    public function resetPassword(Request $request, string $id)
    {
        // Check if the authenticated user has higher role
        $authUser = Auth::user();
        $userToReset = User::findOrFail($id);

        // Define role hierarchy (higher number = higher role)
        $roleHierarchy = [
            'village' => 1,
            'regency' => 2,
            'admin' => 3
        ];

        $authRoleLevel = $roleHierarchy[$authUser->role] ?? 0;
        $targetRoleLevel = $roleHierarchy[$userToReset->role] ?? 0;

        // Only allow reset if authenticated user has higher role
        if ($authRoleLevel <= $targetRoleLevel) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to reset this user\'s password.'
            ], 403);
        }

        // Generate new password
        $newPassword = Str::random(8);
        $userToReset->password = Hash::make($newPassword);
        $userToReset->save();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully.',
            'new_password' => $newPassword
        ]);
    }
}
