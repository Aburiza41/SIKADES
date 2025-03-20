<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BpsController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/provinces', [BpsController::class, 'getProvinces']);
Route::get('/regencies/{provinceId}', [BpsController::class, 'getRegencies']);
Route::get('/districts/{regencyId}', [BpsController::class, 'getDistricts']);
Route::get('/villages/{districtId}', [BpsController::class, 'getVillages']);