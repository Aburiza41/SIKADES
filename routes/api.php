<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BpsController;
use App\Models\Village;
use App\Models\District;
use App\Models\Regency;
use App\Models\Official;
use App\Models\Study;
use App\Models\Position;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/provinces', [BpsController::class, 'getProvinces']);
Route::get('/regencies/{provinceId}', [BpsController::class, 'getRegencies']);
Route::get('/districts/{regencyId}', [BpsController::class, 'getDistricts']);
Route::get('/villages/{districtId}', [BpsController::class, 'getVillages']);

// API Statistik Desa
Route::get('/desa-stats', function (Request $request) {
    $request->validate([
        'kodebps' => 'required|string|size:10',
    ]);

    $village = Village::where('code_bps', $request->kodebps)->first();

    if (!$village) {
        return response()->json([
            'success' => false,
            'message' => 'Desa tidak ditemukan',
        ], 404);
    }

    $educationLevels = Study::pluck('name', 'id')->toArray();

    $stats = [
        'total_valid_officials' => Official::where('village_id', $village->id)
            ->where('status', 'validasi')
            ->count(),
        'by_status' => [
            'daftar' => Official::where('village_id', $village->id)
                ->where('status', 'daftar')
                ->count(),
            'proses' => Official::where('village_id', $village->id)
                ->where('status', 'proses')
                ->count(),
            'validasi' => Official::where('village_id', $village->id)
                ->where('status', 'validasi')
                ->count(),
            'tolak' => Official::where('village_id', $village->id)
                ->where('status', 'tolak')
                ->count(),
        ],
        'by_gender' => [
            'L' => Official::where('village_id', $village->id)
                ->where('status', 'validasi')
                ->where('jenis_kelamin', 'L')
                ->count(),
            'P' => Official::where('village_id', $village->id)
                ->where('status', 'validasi')
                ->where('jenis_kelamin', 'P')
                ->count(),
        ],
        'by_education' => collect($educationLevels)->mapWithKeys(function ($name, $id) use ($village) {
            return [$name => Official::where('village_id', $village->id)
                ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan', $id);
                })
                ->count()];
        })->toArray(),
        'total_positions' => Position::count(),
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'kode_bps' => $village->code_bps,
            'location' => [
                'regency' => $village->district->regency->only(['id', 'name', 'code_bps']),
                'district' => $village->district->only(['id', 'name', 'code_bps']),
                'village' => $village->only(['id', 'name', 'code_bps']),
            ],
            'statistics' => $stats,
            'last_updated' => now()->toDateTimeString()
        ]
    ]);
});

// API Statistik Kecamatan
Route::get('/kecamatan-stats', function (Request $request) {
    $request->validate([
        'kodebps' => 'required|string|size:6',
    ]);

    $district = District::where('code_bps', $request->kodebps)->first();

    if (!$district) {
        return response()->json([
            'success' => false,
            'message' => 'Kecamatan tidak ditemukan',
        ], 404);
    }

    $villages = $district->villages;
    $educationLevels = Study::pluck('name', 'id')->toArray();

    $stats = [
        'total_valid_officials' => Official::whereIn('village_id', $villages->pluck('id'))
            ->where('status', 'validasi')
            ->count(),
        'by_status' => [
            'daftar' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'daftar')
                ->count(),
            'proses' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'proses')
                ->count(),
            'validasi' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->count(),
            'tolak' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'tolak')
                ->count(),
        ],
        'by_gender' => [
            'L' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->where('jenis_kelamin', 'L')
                ->count(),
            'P' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->where('jenis_kelamin', 'P')
                ->count(),
        ],
        'by_education' => collect($educationLevels)->mapWithKeys(function ($name, $id) use ($villages) {
            return [$name => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan', $id);
                })
                ->count()];
        })->toArray(),
        'total_positions' => Position::count(),
        'total_villages' => $villages->count(),
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'kode_bps' => $district->code_bps,
            'location' => [
                'regency' => $district->regency->only(['id', 'name', 'code_bps']),
                'district' => $district->only(['id', 'name', 'code_bps']),
            ],
            'statistics' => $stats,
            'last_updated' => now()->toDateTimeString()
        ]
    ]);
});

// API Statistik Kabupaten
Route::get('/kabupaten-stats', function (Request $request) {
    $request->validate([
        'kodebps' => 'required|string|size:4',
    ]);

    $regency = Regency::where('code_bps', $request->kodebps)->first();

    if (!$regency) {
        return response()->json([
            'success' => false,
            'message' => 'Kabupaten tidak ditemukan',
        ], 404);
    }

    $districts = $regency->districts;
    $villages = $districts->flatMap->villages;
    $educationLevels = Study::pluck('name', 'id')->toArray();

    $stats = [
        'total_valid_officials' => Official::whereIn('village_id', $villages->pluck('id'))
            ->where('status', 'validasi')
            ->count(),
        'by_status' => [
            'daftar' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'daftar')
                ->count(),
            'proses' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'proses')
                ->count(),
            'validasi' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->count(),
            'tolak' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'tolak')
                ->count(),
        ],
        'by_gender' => [
            'L' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->where('jenis_kelamin', 'L')
                ->count(),
            'P' => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->where('jenis_kelamin', 'P')
                ->count(),
        ],
        'by_education' => collect($educationLevels)->mapWithKeys(function ($name, $id) use ($villages) {
            return [$name => Official::whereIn('village_id', $villages->pluck('id'))
                ->where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan', $id);
                })
                ->count()];
        })->toArray(),
        'total_positions' => Position::count(),
        'total_districts' => $districts->count(),
        'total_villages' => $villages->count(),
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'kode_bps' => $regency->code_bps,
            'location' => [
                'regency' => $regency->only(['id', 'name', 'code_bps']),
            ],
            'statistics' => $stats,
            'last_updated' => now()->toDateTimeString()
        ]
    ]);
});

// API Statistik Global
Route::get('/global-stats', function () {
    $educationLevels = Study::pluck('name', 'id')->toArray();

    $stats = [
        'total_regencies' => Regency::count(),
        'total_districts' => District::count(),
        'total_villages' => Village::count(),
        'total_valid_officials' => Official::where('status', 'validasi')->count(),
        'by_status' => [
            'daftar' => Official::where('status', 'daftar')->count(),
            'proses' => Official::where('status', 'proses')->count(),
            'validasi' => Official::where('status', 'validasi')->count(),
            'tolak' => Official::where('status', 'tolak')->count(),
        ],
        'by_gender' => [
            'L' => Official::where('jenis_kelamin', 'L')->count(),
            'P' => Official::where('jenis_kelamin', 'P')->count(),
        ],
        'by_education' => collect($educationLevels)->mapWithKeys(function ($name, $id) {
            return [$name => Official::where('status', 'validasi')
                ->whereHas('identities', function ($q) use ($id) {
                    $q->where('pendidikan', $id);
                })
                ->count()];
        })->toArray(),
        'total_positions' => Position::count(),
    ];

    return response()->json([
        'success' => true,
        'data' => [
            'statistics' => $stats,
            'last_updated' => now()->toDateTimeString()
        ]
    ]);
});
