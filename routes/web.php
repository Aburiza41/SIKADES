<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

// All Role
use App\Http\Controllers\Web\All\PositionController as AllPositionController;

// Guest
use App\Http\Controllers\Web\Guest\BerandaController as GuestBerandaController;
use App\Http\Controllers\Web\Guest\ProfileController as GuestProfileController;
use App\Http\Controllers\Web\Guest\MemberController as GuestMemberController;

// Admin
use App\Http\Controllers\Web\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Web\Admin\OfficialController as AdminOfficialController;
use App\Http\Controllers\Web\Admin\OfficialExportController as AdminOfficialExportController;
use App\Http\Controllers\Web\Admin\OfficialImportController as AdminOfficialImportController;
use App\Http\Controllers\Web\Admin\AparatusController as AdminAparatusController;
use App\Http\Controllers\Web\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Web\Admin\TrainingController as AdminTrainingController;
use App\Http\Controllers\Web\Admin\UserController as AdminUserController;
// use App\Http\Controllers\Web\Admin\UserExportController as AdminUserExportController;
use App\Http\Controllers\Web\Admin\UserImportController as AdminUserImportController;

// Regency
use App\Http\Controllers\Web\Regency\DashboardController as RegencyDashboardController;
use App\Http\Controllers\Web\Regency\OfficialController as RegencyOfficialController;
use App\Http\Controllers\Web\Regency\AparatusController as RegencyAparatusController;
use App\Http\Controllers\Web\Regency\UserController as RegencyUserController;

// Village
use App\Http\Controllers\Web\Village\DashboardController as VillageDashboardController;
use App\Http\Controllers\Web\Village\OfficialController as VillageOfficialController;
use App\Http\Controllers\Web\Village\ProfileController as VillageProfileController;
use App\Http\Controllers\Web\Village\ProfileDescriptionController as VillageProfileDescriptionController;
use App\Http\Controllers\Web\Village\OfficialPositionController as VillageOfficialPositionController;
use App\Http\Controllers\Web\Village\OfficialTrainingController as VillageOfficialTrainingController;
use App\Http\Controllers\Web\Village\OfficialOrganizationController as VillageOfficialOrganizationController;

// Middleware
use App\Http\Middleware\Custom\AdminMiddleware;

// Export
use App\Exports\UsersExport;
use Maatwebsite\Excel\Excel;

// Test
Route::get('/test', function(Excel $excel) {
    // return $excel->download(new UsersExport, 'users.xlsx');
});

Route::name('guest.')->group(function () {

    // Beranda
    Route::name('beranda.')->controller(GuestBerandaController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    // Profile
    Route::prefix('/profile-village')->name('profile.')->controller(GuestProfileController::class)->group(function () {
        Route::get('/', 'index')->name('index');

        Route::get('/kabupaten', [GuestProfileController::class, 'getRegencies']);
        Route::get('/kecamatan/{regencyCode}', [GuestProfileController::class, 'getDistricts']);
        Route::get('/desa/{districtCode}', [GuestProfileController::class, 'getVillages']);
    });

    // Member
    Route::prefix('/member-list')->name('member.')->controller(GuestMemberController::class)->group(function () {
        Route::get('/', 'index')->name('index');

        Route::get('/kabupaten', [GuestMemberController::class, 'getRegencies']);
        Route::get('/kecamatan/{regencyCode}', [GuestMemberController::class, 'getDistricts']);
        Route::get('/desa/{districtCode}', [GuestMemberController::class, 'getVillages']);
    });
});

// Profile
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Data Jabatan
    Route::prefix('/position')->name('position.')->controller(AllPositionController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });
});



// Admin
Route::prefix('/admin')->name('admin.')->middleware('auth', AdminMiddleware::class)->group(function () {
    // Dashboard
    Route::prefix('/dashboard')->name('dashboard.')->controller(AdminDashboardController::class)->group(function () {
        Route::get('/', 'index')->name('index');

    });

    // Official
    // Route::prefix('/official')->name('official.')->controller(AdminOfficialController::class)->group(function () {
    //     Route::get('/', 'index')->name('index');
    //     Route::post('/', 'store')->name('store');
    //     Route::get('/{id}', 'show')->name('show');
    //     Route::put('/{id}', 'update')->name('update');
    //     Route::delete('/{id}', 'destroy')->name('destroy');
    // });

    Route::prefix('/official/{role}')->name('official.')->controller(AdminOfficialController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/store', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');

        Route::prefix('/export')->name('export.')->controller(AdminOfficialExportController::class)->group(function () {
            Route::get('/json', 'json')->name('json');
            Route::get('/excel', 'excel')->name('excel');
            Route::get('/pdf', 'pdf')->name('pdf');
        });

        Route::prefix('/import')->name('export.')->controller(AdminOfficialImportController::class)->group(function () {
            // Route::get('/json', 'json')->name('json');
            Route::post('/excel', 'excel')->name('excel');
            // Route::get('/pdf', 'pdf')->name('pdf');
        });
    });

    // Aparatus
    Route::prefix('/aparatus')->name('aparatus.')->controller(AdminAparatusController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/regency/{id}', [AdminAparatusController::class, 'regency'])->name('regency');
    });

    // Organization
    Route::prefix('/organization')->name('organization.')->controller(AdminOrganizationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    // Training
    Route::prefix('/training')->name('training.')->controller(AdminTrainingController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    // User
    Route::prefix('/user')->name('user.')->controller(AdminUserController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}/show', 'show')->name('show');
        Route::put('/{id}/update', 'update')->name('update');
        Route::delete('/{id}/delete', 'destroy')->name('destroy');

        Route::prefix('/import')->name('export.')->controller(AdminUserImportController::class)->group(function () {
            // Route::get('/json', 'json')->name('json');
            Route::post('/excel', 'excel')->name('excel');
            // Route::get('/pdf', 'pdf')->name('pdf');
        });
    });
});

// Regency
Route::prefix('/regency')->name('regency.')->group(function () {
    // Dashboard
    Route::prefix('/dashboard')->name('dashboard.')->controller(RegencyDashboardController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    // Official
    Route::prefix('/official')->name('official.')->controller(RegencyOfficialController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}/{action}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    // Aparatus
    Route::prefix('/aparatus')->name('aparatus.')->controller(RegencyAparatusController::class)->group(function () {
        Route::get('/', 'index')->name('index');

        // Ambil data Desa berdasarkan Kecamatan
        Route::get('/district/{district}', 'district')->name('district');
    });

    // User
    Route::prefix('/user')->name('user.')->controller(RegencyUserController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });
});

// Village
Route::prefix('/village')->name('village.')->group(function () {
    // Dashboard
    Route::prefix('/dashboard')->name('dashboard.')->controller(VillageDashboardController::class)->group(function () {
        Route::get('/', 'index')->name('index');
    });

    // Official
    // Route::prefix('/official')->name('official.')->controller(VillageOfficialController::class)->group(function () {
    //     Route::get('/', 'index')->name('index');
    //     Route::get('/create', 'create')->name('create');
    //     Route::post('/store', 'store')->name('store');
    //     Route::get('/{id}/show', 'show')->name('show');
    //     Route::get('/{id}/edit', 'edit')->name('edit');
    //     Route::post('/{id}/update', 'update')->name('update');
    //     Route::delete('/{id}/delete', 'destroy')->name('destroy');

    //     // Children Position Official
    //     Route::prefix('/position')->name('position.')->controller(VillageOfficialPositionController::class)->group(function () {
    //         Route::get('/', 'index')->name('index');
    //         Route::post('/store', 'store')->name('store');
    //     });

    //     // Children Training Official
    //     Route::prefix('/training')->name('training.')->controller(VillageOfficialTrainingController::class)->group(function () {
    //         Route::get('/', 'index')->name('index');
    //         Route::post('/store', 'store')->name('store');
    //     });

    //     // Children Organization Official
    //     Route::prefix('/organization')->name('organization.')->controller(VillageOfficialOrganizationController::class)->group(function () {
    //         Route::get('/', 'index')->name('index');
    //         Route::post('/store', 'store')->name('store');
    //     });
    // });

    Route::prefix('/official/{role}')->name('official.')->controller(VillageOfficialController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/store', 'store')->name('store');
        Route::get('/{id}', 'show')->name('show');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');

        // Route::prefix('/export')->name('export.')->controller(AdminOfficialExportController::class)->group(function () {
        //     Route::get('/json', 'json')->name('json');
        //     Route::get('/excel', 'excel')->name('excel');
        //     Route::get('/pdf', 'pdf')->name('pdf');
        // });

        // Route::prefix('/import')->name('export.')->controller(AdminOfficialImportController::class)->group(function () {
        //     // Route::get('/json', 'json')->name('json');
        //     Route::post('/excel', 'excel')->name('excel');
        //     // Route::get('/pdf', 'pdf')->name('pdf');
        // });

        // Children Position Official
        Route::prefix('/position')->name('position.')->controller(VillageOfficialPositionController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/store', 'store')->name('store');
        });

        // Children Training Official
        Route::prefix('/training')->name('training.')->controller(VillageOfficialTrainingController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/store', 'store')->name('store');
        });

        // Children Organization Official
        Route::prefix('/organization')->name('organization.')->controller(VillageOfficialOrganizationController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/store', 'store')->name('store');
        });
    });

    // Profile
    Route::prefix('/profile')->name('profile.')->group(function () {
        // Base Profile
        Route::controller(VillageProfileController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/{profileId}', 'show')->name('show');
            Route::post('/{profileId}', 'update')->name('update');
        });

        // Children Profile Description
        Route::prefix('/description')->name('description.')->controller(VillageProfileDescriptionController::class)->group(function () {
            Route::post('/store', 'store')->name('store');
            Route::post('/update/{descriptionId}', 'update')->name('update');
            Route::delete('/delete/{descriptionId}', 'destroy')->name('destroy');
        });
    });


    // Endpoint untuk mengambil data provinsi
    // Route::get('/bps/wilayah', function () {
    //     $response = Http::get('https://sig.bps.go.id/rest-bridging/getwilayah');
    //     return $response->json();
    // });
    Route::get('/bps/wilayah', function () {
        $client = new \GuzzleHttp\Client([
            'verify' => false, // Nonaktifkan SSL verification
            'timeout' => 30,
        ]);

        $response = $client->get('https://sig.bps.go.id/rest-bridging/getwilayah');

        return json_decode($response->getBody(), true);
    });

    // Endpoint untuk mengambil data kabupaten berdasarkan kode provinsi
    // Route::get('/bps/wilayah/kabupaten/{provinceCode}', function ($provinceCode) {
    //     $response = Http::get("https://sig.bps.go.id/rest-bridging/getwilayah?level=kabupaten&parent={$provinceCode}");
    //     return $response->json();
    // });
    Route::get('/bps/wilayah/kabupaten/{provinceCode}', function ($provinceCode) {
        // Buat instance Guzzle Client
        $client = new \GuzzleHttp\Client([
            'base_uri' => 'https://sig.bps.go.id',
            'timeout'  => 30, // Timeout 30 detik
            'verify' => false, // Nonaktifkan SSL verification (hati-hati di production)
        ]);

        try {
            // Lakukan request ke API BPS
            $response = $client->get('/rest-bridging/getwilayah', [
                'query' => [
                    'level' => 'kabupaten',
                    'parent' => $provinceCode
                ]
            ]);

            // Decode response JSON
            $data = json_decode($response->getBody(), true);

            return response()->json($data);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            // Handle error
            return response()->json([
                'error' => 'Gagal mengambil data kabupaten',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Endpoint untuk mengambil data kecamatan berdasarkan kode kabupaten
    // Route::get('/bps/wilayah/kecamatan/{regencyCode}', function ($regencyCode) {
    //     $response = Http::get("https://sig.bps.go.id/rest-bridging/getwilayah?level=kecamatan&parent={$regencyCode}");
    //     return $response->json();
    // });
    Route::get('/bps/wilayah/kecamatan/{regencyCode}', function ($regencyCode) {
        $client = new \GuzzleHttp\Client([
            'base_uri' => 'https://sig.bps.go.id',
            'timeout'  => 30,
            'verify' => false, // Nonaktifkan SSL verification (dev only)
        ]);

        try {
            $response = $client->get('/rest-bridging/getwilayah', [
                'query' => [
                    'level' => 'kecamatan',
                    'parent' => $regencyCode
                ]
            ]);

            return response()->json(
                json_decode($response->getBody(), true)
            );
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $statusCode = $e->getResponse() ? $e->getResponse()->getStatusCode() : 500;

            return response()->json([
                'error' => 'Gagal mengambil data kecamatan',
                'message' => $e->getMessage(),
                'code' => $statusCode
            ], $statusCode);
        }
    });

    // Endpoint untuk mengambil data desa berdasarkan kode kecamatan
    // Route::get('/bps/wilayah/desa/{districtCode}', function ($districtCode) {
    //     $response = Http::get("https://sig.bps.go.id/rest-bridging/getwilayah?level=desa&parent={$districtCode}");
    //     return $response->json();
    // });
    //     use GuzzleHttp\Client;
    // use GuzzleHttp\Exception\RequestException;

    Route::get('/bps/wilayah/desa/{districtCode}', function ($districtCode) {
        $client = new \GuzzleHttp\Client([
            'base_uri' => 'https://sig.bps.go.id',
            'timeout'  => 30,
            'verify' => false, // Nonaktifkan SSL verification (hanya untuk development)
        ]);

        try {
            $response = $client->get('/rest-bridging/getwilayah', [
                'query' => [
                    'level' => 'desa',
                    'parent' => $districtCode
                ],
                'headers' => [
                    'Accept' => 'application/json',
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            // Validasi response
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON response');
            }

            return response()->json($data);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $statusCode = $e->hasResponse() ? $e->getResponse()->getStatusCode() : 500;

            return response()->json([
                'error' => true,
                'message' => 'Gagal mengambil data desa',
                'detail' => $e->getMessage(),
                'code' => $statusCode
            ], $statusCode);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Terjadi kesalahan pemrosesan data',
                'detail' => $e->getMessage(),
                'code' => 500
            ], 500);
        }
    });
});

require __DIR__ . '/auth.php';
