<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class BpsController extends Controller
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.bps.base_url');
    }

    // Ambil data provinsi
    public function getProvinces()
    {
        $response = Http::get("{$this->baseUrl}?level=provinsi");
        // dd($response);
        return response()->json($response->json());
    }

    // Ambil data kabupaten/kota berdasarkan kode provinsi
    public function getRegencies($provinceId)
    {
        $response = Http::get("{$this->baseUrl}?level=kabupaten&parent={$provinceId}");
        return response()->json($response->json());
    }

    // Ambil data kecamatan berdasarkan kode kabupaten/kota
    public function getDistricts($regencyId)
    {
        $response = Http::get("{$this->baseUrl}?level=kecamatan&parent={$regencyId}");
        return response()->json($response->json());
    }

    // Ambil data desa/kelurahan berdasarkan kode kecamatan
    public function getVillages($districtId)
    {
        $response = Http::get("{$this->baseUrl}?level=desa&parent={$districtId}");
        return response()->json($response->json());
    }
}