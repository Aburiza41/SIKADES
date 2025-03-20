<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Regency;
use App\Models\District;
use App\Models\Village;

class SyncBpsData extends Command
{
    protected $signature = 'bps:sync';
    protected $description = 'Sinkronisasi data wilayah dari API BPS ke database lokal';

    public function handle()
    {
        $baseUrl = config('services.bps.base_url');
        $kodeProvinsiKalbar = config('services.bps.kode_provinsi', '61'); // Default to Kalimantan Barat

        $this->info('Memulai sinkronisasi data wilayah...');

        try {
            // Sinkronisasi kabupaten (hanya di Kalimantan Barat)
            $this->info('Mengambil data kabupaten...');
            $regencies = Http::get("{$baseUrl}?level=kabupaten&parent={$kodeProvinsiKalbar}")->json();
            if (empty($regencies)) {
                $this->error('Data kabupaten tidak ditemukan atau API tidak merespons.');
                return;
            }

            foreach ($regencies as $regency) {
                // Simpan atau perbarui data kabupaten
                $regencyModel = Regency::updateOrCreate(
                    ['code_bps' => $regency['kode_bps']],
                    [
                        'name_bps' => $regency['nama_bps'],
                        'code_dagri' => $regency['kode_dagri'] ?? null,
                        'name_dagri' => $regency['nama_dagri'] ?? null,
                    ]
                );

                // Sinkronisasi kecamatan (hanya di Kalimantan Barat)
                $this->info("Mengambil data kecamatan untuk kabupaten {$regency['nama_bps']}...");
                $districts = Http::get("{$baseUrl}?level=kecamatan&parent={$regency['kode_bps']}")->json();
                if (empty($districts)) {
                    $this->warn("Tidak ada data kecamatan untuk kabupaten {$regency['nama_bps']}.");
                    continue;
                }

                foreach ($districts as $district) {
                    // Simpan atau perbarui data kecamatan
                    $districtModel = District::updateOrCreate(
                        ['code_bps' => $district['kode_bps']],
                        [
                            'regency_id' => $regencyModel->id, // Gunakan ID kabupaten
                            'name_bps' => $district['nama_bps'],
                            'code_dagri' => $district['kode_dagri'] ?? null,
                            'name_dagri' => $district['nama_dagri'] ?? null,
                        ]
                    );

                    // Sinkronisasi desa (hanya di Kalimantan Barat)
                    $this->info("Mengambil data desa untuk kecamatan {$district['nama_bps']}...");
                    $villages = Http::get("{$baseUrl}?level=desa&parent={$district['kode_bps']}")->json();
                    if (empty($villages)) {
                        $this->warn("Tidak ada data desa untuk kecamatan {$district['nama_bps']}.");
                        continue;
                    }

                    foreach ($villages as $village) {
                        // Simpan atau perbarui data desa
                        Village::updateOrCreate(
                            ['code_bps' => $village['kode_bps']],
                            [
                                'district_id' => $districtModel->id, // Gunakan ID kecamatan
                                'name_bps' => $village['nama_bps'],
                                'code_dagri' => $village['kode_dagri'] ?? null,
                                'name_dagri' => $village['nama_dagri'] ?? null,
                            ]
                        );
                    }
                }
            }

            $this->info('Sinkronisasi data wilayah selesai.');
        } catch (\Exception $e) {
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
            Log::error('Gagal sinkronisasi data wilayah: ' . $e->getMessage());
        }
    }
}