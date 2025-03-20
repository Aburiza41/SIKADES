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
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // $regency = Auth::user()->user_regency->regency()->with([
        //     'districts.villages.officials'
        // ])->first();

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
        $users = User::with(['user_regency.regency', 'user_village.village'])
        ->where('role', '!=', 'admin')
        ->where('role', '!=', 'regency')
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
