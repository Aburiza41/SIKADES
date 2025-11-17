<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index()
    // {
    //     //
    //     $organizations = Organization::all();
    //     // dd($organizations);

    //     $official_organizations = OfficialOrganization::with(['organization', 'official'])->limit(100)->get();
    //     // dd($official_organizations);

    //     return Inertia::render('Admin/Organization/Page', [
    //         'organizations' => $organizations,
    //         'official_organizations' => $official_organizations
    //     ]);
    // }
    public function index(Request $request)
    {
        // Debug request
        Log::info('Request parameters:', $request->all());

        // Query utama untuk organizations dengan filter dan sorting
        $organizations = Organization::when($request->filled('search'), function ($query) use ($request) {
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
        return Inertia::render('Admin/Organization/Page', [
            'organizations' => [
                'current_page' => $organizations->currentPage(),
                'data' => $organizations->items(),
                'total' => $organizations->total(),
                'per_page' => $organizations->perPage(),
                'last_page' => $organizations->lastPage(),
                'from' => $organizations->firstItem(),
                'to' => $organizations->lastItem(),
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
        return Inertia::render('Admin/Organization/Form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255|unique:organizations,title',
            'description' => 'nullable|string',
        ]);

        Organization::create([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return redirect()->route('admin.organization.index')->with('success', 'Organization created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $organization = Organization::findOrFail($id);
        return Inertia::render('Admin/Organization/Show', [
            'organization' => $organization,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $organization = Organization::findOrFail($id);
        return Inertia::render('Admin/Organization/Form', [
            'organization' => $organization,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $organization = Organization::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255|unique:organizations,title,' . $id,
            'description' => 'nullable|string',
        ]);

        $organization->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return redirect()->route('admin.organization.index')->with('success', 'Organization updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $organization = Organization::findOrFail($id);
        $organization->delete();

        return redirect()->route('admin.organization.index')->with('success', 'Organization deleted successfully.');
    }
}
